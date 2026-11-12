# Life at PTPN Quiz — Holding Perkebunan Nusantara 🌿
*(Kata Kalcer Podcast Interactive Quiz · Logo Resmi Life at PTPN · Sinkronisasi Nomor WhatsApp)*

Repository GitHub: **[https://github.com/zandyka/Quiz-Podcast-DSPS.git](https://github.com/zandyka/Quiz-Podcast-DSPS.git)**

Game kuis interaktif mobile-first bertema **Kopi Ijen** yang dirancang khusus untuk seluruh insan **Holding Perkebunan Nusantara** dalam rangkaian acara Podcast Kata Kalcer.

---

## 🌟 Fitur Utama & Pembaruan Sistem

### 1. 🎨 Logo Resmi Life at PTPN & Identitas Baru
* **Logo Life at PTPN**: Menggantikan logo cangkir kopi dan buah ceri dengan logo visual resmi **Life at PTPN** berlatar kartu bersih.
* **Branding Resmi**:
  * Judul Utama: **Life at PTPN Quiz**
  * Sub-judul: **Holding Perkebunan Nusantara**
  * Judul Kuis: **Kata Kalcer Podcast Interactive Quiz**
  * Teks Badge Podcast: **Kuis podcast jejak kopi nusantara**
  * Bahasa Ramah: Seluruh kata ganti disesuaikan menjadi **kamu** (lebih akrab & dinamis).

### 2. 📱 Input Nomor WhatsApp & Sinkronisasi Spreadsheet
* **Formulir Pendaftaran**: Dilengkapi input **Nomor WhatsApp Aktif** tepat di bawah menu pilihan Entitas PTPN.
* **Kolom Spreadsheet (17 Kolom)**:
  * Kolom C disisipkan sebagai **Nomor WhatsApp** (berada tepat di sebelah kanan kolom Entitas PTPN Group).
  * Data terkirim secara otomatis melalui Google Apps Script Web App.
* **Tampilan Admin**: Kolom No. WhatsApp tampil langsung di tabel Papan Peringkat Admin untuk memudahkan konfirmasi pemenang.

### 3. 🎵 Musik Jingle PTPN (One PTPN One Culture)
* **Audio Resmi MP3**: Memutar audio jingle resmi *One PTPN One Culture* (`audio/jingle-ptpn.mp3`).
* **Default Menyala**: Musik otomatis aktif saat website dibuka dengan fallback interaksi sentuhan layar.
* **Kontrol Musik di Topbar**: Tombol `🎵 Jingle PTPN` dengan animasi gelombang equalizer (*equalizer waves*).

### 2. 🔒 Papan Peringkat Khusus Admin (Kata Sandi: `dsps`)
* **Privasi Skor Peserta**: Papan peringkat (*leaderboard*) kini **hanya dapat dilihat oleh Panitia/Admin** melalui panel admin yang diproteksi sandi `dsps`.
* **Peserta Biasa**: Setelah kuis selesai, peserta melihat ringkasan skor pribadi dan notifikasi bahwa data telah tersimpan di Google Spreadsheet. Papan peringkat tidak lagi ditampilkan ke publik.
* **Fitur Panel Admin**:
  * 🟢/🔴 **Kontrol Status Kuis**: Buka atau tutup kuis secara instan.
  * 📊 **Tautan Langsung Google Spreadsheet**: Buka database spreadsheet dengan 1 klik.
  * 👑 **Podium Top 3 & Klasemen Lengkap**: Memuat nama peserta, asal entitas, skor, jumlah benar, durasi, dan waktu pengerjaan.
  * 🔍 **Fitur Pencarian**: Cari nama peserta atau entitas PTPN tertentu.

### 3. 📖 Sederhanakan Tampilan (Tab Edukasi Dihilangkan)
* Navigasi publik dipangkas menjadi 2 fokus utama yang sangat ramah non-IT dan pengguna smartphone:
  1. `🍒 Main Kuis & Simulasi`
  2. `🎬 Podcast Kata Kalcer`

### 4. 🎬 Sematan Video YouTube Podcast Kata Kalcer
* **Episode Resmi Life at PTPN**: Menyematkan langsung video podcast YouTube episode *"Rahasia di Balik Cita Rasa Kopi Ijen!"* (`alpL3rtyaLU`).
* **Kalimat Penjelas**: Dilengkapi kalimat *(Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)* pada bagian atas dan bawah pemutar video.
* **Tautan Langsung Aplikasi**: Tombol pintas untuk menonton langsung di aplikasi YouTube.

### 5. 🧪 Mode Simulasi Interaktif (Tutorial Latihan)
* Sebelum bermain di kuis utama (8 buah kopi), peserta dapat mencoba **Simulasi Tutorial Interaktif** terlebih dahulu.
* **Soal Simulasi**: *"Apa saja jenis kopi yang diproduksi PTPN?"*
  * **Arabika** → ✅ Benar (+100 poin)
  * **Robusta** → ✅ Benar (+100 poin)
  * **Liberika** → ✅ Benar (+100 poin)
  * **Excelsa** → ❌ Salah (-50 poin)
* Lengkap dengan animasi petik buah ke keranjang, bunyi sound effect, konfeti, dan penjelasan edukatif untuk masing-masing varietas kopi.
* Setelah simulasi selesai, peserta langsung diarahkan ke Kuis Utama Kopi Ijen.

---

## 🏢 Dropdown Resmi Entitas PTPN Group
Bagian unit kerja merupakan dropdown resmi seluruh entitas **PTPN Group**:
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

---

## 📊 Integrasi Google Spreadsheet & Live Database
* **URL Spreadsheet:** [Google Spreadsheet Kopi Ijen](https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit?gid=0#gid=0)
* **Penyimpanan Otomatis**: Setiap peserta yang menekan tombol *"Selesai Bermain"*, skor beserta rincian 8 buah kopi otomatis masuk ke Google Spreadsheet melalui Google Apps Script Web App.
* **Struktur Data Rapi (16 Kolom)**: Nama, Entitas, Skor, Jumlah Benar, Jumlah Salah, Bonus Sapu Bersih, Durasi, Waktu Submit, dan Soal 1 s.d. 8.

---

## 🚀 Cara Menjalankan Secara Lokal
```bash
node server.js
```
Buka browser di: `http://localhost:3000`

---

## ☁️ Deployment ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Pilih menu **"Add New Project"** lalu pilih repositori **`zandyka/Quiz-Podcast-DSPS`**.
3. Klik **"Deploy"** (tanpa perlu konfigurasi tambahan).
4. Website kuis akan langsung aktif 24/7 dengan URL HTTPS cepat dari Vercel!