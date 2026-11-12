# Quiz Podcast DSPS — Rahasia Mutu Kopi Ijen 🍒🧺
*(Edisi PTPN Group · Mobile Motion First · Akses Mandiri 24/7 · Panel Admin Sandi 'dsps')*

Repository GitHub: **[https://github.com/zandyka/Quiz-Podcast-DSPS.git](https://github.com/zandyka/Quiz-Podcast-DSPS.git)**

Game kuis interaktif mobile-first bertema **Kopi Ijen** yang dirancang khusus untuk seluruh insan **PTPN Group** dalam rangkaian acara Podcast DSPS.

---

## 🌟 Fitur Utama & Pembaruan Sistem

### 1. 🔒 Panel Admin (Kata Sandi: `dsps`)
* **Tombol Admin di Pojok Atas**: Panitia dapat mengklik tombol **"🔒 Admin"** lalu memasukkan kata sandi: `dsps`.
* **Kontrol Buka / Tutup Kuis**:
  * **🟢 Kuis Dibuka**: Kuis dapat diakses dan dimainkan oleh seluruh peserta kapan saja tanpa batasan durasi acara.
  * **🔴 Kuis Ditutup**: Ketika acara podcast atau periode kuis selesai, Admin cukup menekan tombol **"Tutup Kuis Sekarang"**.
  * Peserta yang membuka website saat kuis ditutup akan melihat pesan ramah dan diarahkan untuk melihat Papan Peringkat akhir.
  * Admin dapat membuka kembali kuis kapan saja.

### 2. 📱 Fokus Desain Mobile-First & Animasi Motion Halus
* **Didesain Khusus untuk Layar Smartphone**:
  * Lebar layout proporsional, teks besar, dan kontrol berada di area jangkauan jempol (*thumb-zone*).
* **Interaksi & Motion Memikat**:
  * **Buah Kopi Berayun (*Floating Motion*)**: Efek visual buah kopi merah segar yang hidup di pohon kopi.
  * **Sticky Action Sheet**: Saat buah kopi diketuk, muncul panel elegan dari bawah dengan teks penjelasan dan tombol besar **"🧺 Masukkan ke Keranjang"**.
  * **Keranjang Bergoyang (*Basket Jiggle*)**: Saat buah kopi dimasukkan, keranjang membal dan bergoyang dengan efek audio synthesizer yang jernih.
  * **Efek Pesta Konfeti (*Confetti Burst*)**: Kembang api kertas warna-warni saat peserta memilih jawaban tepat dan saat berhasil menyelesaikan kuis.

### 3. 🏢 Dropdown Resmi Entitas PTPN Group
Bagian entitas telah diubah menjadi menu pilihan (*dropdown*) berisi seluruh entitas resmi **PTPN Group**:
* Holding Perkebunan Nusantara (PTPN III Persero)
* PTPN IV PalmCo (Kantor Pusat & Regional 1 s.d. 5)
* PTPN I SupportingCo (Kantor Pusat & Regional 1 s.d. 5)
* PT Sinergi Gula Nusantara (SugarCo)
* PT Riset Perkebunan Nusantara (RPN)
* PT LPP Agro Nusantara (LPP)
* PT Kharisma Pemasaran Bersama Nusantara (KPBN)
* PT Industri Nabati Lestari (INL)
* PT Dasaplast Nusantara
* PT Bio Industri Nusantara
* PT Sarana Agro Nusantara
* PT Kawasan Industri Terpadu Batang (KITB)
* Afiliasi / Mitra PTPN Group Lainnya

### 4. 📊 Integrasi Google Spreadsheet & Live Leaderboard
* **URL Spreadsheet:** [Google Spreadsheet Kopi Ijen](https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit?gid=0#gid=0)
* **Penyimpanan Otomatis**: Setiap peserta yang selesai bermain, nilainya otomatis terkirim dan tersimpan di Google Spreadsheet.
* **Tabel Dipercantik**: Header hijau kopi tua, freeze row 1, kolom rapi, dan pewarnaan otomatis (Hijau untuk Benar, Merah untuk Salah).
* **Papan Peringkat Real-Time**: Menampilkan Podium Top 3 (👑 🥇, 🥈, 🥉) dan klasemen seluruh insan PTPN Group.

---

## 🚀 Cara Menjalankan Secara Lokal

1. Buka terminal di folder proyek ini:
   ```bash
   node server.js
   ```
2. Buka browser di: `http://localhost:3000`

---

## ☁️ Deployment ke Vercel

Kode sudah terhubung dengan repository GitHub Anda:
1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub Anda.
2. Tambahkan proyek dari repository `zandyka/Quiz-Podcast-DSPS`.
3. Klik **Deploy**!
