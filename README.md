# Quiz Podcast DSPS — Rahasia Mutu Kopi Ijen 🍒🧺
*(Kuis Mandiri 24/7 Tanpa Host · Terhubung Google Spreadsheet · Siap Vercel)*

Repository: **[https://github.com/zandyka/Quiz-Podcast-DSPS.git](https://github.com/zandyka/Quiz-Podcast-DSPS.git)**

Game kuis interaktif bertema **Kopi Ijen** yang dirancang khusus untuk audiens Podcast DSPS. **Dapat diakses kapan saja secara mandiri tanpa perlu host**, di mana setiap hasil kuis otomatis tersimpan dan diperingkatkan langsung ke **Google Spreadsheet**.

---

## 🌟 Fitur Utama & Pengalaman Pengguna (User-Friendly 24/7)

1. **Akses Kapan Saja (Tanpa Perlu Host)**:
   * Siapa pun dapat membuka website kapan saja untuk langsung bermain kuis.
   * Tidak perlu menunggu room dibuat oleh host, tidak perlu nunggu pemain lain di lobby.
2. **Alur Kuis Super Simpel (3 Langkah)**:
   * **Langkah 1:** Masukkan **Nama Lengkap** dan **Asal Unit Kerja / Entitas**.
   * **Langkah 2:** Arena Kuis interaktif (90 detik). Buka 8 buah kopi merah di pohon, temukan 4 faktor mutu Kopi Ijen yang benar. Cukup ketuk buah lalu tekan tombol **"🧺 Masukkan ke Keranjang"**.
   * **Langkah 3:** Selesai! Skor akhir muncul dengan animasi konfeti, otomatis tersimpan ke Google Spreadsheet, dan dapat dibagikan langsung ke WhatsApp.
3. **🏆 Papan Peringkat Global Real-Time (Live Leaderboard)**:
   * Terhubung langsung dengan Google Spreadsheet.
   * Menampilkan **Podium Top 3 Juara** (👑 🥇 Emas, 🥈 Perak, 🥉 Perunggu) dan tabel peringkat lengkap seluruh pemain yang pernah berpartisipasi.
4. **📖 Tab Edukasi & Wawasan Kopi Ijen**:
   * Penjelasan 4 faktor keunggulan Kopi Ijen: Tanah vulkanik kaya hara, ketinggian >1.000 mdpl, petik merah selektif, dan double sortasi/fermentasi 12–36 jam.
5. **🎉 Audio & Perayaan Seru**:
   * Efek audio ceria Web Audio API (dengan tombol 🔊 / 🔇 untuk mematikan suara jika di tempat sunyi).
   * Animasi kembang api konfeti saat memilih benar dan saat kuis selesai.
   * Tombol ⛶ Layar Penuh.

---

## 📊 Google Spreadsheet Database (Telah Dipercantik & Diberi Warna)

* **URL Spreadsheet:** [Google Spreadsheet Kopi Ijen](https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit?gid=0#gid=0)
* **Spreadsheet ID:** `1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY`
* **Format Tabel Baru yang Dipercantik:**
  * **Header Hijau Kopi Gelap (`#173D30`)**, teks putih tebal, rata tengah, dan di-*freeze* agar tetap terlihat saat di-scroll.
  * Lebar kolom rapi: Nama (200px), Entitas (180px), Soal 1..8 (120px), Total Skor (120px, Bold), Waktu Selesai (170px).
  * **Pewarnaan Otomatis (Conditional Formatting):**
    * Teks **Benar** otomatis berwarna hijau lembut (`#D4EDDA`).
    * Teks **Salah** otomatis berwarna merah lembut (`#F8D7DA`).

---

## 🚀 Cara Menjalankan Secara Lokal

1. Buka terminal di folder proyek ini:
   ```bash
   node server.js
   ```
2. Buka browser di: `http://localhost:3000`

---

## ☁️ Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..." → "Project"**.
3. Pilih repository **`zandyka/Quiz-Podcast-DSPS`**.
4. Klik **"Deploy"**!
5. Kuis Anda akan aktif 24 jam di URL publik (contoh: `https://quiz-podcast-dsps.vercel.app`).
