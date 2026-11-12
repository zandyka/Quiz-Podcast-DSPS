/**
 * GOOGLE APPS SCRIPT UNTUK GAME KOPI IJEN
 * Spreadsheet ID: 1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY
 * 
 * CARA MEMASANG (HANYA 1 MENIT):
 * 1. Buka spreadsheet: https://docs.google.com/spreadsheets/d/1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY/edit#gid=0
 * 2. Klik menu 'Extensions' (Ekstensi) -> 'Apps Script'
 * 3. Hapus kode default yang ada, lalu salin (paste) seluruh isi file ini ke sana
 * 4. Klik ikon Save (Disket)
 * 5. Klik tombol 'Deploy' (Terapkan) di pojok kanan atas -> 'New deployment' (Penerapan baru)
 * 6. Klik ikon gerigi (Select type) -> pilih 'Web app'
 *    - Description: Kopi Ijen Game API
 *    - Execute as: 'Me' (akun Google Anda)
 *    - Who has access: 'Anyone' (Siapa saja, agar game bisa mengirim skor)
 * 7. Klik 'Deploy', lalu setujui izin (Authorize access)
 * 8. Salin 'Web app URL' (akhiran /exec) dan tempelkan ke kolom 'URL Apps Script' di Dashboard Host game!
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Google Apps Script Kopi Ijen Aktif',
    total_rows: data.length,
    headers: data[0] || []
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Sinkronkan kolom Nomor WhatsApp di kolom C (sebelah kanan Entitas PTPN)
    ensureWhatsAppColumn(sheet);

    // 1. Aksi Append Rows (Banyak Peserta Sekaligus)
    if (contents.action === 'append_rows' && Array.isArray(contents.rows)) {
      var rows = contents.rows;
      if (rows.length > 0) {
        var startRow = sheet.getLastRow() + 1;
        var numCols = rows[0].length;
        sheet.getRange(startRow, 1, rows.length, numCols).setValues(rows);
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        inserted: rows.length
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Aksi Append Single Player
    if (contents.action === 'add_player' && contents.row) {
      sheet.appendRow(contents.row);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Peserta berhasil ditambahkan'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Fallback jika format langsung array
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

// Fungsi bantu untuk memastikan kolom Nomor WhatsApp ada di kolom C
function ensureWhatsAppColumn(sheet) {
  try {
    var headerColC = sheet.getRange(1, 3).getValue();
    if (headerColC !== 'Nomor WhatsApp') {
      sheet.insertColumnAfter(2); // Sisipkan kolom baru di sebelah kanan kolom B
      var headerCell = sheet.getRange(1, 3);
      headerCell.setValue('Nomor WhatsApp');
      headerCell.setBackground('#173d30');
      headerCell.setFontColor('#ffffff');
      headerCell.setFontWeight('bold');
      headerCell.setHorizontalAlignment('center');
      sheet.setColumnWidth(3, 160);
    }
  } catch (err) {
    // Abaikan jika sheet terproteksi
  }
}
