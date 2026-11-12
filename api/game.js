// api/game.js - Vercel Serverless Function / Node.js handler
// Mengelola state permainan, 2 tipe user (Host & Peserta), pengatur skor, dan leaderboard.

const crypto = require('crypto');

// In-memory rooms cache (bertahan di warm container Vercel & local server)
const rooms = global.__KOPI_ROOMS__ || (global.__KOPI_ROOMS__ = new Map());

// Soal default Kopi Ijen (8 buah kopi: 4 benar, 4 salah)
const DEFAULT_BEANS = [
  { id: 1, label: 'Tanah vulkanik kaya unsur hara seperti kalium dan magnesium', correct: true },
  { id: 2, label: 'Ditanam di atas 1.000 mdpl sehingga pematangan buah lebih lambat', correct: true },
  { id: 3, label: 'Pemetikan selektif hanya pada buah kopi yang merah segar', correct: true },
  { id: 4, label: 'Penerapan double sortasi dan fermentasi alami selama 12–36 jam', correct: true },
  { id: 5, label: 'Memetik semua buah kopi tanpa memperhatikan tingkat kematangan', correct: false },
  { id: 6, label: 'Mempercepat pematangan buah untuk menghilangkan seluruh keasaman', correct: false },
  { id: 7, label: 'Mengolah biji tanpa sortasi untuk menghasilkan rasa yang konsisten', correct: false },
  { id: 8, label: 'Tanah miskin unsur hara membuat biji kopi lebih manis', correct: false }
];

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function checkAutoFinish(room) {
  if (room.status === 'playing' && room.ends_at && Date.now() >= room.ends_at) {
    room.status = 'finished';
  }
}

function calculatePlayerScore(player, room) {
  const settings = room.settings;
  let total = 0;
  let correctCount = 0;

  for (const beanId of Object.keys(player.throws)) {
    const item = player.throws[beanId];
    if (item.correct) {
      total += settings.correct_score;
      correctCount++;
    } else {
      total += settings.wrong_score; // wrong_score biasanya negatif, misal -50
    }
  }

  if (correctCount >= 4 && player.bonus_awarded) {
    total += settings.bonus_score;
  }

  // Tambahkan penyesuaian manual host jika ada
  total += (player.manual_adjustment || 0);

  player.score = total;
  player.correct_count = correctCount;
  return total;
}

