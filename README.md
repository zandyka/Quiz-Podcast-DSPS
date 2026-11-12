# Quiz Podcast DSPS — Rahasia Mutu Kopi Ijen 🍒🧺
*(Edisi Ramah Non-IT · Terhubung Google Spreadsheet · Siap Vercel)*

Repository: **[https://github.com/zandyka/Quiz-Podcast-DSPS.git](https://github.com/zandyka/Quiz-Podcast-DSPS.git)**

Game kuis interaktif multiplayer bertema **Kopi Ijen** yang dirancang khusus untuk acara gathering, workshop, podcast live, maupun kompetisi. Didesain **super ramah bagi pengguna non-IT**, baik untuk panitia (Host) maupun peserta di smartphone masing-masing.

---

## 🌟 Peningkatan Khusus untuk Pengguna Non-IT

1. **📷 QR Code Otomatis di Layar Host**:
   * Panitia tidak perlu lagi mengeja kode room secara manual.
   * Cukup tampilkan layar Host di laptop atau proyektor panggung. Peserta di ruangan tinggal mengarahkan kamera HP untuk memindai QR Code dan langsung masuk ke ruang kuis!
2. **💬 Tombol "Kirim ke WhatsApp"**:
   * Panitia dapat membagikan undangan kuis langsung ke grup WhatsApp dengan 1 kali klik. Pesan undangan dan link kuis otomatis terformat rapi.
3. **⚙️ Preset Aturan Skor Cepat**:
   * Panitia tidak perlu bingung menghitung bobot nilai. Cukup klik preset:
     * ☕ **Santai:** Benar +100, Salah 0, Bonus +50, Durasi 90 detik.
     * ⚖️ **Standar:** Benar +100, Salah -50, Bonus +100, Durasi 90 detik.
     * 🔥 **Tantangan:** Benar +150, Salah -75, Bonus +150, Durasi 60 detik.
4. **🍒 Interaksi 1-Ketukan (One-Tap Pick) untuk Peserta**:
   * Selain fitur seret (*drag-and-drop*), peserta cukup mengetuk buah kopi lalu menekan tombol besar **"🧺 Masukkan ke Keranjang"**. Sangat nyaman digunakan di layar HP sentuh!
5. **🎉 Efek Perayaan (Konfeti & Suara)**:
   * Dilengkapi animasi kembang api kertas (*confetti*) dan efek nada ceria Web Audio API saat peserta mendapatkan jawaban tepat atau memenangkan kuis.
   * Ada tombol **🔊 / 🔇 (Audio Toggle)** di pojok atas agar peserta bisa mematikan efek suara jika berada di tempat hening.
6. **⛶ Mode Layar Penuh (Presenter / Proyektor Mode)**:
   * Tombol satu-klik untuk memaksimalkan tampilan layar Host ke proyektor atau TV panggung tanpa address bar browser.

---

## 📊 Integrasi Google Spreadsheet

* **URL Spreadsheet:** [Google Spreadsheet Kopi Ijen](https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit?gid=0#gid=0)
* **Spreadsheet ID:** `1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY`
* **Web App URL (Aktif):** `https://script.google.com/macros/s/AKfycbyn-8s9up8UTwUwzJ6M_a9DvqrGEiBabJkTT8-L0QMlX14NNwgZlBa5EzJcvcqBFbNGww/exec`
* **Deployment ID:** `AKfycbyn-8s9up8UTwUwzJ6M_a9DvqrGEiBabJkTT8-L0QMlX14NNwgZlBa5EzJcvcqBFbNGww`

### Format Kolom yang Tersimpan di Spreadsheet:
Setiap kali tombol **"📤 Kirim Nilai ke Spreadsheet"** ditekan, baris peserta akan otomatis terisi sesuai kolom:
$$\text{nama, entitas, soal 1, soal 2, soal 3, soal 4, soal 5, soal 6, soal 7, soal 8, total}$$

---

## 🚀 Cara Menjalankan Secara Lokal

1. Buka terminal di folder proyek ini:
   ```bash
   node server.js
   ```
2. Buka browser di: `http://localhost:3000`

---

## ☁️ Cara Push ke GitHub & Deploy ke Vercel

### 1. Push ke GitHub:
```bash
git add .
git commit -m "feat: upgrade total kuis podcast dsps ramah non-it dan integrasi gsheets"
git branch -M main
git push -u origin main
```

### 2. Hubungkan ke Vercel:
1. Buka dashboard [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** → **"Project"**.
3. Pilih repository **`Quiz-Podcast-DSPS`**.
4. Klik **"Deploy"**!
5. Selesai! Web kuis Anda akan langsung live dengan link HTTPS (misal: `https://quiz-podcast-dsps.vercel.app`) yang siap dibagikan ke seluruh peserta.
