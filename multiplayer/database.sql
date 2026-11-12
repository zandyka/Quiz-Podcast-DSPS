-- Coffee Bean Challenge: install once in Supabase SQL Editor.
-- The question's answer key remains ONLY in database tables, never in the browser.
create extension if not exists pgcrypto;
create schema if not exists coffee_private;

create table if not exists coffee_private.rooms (
 id uuid primary key default gen_random_uuid(),
 code text not null unique,
 host_name text not null,
 host_token text not null,
 status text not null default 'waiting' check (status in ('waiting','playing','finished')),
 started_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists coffee_private.beans (
 id smallint primary key check (id between 1 and 8),
 label text not null,
 correct boolean not null
);
insert into coffee_private.beans (id,label,correct) values
 (1,'Tanah vulkanik kaya unsur hara seperti kalium dan magnesium',true),
 (2,'Ditanam di atas 1.000 mdpl sehingga pematangan buah lebih lambat',true),
 (3,'Pemetikan selektif hanya pada buah kopi yang merah segar',true),
 (4,'Penerapan double sortasi dan fermentasi alami selama 12–36 jam',true),
 (5,'Memetik semua buah kopi tanpa memperhatikan tingkat kematangan',false),
 (6,'Mempercepat pematangan buah untuk menghilangkan seluruh keasaman',false),
 (7,'Mengolah biji tanpa sortasi untuk menghasilkan rasa yang konsisten',false),
 (8,'Tanah miskin unsur hara membuat biji kopi lebih manis',false)
on conflict (id) do update set label=excluded.label, correct=excluded.correct;

create table if not exists coffee_private.players (
 id uuid primary key default gen_random_uuid(),
 room_id uuid not null references coffee_private.rooms(id) on delete cascade,
 name text not null,
 token text not null unique,
 joined_at timestamptz not null default now(),
 finished_at timestamptz,
 bonus_awarded boolean not null default false,
 entity text not null default '—'
);
-- Aman untuk instalasi lama: tambahkan kolom tanpa menghapus data peserta.
alter table coffee_private.players add column if not exists entity text not null default '—';
create index if not exists coffee_players_room_idx on coffee_private.players(room_id);
create table if not exists coffee_private.reveals (
 player_id uuid not null references coffee_private.players(id) on delete cascade,
 bean_id smallint not null references coffee_private.beans(id),
 revealed_at timestamptz not null default now(),
 primary key(player_id, bean_id)
);
create table if not exists coffee_private.throws (
 player_id uuid not null references coffee_private.players(id) on delete cascade,
 bean_id smallint not null references coffee_private.beans(id),
 correct boolean not null,
 points int not null,
 created_at timestamptz not null default now(),
 primary key(player_id, bean_id)
);

-- Helper: apply automatic expiry, so nobody can play after countdown reaches zero.
create or replace function coffee_private.expire_room(p_room uuid)
returns void language sql security definer set search_path = '' as $$
 update coffee_private.rooms set status='finished'
 where id=p_room and status='playing' and ends_at<=now();
$$;

create or replace function public.coffee_create_game(p_host_name text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_code text; v_token text := encode(gen_random_bytes(24),'hex'); v_id uuid; i integer;
begin
 if length(trim(coalesce(p_host_name,''))) not between 1 and 40 then
  raise exception 'Nama host harus 1–40 karakter';
 end if;
 for i in 1..12 loop
  v_code := upper(encode(gen_random_bytes(3),'hex'));
  insert into coffee_private.rooms(code,host_name,host_token)
  values (v_code,trim(p_host_name),v_token)
  on conflict (code) do nothing returning id into v_id;
  exit when v_id is not null;
 end loop;
 if v_id is null then raise exception 'Gagal membuat kode room, coba lagi'; end if;
 return jsonb_build_object('code',v_code,'host_token',v_token);
end;
$$;

drop function if exists public.coffee_join_game(text,text);
create or replace function public.coffee_join_game(p_code text,p_name text,p_entity text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_room coffee_private.rooms%rowtype; v_id uuid; v_token text;
begin
 if length(trim(coalesce(p_name,''))) not between 2 and 80 then
  raise exception 'Nama lengkap harus 2–80 karakter'; end if;
 if length(trim(coalesce(p_entity,''))) not between 2 and 100 then
  raise exception 'Entitas harus 2–100 karakter'; end if;
 select * into v_room from coffee_private.rooms where code=upper(trim(p_code));
 if not found then raise exception 'Kode room tidak ditemukan'; end if;
 perform coffee_private.expire_room(v_room.id);
 if v_room.status<>'waiting' then raise exception 'Room sudah mulai atau ditutup'; end if;
 v_token := encode(gen_random_bytes(24),'hex');
 insert into coffee_private.players(room_id,name,entity,token) values(v_room.id,trim(p_name),trim(p_entity),v_token)
 returning id into v_id;
 return jsonb_build_object('code',v_room.code,'player_id',v_id,'player_token',v_token);
end;
$$;

create or replace function public.coffee_start_game(p_code text,p_host_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r coffee_private.rooms%rowtype; v_n int;
begin
 select * into r from coffee_private.rooms where code=upper(trim(p_code)) for update;
 if not found or r.host_token is distinct from p_host_token then raise exception 'Akses host tidak valid'; end if;
 if r.status<>'waiting' then raise exception 'Game sudah dimulai'; end if;
 select count(*) into v_n from coffee_private.players where room_id=r.id;
 if v_n=0 then raise exception 'Belum ada pemain yang bergabung'; end if;
 update coffee_private.rooms set status='playing',started_at=now(),ends_at=now()+interval '90 seconds' where id=r.id;
 return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.coffee_finish_game(p_code text,p_host_token text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r coffee_private.rooms%rowtype;
begin
 select * into r from coffee_private.rooms where code=upper(trim(p_code)) for update;
 if not found or r.host_token is distinct from p_host_token then raise exception 'Akses host tidak valid'; end if;
 update coffee_private.rooms set status='finished' where id=r.id;
 return jsonb_build_object('ok',true);
end;
$$;

create or replace function public.coffee_reveal_bean(p_code text,p_player_token text,p_bean_id smallint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r coffee_private.rooms%rowtype; p coffee_private.players%rowtype; b coffee_private.beans%rowtype;
begin
 select * into r from coffee_private.rooms where code=upper(trim(p_code));
 if not found then raise exception 'Room tidak ditemukan'; end if;
 perform coffee_private.expire_room(r.id);
 if not (r.status='playing' and r.ends_at>now()) then raise exception 'Waktu bermain sudah habis'; end if;
 select * into p from coffee_private.players where room_id=r.id and token=p_player_token;
 if not found then raise exception 'Identitas pemain tidak valid'; end if;
 select * into b from coffee_private.beans where id=p_bean_id;
 if not found then raise exception 'Biji kopi tidak ditemukan'; end if;
 insert into coffee_private.reveals(player_id,bean_id) values(p.id,b.id) on conflict do nothing;
 return jsonb_build_object('id',b.id,'label',b.label);
end;
$$;

create or replace function public.coffee_throw_bean(p_code text,p_player_token text,p_bean_id smallint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r coffee_private.rooms%rowtype; p coffee_private.players%rowtype;
 b coffee_private.beans%rowtype; v_existing coffee_private.throws%rowtype;
 v_correct integer; v_points integer; v_total integer; v_bonus boolean:=false;
begin
 select * into r from coffee_private.rooms where code=upper(trim(p_code)) for update;
 if not found then raise exception 'Room tidak ditemukan'; end if;
 perform coffee_private.expire_room(r.id);
 select * into r from coffee_private.rooms where id=r.id;
 if not (r.status='playing' and r.ends_at>now()) then raise exception 'Waktu bermain sudah habis'; end if;
 -- Serializes submissions from the same player, preventing double bonuses.
 select * into p from coffee_private.players where room_id=r.id and token=p_player_token for update;
 if not found then raise exception 'Identitas pemain tidak valid'; end if;
 if not exists(select 1 from coffee_private.reveals where player_id=p.id and bean_id=p_bean_id)
 then raise exception 'Buka bijinya terlebih dahulu'; end if;
 select * into b from coffee_private.beans where id=p_bean_id;
 if not found then raise exception 'Biji kopi tidak ditemukan'; end if;
 select * into v_existing from coffee_private.throws where player_id=p.id and bean_id=b.id;
 if found then raise exception 'Biji ini sudah dimasukkan'; end if;
 v_points := case when b.correct then 100 else -50 end;
 insert into coffee_private.throws(player_id,bean_id,correct,points) values(p.id,b.id,b.correct,v_points);
 select count(*) into v_correct from coffee_private.throws where player_id=p.id and correct;
 if v_correct=4 and not p.bonus_awarded then
  update coffee_private.players set bonus_awarded=true,finished_at=now() where id=p.id;
  update coffee_private.rooms set status='finished',ends_at=now() where id=r.id;
  v_bonus:=true;
 end if;
 select coalesce(sum(points),0) into v_total from coffee_private.throws where player_id=p.id;
 if v_correct=4 then v_total:=v_total+100; end if;
 return jsonb_build_object('correct',b.correct,'points',v_points,'bonus',v_bonus,
  'score',v_total,'correct_count',v_correct);
end;
$$;

create or replace function public.coffee_game_state(p_code text,p_player_token text default null,p_host_token text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r coffee_private.rooms%rowtype; p coffee_private.players%rowtype;
 v_host boolean; v_players jsonb; v_beans jsonb; v_entries jsonb; v_score int; v_correct int;
begin
 select * into r from coffee_private.rooms where code=upper(trim(p_code));
 if not found then raise exception 'Room tidak ditemukan'; end if;
 perform coffee_private.expire_room(r.id);
 select * into r from coffee_private.rooms where id=r.id;
 v_host := p_host_token is not null and p_host_token=r.host_token;
 if not v_host then
  select * into p from coffee_private.players where room_id=r.id and token=p_player_token;
  if not found then raise exception 'Identitas pemain tidak valid'; end if;
 end if;
 -- Host sees participant list and live rankings. Players see only their own state.
 if v_host then
  select coalesce(jsonb_agg(to_jsonb(t) order by t.score desc,t.correct_count desc,t.finished_at asc nulls last,t.joined_at asc),'[]'::jsonb)
  into v_players from (
   select pl.name,pl.entity,pl.id,pl.joined_at,pl.finished_at,
     coalesce(sum(th.points),0)::int+(case when pl.bonus_awarded then 100 else 0 end) as score,
     count(*) filter(where th.correct)::int as correct_count,
     count(th.bean_id)::int as thrown_count
   from coffee_private.players pl left join coffee_private.throws th on th.player_id=pl.id
   where pl.room_id=r.id
   group by pl.id
  ) t;
 else v_players:='[]'::jsonb; end if;
 if not v_host then
  select coalesce(jsonb_agg(jsonb_build_object('id',b.id,'label',b.label,'thrown',th.bean_id is not null,
    'correct',case when th.bean_id is null then null else th.correct end)
    order by b.id),'[]'::jsonb) into v_beans
  from coffee_private.reveals rv join coffee_private.beans b on b.id=rv.bean_id
  left join coffee_private.throws th on th.bean_id=b.id and th.player_id=rv.player_id
  where rv.player_id=p.id;
  select coalesce(sum(th.points),0)::int,
         count(*) filter(where th.correct)::int
   into v_score,v_correct from coffee_private.throws th where th.player_id=p.id;
  -- Above aggregate always returns one row even when no throws.
  v_score:=coalesce(v_score,0)+(case when p.bonus_awarded then 100 else 0 end);
 else
  v_beans:='[]'::jsonb;v_score:=null;v_correct:=null;
 end if;
 return jsonb_build_object('code',r.code,'status',r.status,'host_name',r.host_name,
  'started_at',r.started_at,'ends_at',r.ends_at,'duration',90,
  'players',v_players,'player_count',(select count(*) from coffee_private.players where room_id=r.id),
  'beans',v_beans,'score',v_score,'correct_count',v_correct,
  'name',case when v_host then r.host_name else p.name end,
  'entity',case when v_host then null else p.entity end,
  'is_host',v_host);
end;
$$;

-- Remove default exposure of internal tables, including through the REST API.
revoke all on schema coffee_private from public,anon,authenticated;
revoke all on all tables in schema coffee_private from public,anon,authenticated;
revoke all on all sequences in schema coffee_private from public,anon,authenticated;
-- Expose ONLY the six entrypoint RPCs. They validate host and player secrets.
revoke all on function public.coffee_create_game(text) from public;
revoke all on function public.coffee_join_game(text,text,text) from public;
revoke all on function public.coffee_start_game(text,text) from public;
revoke all on function public.coffee_finish_game(text,text) from public;
revoke all on function public.coffee_reveal_bean(text,text,smallint) from public;
revoke all on function public.coffee_throw_bean(text,text,smallint) from public;
revoke all on function public.coffee_game_state(text,text,text) from public;
grant execute on function public.coffee_create_game(text) to anon,authenticated;
grant execute on function public.coffee_join_game(text,text,text) to anon,authenticated;
grant execute on function public.coffee_start_game(text,text) to anon,authenticated;
grant execute on function public.coffee_finish_game(text,text) to anon,authenticated;
grant execute on function public.coffee_reveal_bean(text,text,smallint) to anon,authenticated;
grant execute on function public.coffee_throw_bean(text,text,smallint) to anon,authenticated;
grant execute on function public.coffee_game_state(text,text,text) to anon,authenticated;
