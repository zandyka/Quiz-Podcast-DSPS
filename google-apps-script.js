/**
 * GOOGLE APPS SCRIPT UNTUK GAME KATA KALCER & LIFE AT PTPN QUIZ
 * Spreadsheet ID: 1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY
 * 
 * FITUR:
 * 1. Otomatis menata 20 Kolom Standar Resmi PTPN (Ronde 1 + Ronde 2 + Bukti Share Story Drive)
 * 2. Menyimpan file Screenshot Bukti Share Story ke folder Google Drive & mengisi link URL di Spreadsheet
 * 3. Desain tabel elegan warna hijau khas PTPN (#17452d), beku baris 1 (freeze row 1), lebar kolom rapi
 * 
 * CARA MEMASANG / MEMPERBARUI (WAJIB DILAKUKAN 1x AGAR IZIN GOOGLE DRIVE AKTIF):
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit#gid=0
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'
 * 3. Hapus kode yang lama, lalu salin (paste) seluruh isi file ini ke sana, lalu klik Save (Disket)
 * 4. Pilih fungsi 'setupTable' di toolbar atas -> klik 'Run' (Jalankan) -> klik 'Review permissions' & 'Allow' (izinkan akses Sheets & Google Drive)
 * 5. Klik tombol 'Deploy' (Terapkan) di pojok kanan atas -> 'Manage deployments' -> ikon Pensil (Edit) -> Version: 'New version' -> Klik 'Deploy'
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
  'Bukti Share Story',
  'R1: 1. Tanah Vulkanik (Benar)',
  'R1: 2. Di Atas 1000 mdpl (Benar)',
  'R1: 3. Petik Merah (Benar)',
  'R1: 4. Sortasi & Fermentasi (Benar)',
  'R1: 5. Petik Campur (Salah)',
  'R1: 6. Percepat Matang (Salah)',
  'R1: 7. Tanpa Sortasi (Salah)',
  'R1: 8. Tanah Miskin Hara (Salah)'
];

var DRIVE_FOLDER_NAME = 'Bukti Share Story - Life at PTPN Quiz';

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script Life at PTPN Quiz Aktif (20 Kolom + Google Drive)',
    total_rows: data.length,
    headers: data[0] || []
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Pastikan struktur 20 kolom dan format tabel sudah rapi
    ensureTableStructure(sheet);

    // 1. Aksi Setup Tabel Manual
    if (contents.action === 'setup_table') {
      setupTable(sheet);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Tabel spreadsheet 20 kolom berhasil dirapikan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Aksi Append Rows (Pengiriman Skor Game + Upload Bukti Share Story ke Drive)
    if (contents.action === 'append_rows' && Array.isArray(contents.rows)) {
      var rows = contents.rows;
      var screenshotUrl = '';

      // Simpan screenshot ke Google Drive jika dikirim
      if (contents.screenshot && contents.screenshot.base64) {
        screenshotUrl = saveScreenshotToDrive(contents.screenshot);
      }

      if (rows.length > 0) {
        // Masukkan URL Google Drive ke kolom ke-12 (index 11) jika berhasil upload
        if (screenshotUrl && rows[0].length >= 12) {
          rows[0][11] = screenshotUrl;
        }

        var startRow = sheet.getLastRow() + 1;
        var numCols = rows[0].length;
        sheet.getRange(startRow, 1, rows.length, numCols).setValues(rows);

        // Beri format alignment rapi pada baris baru
        var newRowsRange = sheet.getRange(startRow, 1, rows.length, numCols);
        newRowsRange.setVerticalAlignment('middle');
        sheet.getRange(startRow, 3, rows.length, 10).setHorizontalAlignment('center');
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        inserted: rows.length,
        screenshot_url: screenshotUrl
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
 * Simpan Gambar Bukti Share Story ke Folder Khusus di Google Drive
 */
