// api/scores.js - Vercel Serverless Function untuk Leaderboard & Submit Skor Otomatis
// Terhubung langsung ke Google Spreadsheet 1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY

const SPREADSHEET_ID = '1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyn-8s9up8UTwUwzJ6M_a9DvqrGEiBabJkTT8-L0QMlX14NNwgZlBa5EzJcvcqBFbNGww/exec';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=0`;

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
    // 1. Ambil Papan Peringkat dari Google Spreadsheet
    if (action === 'get_leaderboard') {
      const response = await fetch(CSV_EXPORT_URL, { redirect: 'follow' });
      if (!response.ok) {
        throw new Error('Gagal membaca data dari Google Spreadsheet');
      }

      const csvText = await response.text();
      const rows = parseCsv(csvText);

      // Baris 0 adalah Header, Baris 1 adalah Kunci Jawaban Resmi
      // Baris data peserta mulai dari indeks 2 ke atas
      const leaderboard = [];
      for (let i = 2; i < rows.length; i++) {
        const r = rows[i];
        const name = r[0] || '';
        const entity = r[1] || '';
        const score = parseInt(r[10], 10) || 0;
        const timestamp = r[11] || '';

        // Hitung jawaban benar dari kolom 2 s.d. 9 (Soal 1 s.d. 8)
        let correctCount = 0;
        for (let col = 2; col <= 9; col++) {
          if (r[col] && r[col].toLowerCase().includes('benar')) {
            correctCount++;
          }
        }

        if (name && name !== '[KUNCI RESMI]') {
          leaderboard.push({
            rank: 0,
            name,
            entity,
            score,
            correctCount,
            timestamp
          });
        }
      }

      // Urutkan skor tertinggi ke terendah
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.correctCount - a.correctCount;
      });

      // Tentukan nomor peringkat
      leaderboard.forEach((p, idx) => {
        p.rank = idx + 1;
      });

      return res.status(200).json({
        ok: true,
        spreadsheet_id: SPREADSHEET_ID,
        total_participants: leaderboard.length,
        leaderboard
      });
    }

    // 2. Submit Skor Peserta (Simpan Otomatis ke Google Spreadsheet)
    if (action === 'submit_score') {
      const name = (body.name || '').trim();
      const entity = (body.entity || '').trim();
      const score = Number(body.score) || 0;
      const answers = body.answers || {}; // { 1: { correct: true, points: 100 }, ... }
      const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB';

      if (!name) {
        return res.status(400).json({ error: 'Nama peserta wajib diisi' });
      }

      const getAnsText = i => {
        const a = answers[i];
        if (!a) return '-';
        return a.correct ? `Benar (+${a.points || 100})` : `Salah (${a.points || -50})`;
      };

      // Format baris sesuai kolom tabel spreadsheet
      const newRow = [
        name,
        entity || '—',
        getAnsText(1),
        getAnsText(2),
        getAnsText(3),
        getAnsText(4),
        getAnsText(5),
        getAnsText(6),
        getAnsText(7),
        getAnsText(8),
        score,
        timestamp
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
