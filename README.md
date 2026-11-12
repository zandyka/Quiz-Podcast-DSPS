# Life at PTPN Quiz — Holding Perkebunan Nusantara 🌿
*(Kata Kalcer Podcast Interactive Quiz · 2 Ronde Permainan · Ronde 2 Pilihan Ganda Nilai Budaya · Sinkronisasi Spreadsheet)*

Repository GitHub: **[https://github.com/zandyka/Quiz-Podcast-DSPS.git](https://github.com/zandyka/Quiz-Podcast-DSPS.git)**

Game kuis interaktif mobile-first bertema **Kopi Ijen** yang dirancang khusus untuk seluruh insan **Holding Perkebunan Nusantara** dalam rangkaian acara Podcast Kata Kalcer.

---

## 🌟 Fitur Utama & Pembaruan Sistem

### 1. 🎯 Ronde 2: Pilihan Ganda Nilai Budaya Planters
* **Sistem 2 Ronde Berkesinambungan**:
  * **Ronde 1 (Petik Buah Kopi Ijen)**: Memilih 4 buah kopi terbaik yang memuat faktor mutu Kopi Ijen dari 8 pilihan (Benar: **+100 poin**, Salah: **-50 poin**, Bonus Sapu Bersih: **+100 poin**). Maksimal skor Ronde 1: 500 poin.
  * **Transisi Antar Ronde**: Layar jeda interaktif menampilkan perolehan sementara Ronde 1 dan petunjuk masuk ke Ronde 2.
  * **Ronde 2 (Soal Pilihan Ganda Nilai Budaya)**:
    * **Pertanyaan**: *"Apa nilai budaya yang tercantum dalam podcast jejak kopi nusantara?"*
    * **Pilihan Jawaban**:
      * A. `Continuous learning`
      * B. `Excellence` (**Kunci Jawaban Tepat — +100 poin**)
      * C. `Owner’s mindset`
      * D. `Networking`
    * **Fitur Edukatif**: Highlight otomatis opsi yang benar (hijau) dan salah (merah) beserta kartu penjelasan nilai budaya *Excellence* sebagai pilar planters PTPN Group.
* **Total Skor Maksimal**: **600 poin** (R1 500 + R2 100).
* **Layar Hasil**: Menampilkan perolehan Total Skor dengan rincian breakdown dua ronde (Ronde 1 & Ronde 2).

### 2. 📊 Sinkronisasi Google Spreadsheet Rapi (19 Kolom Standar)
Setiap pengiriman kuis otomatis tercatat di Google Spreadsheet resmi dengan susunan 19 kolom lengkap:
1. **Nama Peserta**
2. **Entitas PTPN Group**
3. **Nomor WhatsApp** *(di sebelah kanan kolom Entitas)*
4. **Total Skor Akhir** *(Akumulasi Ronde 1 + Ronde 2)*
5. **R1: Jumlah Benar** *(contoh: 4 / 4)*
6. **R1: Jumlah Salah**
7. **R1: Bonus Sapu Bersih** *(Ya (+100) / Tidak)*
8. **R2: Jawaban Nilai Budaya** *(contoh: Excellence (Benar +100))*
9. **R2: Poin Ronde 2** *(100 / 0)*
10. **Durasi Pengerjaan** *(mm:ss)*
11. **Waktu Submit (WIB)**
12. s.d. 19. **R1: Soal 1 s.d. 8 (Rincian Buah Kopi Ijen)**

### 3. 🎨 Logo Resmi Life at PTPN & Identitas Baru
* **Logo Life at PTPN**: Menggantikan logo cangkir kopi dan buah ceri dengan logo visual resmi **Life at PTPN** berlatar kartu bersih.
* **Branding Resmi**:
  * Judul Utama: **Life at PTPN Quiz**
  * Sub-judul: **Holding Perkebunan Nusantara**
  * Judul Kuis: **Kata Kalcer Podcast Interactive Quiz**
  * Teks Badge Podcast: **Kuis podcast jejak kopi nusantara**
  * Bahasa Ramah: Seluruh kata ganti disesuaikan menjadi **kamu** (lebih akrab & dinamis).

### 4. 📱 Input Nomor WhatsApp Aktif
* **Formulir Pendaftaran**: Dilengkapi input **Nomor WhatsApp Aktif** tepat di bawah menu pilihan Entitas PTPN.
* **Tampilan Admin**: Kolom No. WhatsApp tampil langsung di tabel Papan Peringkat Admin untuk memudahkan konfirmasi pemenang.

### 5. 🎵 Musik Jingle PTPN (One PTPN One Culture)
* **Audio Resmi MP3**: Memutar audio jingle resmi *One PTPN One Culture* (`audio/jingle-ptpn.mp3`).
* **Default Menyala**: Musik otomatis aktif saat website dibuka dengan fallback interaksi sentuhan layar.
* **Kontrol Musik di Topbar**: Tombol `🎵 Jingle PTPN` dengan animasi gelombang equalizer (*equalizer waves*).

### 6. 🔒 Papan Peringkat Khusus Admin (Kata Sandi: `dsps`)
* **Privasi Skor Peserta**: Papan peringkat (*leaderboard*) kini **hanya dapat dilihat oleh Panitia/Admin** melalui panel admin yang diproteksi sandi `dsps`.
* **Peserta Biasa**: Setelah kuis selesai, peserta melihat ringkasan skor pribadi dan notifikasi bahwa data telah tersimpan di Google Spreadsheet. Papan peringkat tidak lagi ditampilkan ke publik.
* **Fitur Panel Admin**:
  * 🟢/🔴 **Kontrol Status Kuis**: Buka atau tutup kuis secara instan.
  * 📊 **Tautan Langsung Google Spreadsheet**: Buka database spreadsheet dengan 1 klik.
  * 👑 **Podium Top 3 & Klasemen Lengkap**: Memuat nama peserta, asal entitas, no. whatsapp, nilai Ronde 1, nilai Ronde 2, waktu, dan total skor.
  * 🔍 **Fitur Pencarian**: Cari nama peserta atau entitas PTPN tertentu.

### 7. 🎬 Sematan Video YouTube Podcast Kata Kalcer
* **Episode Resmi Life at PTPN**: Menyematkan langsung video podcast YouTube episode *"Rahasia di Balik Cita Rasa Kopi Ijen!"* (`alpL3rtyaLU`).
* **Kalimat Penjelas**: Dilengkapi kalimat *(Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)* pada bagian atas dan bawah pemutar video.
* **Tautan Langsung Aplikasi**: Tombol pintas untuk menonton langsung di aplikasi YouTube.

### 8. 🧪 Mode Simulasi Interaktif (Tutorial Latihan)
* Sebelum bermain di kuis utama, peserta dapat mencoba **Simulasi Tutorial Interaktif** terlebih dahulu.
* **Soal Simulasi**: *"Apa saja jenis kopi yang diproduksi PTPN?"*
  * **Arabika** → ✅ Benar (+100 poin)
  * **Robusta** → ✅ Benar (+100 poin)
  * **Liberika** → ✅ Benar (+100 poin)
  * **Excelsa** → ❌ Salah (-50 poin)
* Lengkap dengan animasi petik buah ke keranjang, bunyi sound effect, konfeti, dan penjelasan edukatif untuk masing-masing varietas kopi.

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
* **Penyimpanan Otomatis**: Setiap peserta yang menyelesaikan kuis, skor total beserta rincian Ronde 1 dan Ronde 2 otomatis masuk ke Google Spreadsheet melalui Google Apps Script Web App.

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
Setiap commit baru yang di-push ke branch `main` akan di-build dan di-deploy otomatis oleh Vercel.