function saveScreenshotToDrive(screenshotObj) {
  try {
    var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);

    var rawName = (screenshotObj.playerName || 'Peserta').replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
    var timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmmss');
    var ext = (screenshotObj.mimeType || '').indexOf('png') !== -1 ? 'png' : 'jpg';
    var fileName = 'Bukti_Story_' + rawName + '_' + timestamp + '.' + ext;

    var bytes = Utilities.base64Decode(screenshotObj.base64);
    var blob = Utilities.newBlob(bytes, screenshotObj.mimeType || 'image/jpeg', fileName);
    var file = folder.createFile(blob);

    // Atur agar siapa saja yang memiliki link (Panitia/Admin) dapat melihat gambar
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      // Fallback jika kebijakan Workspace melarang link publik
      try {
        file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e2) {}
    }

    return file.getUrl();
  } catch (err) {
    return 'Gagal simpan Drive: ' + err.toString();
  }
}

/**
 * Fungsi Penataan & Perapian Tabel Spreadsheet 20 Kolom
 * (Jalankan 1x dari editor Apps Script untuk merapikan header & meminta izin Google Drive)
 */
function setupTable(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  }

  // Pastikan folder Drive siap sekaligus memicu otorisasi DriveApp saat Run manual
  try {
    var folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    if (!folders.hasNext()) {
      DriveApp.createFolder(DRIVE_FOLDER_NAME);
    }
  } catch (e) {}

  // Jika tabel sebelumnya 19 kolom dan kolom 12 masih R1 soal 1, sisipkan kolom Bukti Share Story di L (12)
  try {
    var col12Header = sheet.getRange(1, 12).getValue();
    if (col12Header && String(col12Header).indexOf('1. Tanah Vulkanik') !== -1) {
      sheet.insertColumnBefore(12);
    }
  } catch (e) {}

  // Set Baris Header 1
  sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length).setValues([OFFICIAL_HEADERS]);
  
  // Format Header Elegan PTPN Group
  var headerRange = sheet.getRange(1, 1, 1, OFFICIAL_HEADERS.length);
  headerRange.setBackground('#17452d');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10.5);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setWrap(true);
  
  sheet.setRowHeight(1, 46);
  sheet.setFrozenRows(1);

  // Atur Lebar Tiap Kolom secara Presisi
  sheet.setColumnWidth(1, 200); // Nama Peserta
  sheet.setColumnWidth(2, 260); // Entitas PTPN Group
  sheet.setColumnWidth(3, 160); // Nomor WhatsApp
  sheet.setColumnWidth(4, 130); // Total Skor Akhir
  sheet.setColumnWidth(5, 120); // R1: Jumlah Benar
  sheet.setColumnWidth(6, 120); // R1: Jumlah Salah
  sheet.setColumnWidth(7, 140); // R1: Bonus Sapu Bersih
  sheet.setColumnWidth(8, 210); // R2: Jawaban Nilai Budaya
  sheet.setColumnWidth(9, 130); // R2: Poin Ronde 2
  sheet.setColumnWidth(10, 130); // Durasi Pengerjaan
  sheet.setColumnWidth(11, 175); // Waktu Submit (WIB)
  sheet.setColumnWidth(12, 240); // Bukti Share Story (Link Drive)
  for (var c = 13; c <= 20; c++) {
    sheet.setColumnWidth(c, 165); // Soal 1-8 Ronde 1
  }

  // Update baris contoh jika masih baris [CONTOH]
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
        'https://drive.google.com/...',
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

  return 'Setup tabel 20 kolom & folder Google Drive selesai!';
}

/**
 * Cek otomatis apakah header sheet sudah 20 kolom dan memiliki Bukti Share Story
 */
function ensureTableStructure(sheet) {
  try {
    var headerColC = sheet.getRange(1, 3).getValue();
    var headerColH = sheet.getRange(1, 8).getValue();
    var headerColL = sheet.getRange(1, 12).getValue();
    if (
      headerColC !== 'Nomor WhatsApp' ||
      headerColH !== 'R2: Jawaban Nilai Budaya' ||
      headerColL !== 'Bukti Share Story' ||
      sheet.getLastColumn() < 20
    ) {
      setupTable(sheet);
    }
  } catch (e) {
    // Abaikan jika sheet terproteksi
  }
}