function getLeaderboard(room) {
  const players = Array.from(room.players.values()).map(p => {
    calculatePlayerScore(p, room);
    return {
      id: p.id,
      name: p.name,
      entity: p.entity,
      score: p.score,
      correct_count: p.correct_count,
      thrown_count: Object.keys(p.throws).length,
      finished_at: p.finished_at,
      joined_at: p.joined_at,
      manual_adjustment: p.manual_adjustment || 0,
      answers: p.throws // rincian jawaban per soal
    };
  });

  // Urutkan: Skor tertinggi, lalu jumlah benar terbanyak, lalu waktu selesai tercepat
  players.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correct_count !== a.correct_count) return b.correct_count - a.correct_count;
    if (a.finished_at && b.finished_at) return a.finished_at - b.finished_at;
    if (a.finished_at) return -1;
    if (b.finished_at) return 1;
    return a.joined_at - b.joined_at;
  });

  return players;
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse Body jika method POST
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};
  const query = req.query || {};
  const action = body.action || query.action;

  try {
    switch (action) {
      // 1. Host: Membuat Room Baru
      case 'create_room': {
        const hostName = (body.host_name || 'Host').trim();
        let code = generateCode();
        while (rooms.has(code)) {
          code = generateCode();
        }

        const hostToken = generateToken();
        const newRoom = {
          code,
          host_name: hostName,
          host_token: hostToken,
          status: 'waiting', // waiting | playing | finished
          created_at: Date.now(),
          started_at: null,
          ends_at: null,
          settings: {
            correct_score: Number(body.correct_score) || 100,
            wrong_score: Number(body.wrong_score) || -50,
            bonus_score: Number(body.bonus_score) || 100,
            duration: Number(body.duration) || 90,
            spreadsheet_id: '1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY',
            apps_script_url: body.apps_script_url || 'https://script.google.com/macros/s/AKfycbyn-8s9up8UTwUwzJ6M_a9DvqrGEiBabJkTT8-L0QMlX14NNwgZlBa5EzJcvcqBFbNGww/exec'
          },
          beans: DEFAULT_BEANS,
          players: new Map()
        };

        rooms.set(code, newRoom);

        return res.status(200).json({
          ok: true,
          code,
          host_token: hostToken,
          settings: newRoom.settings
        });
      }

      // 2. Host: Mengatur Skor & Aturan Game (Poin Benar, Salah, Bonus, Durasi, Apps Script)
      case 'update_settings': {
        const code = (body.code || '').toUpperCase().trim();
        const hostToken = body.host_token;
        const room = rooms.get(code);

        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        if (room.host_token !== hostToken) return res.status(403).json({ error: 'Akses Host tidak valid' });

        if (body.correct_score !== undefined) room.settings.correct_score = Number(body.correct_score);
        if (body.wrong_score !== undefined) room.settings.wrong_score = Number(body.wrong_score);
        if (body.bonus_score !== undefined) room.settings.bonus_score = Number(body.bonus_score);
        if (body.duration !== undefined) room.settings.duration = Math.max(10, Number(body.duration));
        if (body.apps_script_url !== undefined) room.settings.apps_script_url = String(body.apps_script_url).trim();

        // Recalculate semua pemain dengan aturan skor baru
        for (const p of room.players.values()) {
          calculatePlayerScore(p, room);
        }

        return res.status(200).json({
          ok: true,
          settings: room.settings
        });
      }

      // 3. Host: Penyesuaian Skor Manual Peserta
      case 'adjust_score': {
        const code = (body.code || '').toUpperCase().trim();
        const hostToken = body.host_token;
        const playerId = body.player_id;
        const adjustment = Number(body.adjustment) || 0;

        const room = rooms.get(code);
        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        if (room.host_token !== hostToken) return res.status(403).json({ error: 'Akses Host tidak valid' });

        const player = room.players.get(playerId);
        if (!player) return res.status(404).json({ error: 'Peserta tidak ditemukan' });

        player.manual_adjustment = (player.manual_adjustment || 0) + adjustment;
        calculatePlayerScore(player, room);

        return res.status(200).json({
          ok: true,
          player_id: playerId,
          new_score: player.score,
          manual_adjustment: player.manual_adjustment
        });
      }

      // 4. Host: Mulai Game
      case 'start_game': {
        const code = (body.code || '').toUpperCase().trim();
        const hostToken = body.host_token;
        const room = rooms.get(code);

        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        if (room.host_token !== hostToken) return res.status(403).json({ error: 'Akses Host tidak valid' });
        if (room.status === 'playing') return res.status(400).json({ error: 'Permainan sudah berlangsung' });

        room.status = 'playing';
        room.started_at = Date.now();
        room.ends_at = Date.now() + (room.settings.duration * 1000);

        return res.status(200).json({
          ok: true,
          status: 'playing',
          started_at: room.started_at,
          ends_at: room.ends_at,
          duration: room.settings.duration
        });
      }

      // 5. Host: Selesaikan Game
      case 'finish_game': {
        const code = (body.code || '').toUpperCase().trim();
        const hostToken = body.host_token;
        const room = rooms.get(code);

        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        if (room.host_token !== hostToken) return res.status(403).json({ error: 'Akses Host tidak valid' });

        room.status = 'finished';
        room.ends_at = Date.now();

        return res.status(200).json({
          ok: true,
          status: 'finished',
          leaderboard: getLeaderboard(room)
        });
      }

      // 6. Peserta: Bergabung ke Room
      case 'join_game': {
        const code = (body.code || '').toUpperCase().trim();
        const name = (body.name || '').trim();
        const entity = (body.entity || '').trim();

        if (name.length < 2) return res.status(400).json({ error: 'Nama lengkap minimal 2 karakter' });
        if (entity.length < 2) return res.status(400).json({ error: 'Entitas minimal 2 karakter' });

        const room = rooms.get(code);
        if (!room) return res.status(404).json({ error: 'Kode Room tidak ditemukan' });
        checkAutoFinish(room);

        if (room.status !== 'waiting') {
          return res.status(400).json({ error: 'Room sudah dimulai atau selesai' });
        }

        const playerId = generateToken().slice(0, 10);
        const playerToken = generateToken();

        const player = {
          id: playerId,
          name,
          entity,
          token: playerToken,
          joined_at: Date.now(),
          finished_at: null,
          bonus_awarded: false,
          reveals: new Set(),
          throws: {}, // { [beanId]: { correct, points, thrown_at } }
          score: 0,
          correct_count: 0,
          manual_adjustment: 0
        };

        room.players.set(playerId, player);

        return res.status(200).json({
          ok: true,
          code,
          player_id: playerId,
          player_token: playerToken,
          name,
          entity
        });
      }

      // 7. Peserta: Buka Buah Kopi (Reveal)
      case 'reveal_bean': {
        const code = (body.code || '').toUpperCase().trim();
        const playerToken = body.player_token;
        const beanId = Number(body.bean_id);

        const room = rooms.get(code);
        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        checkAutoFinish(room);

        if (room.status !== 'playing') return res.status(400).json({ error: 'Permainan belum dimulai atau waktu habis' });

        const player = Array.from(room.players.values()).find(p => p.token === playerToken);
        if (!player) return res.status(403).json({ error: 'Identitas peserta tidak valid' });

        const bean = room.beans.find(b => b.id === beanId);
        if (!bean) return res.status(404).json({ error: 'Buah kopi tidak ditemukan' });

        player.reveals.add(beanId);

        // Hanya kirimkan teks label (JANGAN kirim status 'correct' agar tidak bisa di-inspect cheat)
        return res.status(200).json({
          ok: true,
          id: bean.id,
          label: bean.label
        });
      }

      // 8. Peserta: Lempar Buah Kopi ke Keranjang (Throw)
      case 'throw_bean': {
        const code = (body.code || '').toUpperCase().trim();
        const playerToken = body.player_token;
        const beanId = Number(body.bean_id);

        const room = rooms.get(code);
        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        checkAutoFinish(room);

        if (room.status !== 'playing') return res.status(400).json({ error: 'Waktu bermain sudah habis' });

        const player = Array.from(room.players.values()).find(p => p.token === playerToken);
        if (!player) return res.status(403).json({ error: 'Identitas peserta tidak valid' });

        if (!player.reveals.has(beanId)) {
          return res.status(400).json({ error: 'Buka buah kopi terlebih dahulu' });
        }

        if (player.throws[beanId]) {
          return res.status(400).json({ error: 'Buah kopi ini sudah dimasukkan' });
        }

        const bean = room.beans.find(b => b.id === beanId);
        if (!bean) return res.status(404).json({ error: 'Buah kopi tidak ditemukan' });

        const isCorrect = bean.correct;
        const points = isCorrect ? room.settings.correct_score : room.settings.wrong_score;

        player.throws[beanId] = {
          correct: isCorrect,
          points,
          thrown_at: Date.now()
        };

        // Periksa apakah sudah menemukan ke-4 jawaban benar
        const currentCorrect = Object.values(player.throws).filter(t => t.correct).length;
        let bonus = false;

        if (currentCorrect >= 4 && !player.bonus_awarded) {
          player.bonus_awarded = true;
          player.finished_at = Date.now();
          bonus = true;
          // Golden snitch: selesai ronde untuk semua jika ada yang dapat 4 benar!
          room.status = 'finished';
          room.ends_at = Date.now();
        }

        calculatePlayerScore(player, room);

        return res.status(200).json({
          ok: true,
          bean_id: beanId,
          correct: isCorrect,
          points,
          bonus,
          score: player.score,
          correct_count: player.correct_count,
          room_finished: room.status === 'finished'
        });
      }

      // 9. Get State: Polling / Sinkronisasi Real-Time
      case 'game_state': {
        const code = (body.code || query.code || '').toUpperCase().trim();
        const hostToken = body.host_token || query.host_token;
        const playerToken = body.player_token || query.player_token;

        const room = rooms.get(code);
        if (!room) return res.status(404).json({ error: 'Room tidak ditemukan' });
        checkAutoFinish(room);

        const isHost = Boolean(hostToken && room.host_token === hostToken);

        if (isHost) {
          const leaderboard = getLeaderboard(room);
          return res.status(200).json({
            ok: true,
            is_host: true,
            code: room.code,
            host_name: room.host_name,
            status: room.status,
            started_at: room.started_at,
            ends_at: room.ends_at,
            settings: room.settings,
            player_count: room.players.size,
            players: leaderboard
          });
        }

        // Jika Peserta
        const player = Array.from(room.players.values()).find(p => p.token === playerToken);
        if (!player) return res.status(403).json({ error: 'Akses tidak valid' });

        calculatePlayerScore(player, room);

        // Hanya kirim data bean yang sudah di-reveal oleh pemain ini
        const revealedBeans = room.beans
          .filter(b => player.reveals.has(b.id))
          .map(b => ({
            id: b.id,
            label: b.label,
            thrown: Boolean(player.throws[b.id]),
            correct: player.throws[b.id] ? player.throws[b.id].correct : null
          }));

        return res.status(200).json({
          ok: true,
          is_host: false,
          code: room.code,
          status: room.status,
          started_at: room.started_at,
          ends_at: room.ends_at,
          name: player.name,
          entity: player.entity,
          score: player.score,
          correct_count: player.correct_count,
          beans: revealedBeans,
          player_count: room.players.size,
          // Leaderboard hanya dikirimkan jika permainan sudah selesai
          leaderboard: room.status === 'finished' ? getLeaderboard(room).slice(0, 10) : []
        });
      }

      default:
        return res.status(400).json({ error: `Aksi '${action}' tidak dikenali` });
    }
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server internal' });
  }
};
