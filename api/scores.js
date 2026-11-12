// api/scores.js - Vercel Serverless Function untuk Leaderboard, Status Kuis (Admin) & Submit Skor
// Terhubung langsung ke Google Spreadsheet 1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY

const SPREADSHEET_ID = '1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn-8s9up8UTwUwzJ6M_a9DvqrGEiBabJkTT8-L0QMlX14NNwgZlBa5EzJcvcqBFbNGww/exec';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

const ADMIN_PASSWORD = 'dsps';

// In-memory status kuis ('open' | 'closed')
if (typeof global.__QUIZ_STATUS__ === 'undefined') {
  global.__QUIZ_STATUS__ = 'open';
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let insideQuotes = false;
    let currentCell = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    rows.push(row);
  }
  return rows;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
  const action = query.action || body.action || (req.method === 'GET' ? 'get_leaderboard' : 'submit_score');

  try {
    // 1. Cek Status Kuis (Buka / Tutup)
    if (action === 'get_status') {
      return res.status(200).json({
        ok: true,
        status: global.__QUIZ_STATUS__,
        spreadsheet_id: SPREADSHEET_ID
      });
    }

    // 2. Admin: Verifikasi Password 'dsps' & Ubah Status (Buka/Tutup)
    if (action === 'admin_set_status') {
      const pass = (body.password || '').trim();
      if (pass !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Password Admin salah!' });
      }

      const newStatus = body.status === 'closed' ? 'closed' : 'open';
      global.__QUIZ_STATUS__ = newStatus;

      return res.status(200).json({
        ok: true,
        message: `Kuis berhasil diubah menjadi: ${newStatus === 'open' ? 'DIBUKA' : 'DITUTUP'}`,
        status: global.__QUIZ_STATUS__
      });
    }

    // 3. Admin: Validasi Login Password
    if (action === 'admin_login') {
      const pass = (body.password || '').trim();
      if (pass !== ADMIN_PASSWORD) {
        return res.status(403).json({ error: 'Password Admin salah!' });
      }
      return res.status(200).json({
        ok: true,
        status: global.__QUIZ_STATUS__,
        message: 'Login Admin Berhasil'
      });
    }

    // 4. Ambil Papan Peringkat dari Google Spreadsheet (KHUSUS ADMIN)
    if (action === 'get_leaderboard') {
      const pass = (query.password || body.password || '').trim();
      if (pass !== ADMIN_PASSWORD) {
        return res.status(403).json({
          ok: false,
          error: 'Akses terbatas! Papan peringkat hanya dapat dilihat oleh Admin dengan password panitia.',
          requires_admin: true
        });
      }

      const response = await fetch(CSV_EXPORT_URL, { redirect: 'follow' });
      if (!response.ok) {
        throw new Error('Gagal membaca data dari Google Spreadsheet');
      }

      const csvText = await response.text();
      const rows = parseCsv(csvText);

      const leaderboard = [];
      const headerRow = rows[0] || [];
      const hasWhatsAppCol = headerRow[2] && (
        headerRow[2].toLowerCase().includes('wa') || 
        headerRow[2].toLowerCase().includes('whatsapp') ||
        headerRow[2].toLowerCase().includes('nomor')
      );

      for (let i = 2; i < rows.length; i++) {
        const r = rows[i];
        const name = r[0] || '';
        const entity = r[1] || '';
        let whatsapp = '';
        let score = 0;
        let correctCount = 0;
        let duration = '';
        let timestamp = '';

        // Deteksi cerdas apakah baris memiliki kolom No. WhatsApp (17 kolom atau nomor WA berdigit >= 8)
        const isWaRow = r.length >= 17 || (r[2] && String(r[2]).length >= 8);

        if (isWaRow) {
          whatsapp = r[2] || '';
          score = parseInt(r[3], 10) || 0;
          correctCount = parseInt(r[4], 10) || 0;
          duration = r[7] || '';
          timestamp = r[8] || '';
        } else {
          score = parseInt(r[2], 10) || 0;
          correctCount = parseInt(r[3], 10) || 0;
          duration = r[6] || '';
          timestamp = r[7] || '';
        }

        if (name && name !== '[KUNCI RESMI]' && name !== '[CONTOH]') {
          leaderboard.push({
            rank: 0,
            name,
            entity,
            whatsapp,
            score,
            correctCount,
            duration,
            timestamp
          });
        }
      }

      // Urutkan skor tertinggi ke terendah
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.correctCount - a.correctCount;
      });

      leaderboard.forEach((p, idx) => {
        p.rank = idx + 1;
      });

      return res.status(200).json({
        ok: true,
        quiz_status: global.__QUIZ_STATUS__,
        spreadsheet_id: SPREADSHEET_ID,
        total_participants: leaderboard.length,
        leaderboard
      });
    }

    // 5. Submit Skor Peserta (Simpan Otomatis ke Google Spreadsheet)
    if (action === 'submit_score') {
      // Periksa apakah kuis sedang dibuka oleh admin
      if (global.__QUIZ_STATUS__ === 'closed') {
        return res.status(403).json({
          error: 'Kuis saat ini telah ditutup oleh Admin. Skor baru tidak dapat diterima.'
        });
      }

      const name = (body.name || '').trim();
      const entity = (body.entity || '').trim();
      const whatsapp = (body.whatsapp || body.wa || body.no_wa || '').trim();
      const score = Number(body.score) || 0;
      const correctCount = Number(body.correct_count) || 0;
      const wrongCount = Number(body.wrong_count) || 0;
      const duration = body.duration || '0:00';
      const bonus = correctCount >= 4 ? 'Ya (+100)' : 'Tidak';
      const answers = body.answers || {};
      const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';

      if (!name) {
        return res.status(400).json({ error: 'Nama peserta wajib diisi' });
      }

      const getAnsText = i => {
        const a = answers[i];
        if (!a) return '⚪ Tidak Dipilih';
        return a.correct ? `✅ Benar (+${a.points || 100})` : `❌ Salah (${a.points || -50})`;
      };

      const newRow = [
        name,
        entity || '—',
        whatsapp || '—',
        score,
        `${correctCount} / 4`,
        wrongCount,
        bonus,
        duration,
        timestamp,
        getAnsText(1),
        getAnsText(2),
        getAnsText(3),
        getAnsText(4),
        getAnsText(5),
        getAnsText(6),
        getAnsText(7),
        getAnsText(8)
      ];

      // Kirim ke Google Apps Script Web App
      const appsScriptResponse = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'append_rows',
          spreadsheetId: SPREADSHEET_ID,
          rows: [newRow]
        }),
        redirect: 'follow'
      });

      const appsScriptResult = await appsScriptResponse.json().catch(() => null);

      return res.status(200).json({
        ok: true,
        message: 'Skor berhasil disimpan ke Google Spreadsheet',
        name,
        score,
        timestamp,
        apps_script_result: appsScriptResult
      });
    }

    return res.status(400).json({ error: 'Aksi tidak valid' });
  } catch (err) {
    console.error('Scores API Error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server' });
  }
};
