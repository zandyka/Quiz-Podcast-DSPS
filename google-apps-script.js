/**
 * GOOGLE APPS SCRIPT UNTUK GAME KATA KALCER & LIFE AT PTPN QUIZ
 * Spreadsheet ID: 1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY
 * 
 * FITUR:
 * 1. Otomatis menata 19 Kolom Standar Resmi PTPN (Ronde 1 Petik Kopi + Ronde 2 Nilai Budaya Excellence + WhatsApp)
 * 2. Desain tabel elegan warna hijau khas PTPN (#17452d), teks tebal putih, beku baris 1 (freeze row 1), lebar kolom rapi
 * 3. Menerima penyimpanan skor otomatis dari Web App (append_rows)
 * 
 * CARA MEMASANG / MEMPERBARUI:
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit#gid=0
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'
 * 3. Hapus kode yang lama, lalu salin (paste) seluruh isi file ini ke sana
 * 4. Untuk langsung merapikan tabel sekarang: Pilih fungsi 'setupTable' di toolbar atas, lalu klik tombol 'Run' (Jalankan)
 * 5. Klik tombol 'Deploy' (Terapkan) di pojok kanan atas -> 'Manage deployments' -> Edit (ikon pensil) -> Version: 'New version' -> Klik 'Deploy'
 */

var OFFICIAL_HEADERS = [
  'Nama Peserta',
  'Entitas PTPN Group',
  'Nomor WhatsApp',
  'Total Skor Akhir',
  'R1: Jumlah Benar',
  'R1: Jumlah Salah',
  'R1: Bonus Sapu Bersih',
  'R2: Jawaban Nilai Budaya',
  'R2: Poin Ronde 2',
  'Durasi Pengerjaan',
  'Waktu Submit (WIB)',
  'R1: 1. Tanah Vulkanik (Benar)',
  'R1: 2. Di Atas 1000 mdpl (Benar)',
  'R1: 3. Petik Merah (Benar)',
  'R1: 4. Sortasi & Fermentasi (Benar)',
  'R1: 5. Petik Campur (Salah)',
  'R1: 6. Percepat Matang (Salah)',
  'R1: 7. Tanpa Sortasi (Salah)',
  'R1: 8. Tanah Miskin Hara (Salah)'
];

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script Life at PTPN Quiz Aktif (19 Kolom Standar)',
    total_rows: data.length,
    headers: data[0] || []
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Pastikan struktur 19 kolom dan format tabel sudah rapi
    ensureTableStructure(sheet);

    // 1. Aksi Setup Tabel Manual
    if (contents.action === 'setup_table') {
      setupTable(sheet);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Tabel spreadsheet berhasil dirapikan dan disinkronkan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Aksi Append Rows (Pengiriman Skor Game)
    if (contents.action === 'append_rows' && Array.isArray(contents.rows)) {
      var rows = contents.rows;
      if (rows.length > 0) {
        var startRow = sheet.getLastRow() + 1;
        var numCols = rows[0].length;
        sheet.getRange(startRow, 1, rows.length, numCols).setValues(rows);

        // Beri format alignment rapi pada baris baru
        var newRowsRange = sheet.getRange(startRow, 1, rows.length, numCols);
        newRowsRange.setVerticalAlignment('middle');
        // Rata tengah kolom No WA, Skor, Benar, Salah, Bonus, R2 Poin, Durasi, Waktu
        sheet.getRange(startRow, 3, rows.length, 9).setHorizontalAlignment('center');
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        inserted: rows.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. Aksi Append Single Player
    if (contents.action === 'add_player' && contents.row) {
      sheet.appendRow(contents.row);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Peserta berhasil ditambahkan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Fallback jika format langsung array
    if (Array.isArray(contents)) {
      for (var i = 0; i < contents.length; i++) {
        sheet.appendRow(contents[i]);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        inserted: contents.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Format aksi tidak dikenali'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi Penataan & Perapian Tabel Spreadsheet (Bisa dijalankan manual di Apps Script)
 */
function setupTable(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  }

  // Set Baris Header 1
  sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
  
  // Format Header Elegan PTPN Group
  var headerRange = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length);
  headerRange.setBackground('#17452d'); // Hijau tua PTPN
  headerRange.setFontColor('#ffffff'); // Teks putih kontras
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10.5);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrap(true);
  
  sheet.setRowHeight(1, 46);
  sheet.setFrozenRows(1);

  // Atur Lebar Tiap Kolom secara Presisi
  sheet.setColumnWidth(1, 200); // 1. Nama Peserta
  sheet.setColumnWidth(2, 260); // 2. Entitas PTPN Group
  sheet.setColumnWidth(3, 160); // 3. Nomor WhatsApp
  sheet.setColumnWidth(4, 130); // 4. Total Skor Akhir
  sheet.setColumnWidth(5, 120); // 5. R1: Jumlah Benar
  sheet.setColumnWidth(6, 120); // 6. R1: Jumlah Salah
  sheet.setColumnWidth(7, 140); // 7. R1: Bonus Sapu Bersih
  sheet.setColumnWidth(8, 210); // 8. R2: Jawaban Nilai Budaya
  sheet.setColumnWidth(9, 130); // 9. R2: Poin Ronde 2
  sheet.setColumnWidth(10, 130); // 10. Durasi Pengerjaan
  sheet.setColumnWidth(11, 175); // 11. Waktu Submit (WIB)
  for (var c = 12; c <= 19; c++) {
    sheet.setColumnWidth(c, 165); // 12-19. Soal 1-8 Ronde 1
  }

  // Jika baris 2 adalah kunci/contoh lama, update baris contoh agar sesuai 19 kolom
  if (sheet.getLastRow() >= 2) {
    var firstVal = sheet.getRange(2, 1).getValue();
    if (firstVal === '[CONTOH]' || firstVal === '[KUNCI RESMI]') {
      var exampleRow = [
        '[CONTOH]',
        'Holding Perkebunan Nusantara',
        '081234567890',
        600,
        '4 / 4',
        0,
        'Ya (+100)',
        'Excellence (Benar +100)',
        100,
        '1:15',
        'Kunci Jawaban Resmi',
        '✅ Benar (+100)',
        '✅ Benar (+100)',
        '✅ Benar (+100)',
        '✅ Benar (+100)',
        '❌ Salah (-50)',
        '❌ Salah (-50)',
        '❌ Salah (-50)',
        '❌ Salah (-50)'
      ];
      sheet.getRange(2, 1, 1, exampleRow.length).setValues([exampleRow]);
      sheet.getRange(2, 1, 1, exampleRow.length).setBackground('#f4f9f4');
      sheet.getRange(2, 1, 1, exampleRow.length).setFontColor('#205537');
      sheet.getRange(2, 1, 1, exampleRow.length).setFontStyle('italic');
    }
  }

  return 'Setup tabel 19 kolom selesai!';
}

/**
 * Cek otomatis apakah header sheet sudah 19 kolom dan memiliki kolom WhatsApp & Ronde 2
 */
function ensureTableStructure(sheet) {
  try {
    var headerColC = sheet.getRange(1, 3).getValue();
    var headerColH = sheet.getRange(1, 8).getValue();
    if (headerColC !== 'Nomor WhatsApp' || headerColH !== 'R2: Jawaban Nilai Budaya' || sheet.getLastColumn() < 19) {
      setupTable(sheet);
    }
  } catch (e) {
    // Abaikan jika sheet terproteksi
  }
}
