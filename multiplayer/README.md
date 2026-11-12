# Coffee Bean Challenge — Kopi Ijen 🍒🧺

**1 ronde | 8 buah kopi merah | 4 jawaban benar | 90 detik | multiplayer dengan host dashboard**

Game kuis interaktif web: buah kopi merah masih segar/mentah (coffee cherries), **bukan biji kopi yang sudah dipanggang**. Pemain mengetuk buah untuk membaca opsi yang sebelumnya tersembunyi; lalu menyeretnya ke keranjang, atau menekan tombol **Lempar ke Keranjang**. Host dapat melihat **nama lengkap, entitas**, daftar peserta, live leaderboard, dan pemenang.

## Coba langsung (tanpa internet)

Buka `index.html` melalui browser saat file `config.js` ada di folder yang sama. Pilih **Coba Demo Sendiri**, lalu isi **nama lengkap** dan **entitas**, baca tutorial, dan tekan **Mulai Bermain**. Mode demo hanya lokal, sehingga tidak menyambungkan peserta atau leaderboard host.

## Agar dapat dibagikan dan dimainkan banyak orang (sekali setup)

Game **belum otomatis memiliki server atau URL publik**. Untuk multiplayer yang benar-benar sinkron antardevice:

1. Buat project di [Supabase](https://supabase.com/). Di dashboard, buka **SQL Editor**, salin seluruh isi `database.sql`, lalu **Run** satu kali.
2. Buka **Project Settings → API** (tampilan dashboard dapat berubah). Salin **Project URL** dan **anon / publishable key** ke `config.js`:
   ```javascript
   window.COFFEE_CONFIG = {
     supabaseUrl: "https://PROJECT-ID.supabase.co",
     supabaseAnonKey: "ISI_ANON_ATAU_PUBLISHABLE_KEY"
   };
   ```
   **Jangan** gunakan `service_role` atau secret API key; hanya kunci yang boleh dipakai pada browser.
3. Unggah folder berisi `index.html` dan `config.js` ke hosting statis seperti **Netlify Drop**, **Cloudflare Pages**, atau **GitHub Pages**. Untuk Netlify Drop, drag folder ke [app.netlify.com/drop](https://app.netlify.com/drop) setelah login. **Jangan** upload `database.sql` ke situs publik (tidak diperlukan untuk game berjalan).
4. Buka URL hasil deploy → klik **Buat Room Game** → ketik nama host → salin tautan undangan / kode room kepada peserta. Peserta buka link, isi **nama lengkap dan entitas**, baca tutorial, tekan **Saya Siap · Masuk Lobby**, lalu menunggu host. Host klik **Mulai Bersama**.
5. Saat game dimulai, semua peserta mendapat timer 90 detik. Dashboard host memperbarui daftar nama, jumlah benar, dan peringkat secara otomatis (sekitar setiap 2–3 detik). Host dapat klik **Akhiri Ronde**, atau ronde selesai otomatis ketika **salah satu peserta berhasil melempar keempat jawaban benar** (tanpa menunggu timer), maupun setelah 90 detik. Pemenang ditampilkan di layar host.

**Saran saat acara:** Jalankan dashboard host di laptop yang tersambung ke proyektor dan minta peserta membuka tautan melalui ponsel. Simpan tab host tetap terbuka; kredensial host disimpan di `sessionStorage` dan dapat hilang saat tab ditutup. Jika mengakses dari tab lain, peran host tidak otomatis terbawa (demi keamanan).

## Peraturan skor

- Biji kopi jawaban benar masuk keranjang: **+100**.
- Jawaban salah ikut dimasukkan: **−50**.
- Menemukan seluruh **4 jawaban benar**: bonus **+100**, dan **ronde langsung berakhir untuk semua peserta**.
- Skor maksimum: **500** poin.
- Suara jawaban benar dan salah berbeda, dibuat langsung oleh Web Audio API tanpa file audio eksternal (peramban mungkin mensyaratkan interaksi pengguna sebelum audio aktif).
- Semua peserta melihat pertanyaan sama. Posisi 8 buah kopi diacak pada masing-masing layar, tetapi jawabannya tetap sama.
- Pemain boleh melihat seluruh buah sebelum memilih mana yang akan dimasukkan. Pilihan salah yang tidak dilempar tidak mendapat penalti.
- Setelah buah dimasukkan, pilihan itu tidak dapat dibatalkan. Skor dihitung di database, bukan di perangkat pemain.
- Seri skor: peringkat ditentukan berdasarkan jumlah benar, lalu waktu menyelesaikan seluruh jawaban benar, lalu waktu bergabung.

## Materi kuis

**Pertanyaan:** Apa saja faktor yang membuat Kopi Ijen memiliki cita rasa istimewa dan diakui secara global?

Kunci benar: (1) tanah vulkanik kaya kalium dan magnesium, (2) di atas 1.000 mdpl sehingga pematangan lambat, (3) selective picking buah merah segar, (4) double sortasi dan fermentasi alami 12–36 jam. Empat opsi pengecoh juga tersedia. Kunci hanya ada di database dan tidak dikirim ke pemain sebelum mereka melempar.

## Memperbarui instalasi Supabase yang sudah pernah dipakai

Jika sebelumnya sudah menjalankan versi lama, buka kembali Supabase SQL Editor lalu jalankan seluruh `database.sql` **versi terbaru**. Script akan menambahkan kolom entitas, memperbarui fungsi gabung, dan mengaktifkan aturan akhir ronde otomatis. Room lama yang sedang berlangsung sebaiknya diselesaikan sebelum mengubah fungsi. Setelah itu upload ulang `index.html` dan `config.js` ke hosting.

## Catatan teknis

- Tidak menggunakan akun pemain; peserta masuk dengan nama bebas. Hindari data pribadi sensitif pada nama pemain.
- Host mendapat token rahasia yang tidak boleh dibagikan. URL undangan khusus pemain tidak menyertakan token host.
- Bekerja dengan Supabase REST RPC via HTTPS. Tidak perlu instalasi Node, framework, atau build step.
- Timer dan skor divalidasi pada database Supabase. URL situs yang berbeda untuk setiap deployment, tetapi semua pemain pada deployment yang sama memakai database yang sama.
- Game dirancang untuk acara skala kecil hingga menengah. Untuk penggunaan publik berskala besar, pertimbangkan pengamanan tambahan seperti CAPTCHA, pembatasan request, serta pembersihan data room lama.
- Jika mengubah `database.sql` setelah project digunakan, jalankan SQL migrasi dengan hati-hati karena isi `beans` adalah bank jawaban yang digunakan seluruh room.
