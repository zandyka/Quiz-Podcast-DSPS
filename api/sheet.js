// api/sheet.js - Vercel Serverless Function untuk sinkronisasi ke Google Spreadsheet
// Spreadsheet ID: 1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

  const action = body.action || req.query.action || 'sync';
  const spreadsheetId = body.spreadsheet_id || '1Ubm7Qv2uhSXVCUJpzKJ-_1kc6C8rn-g9Xmu9jnJ-KOY';
  const defaultAppsScript = 'https://script.google.com/macros/s/AKfycbyn-8s9up8UTwUwzJ6M_a9DvqrGEiBabJkTT8-L0QMlX14NNwgZlBa5EzJcvcqBFbNGww/exec';
  const appsScriptUrl = body.apps_script_url || process.env.APPS_SCRIPT_URL || defaultAppsScript;

  // Format baris peserta sesuai urutan kolom spreadsheet user:
  // nama, entitas, soal 1, soal 2, soal 3, soal 4, soal 5, soal 6, [soal 7], [soal 8], total
  function formatPlayerRow(player) {
    const answers = player.answers || {};
    const getAnswerText = (i) => {
      const a = answers[i];
      if (!a) return '-';
      return a.correct ? `Benar (${a.points > 0 ? '+' : ''}${a.points})` : `Salah (${a.points})`;
    };

    return [
      player.name || '',
      player.entity || '',
      getAnswerText(1),
      getAnswerText(2),
      getAnswerText(3),
      getAnswerText(4),
      getAnswerText(5),
      getAnswerText(6),
      getAnswerText(7),
      getAnswerText(8),
      player.score || 0
    ];
  }

  try {
    if (action === 'sync') {
      const players = body.players || [];
      if (!Array.isArray(players) || players.length === 0) {
        return res.status(400).json({ error: 'Tidak ada data peserta untuk disinkronkan' });
      }

      const rows = players.map(formatPlayerRow);

      // 1. Jika Apps Script URL tersedia, kirim ke Webhook Apps Script
      if (appsScriptUrl && appsScriptUrl.startsWith('https://script.google.com')) {
        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'append_rows',
            spreadsheetId,
            rows
          }),
          redirect: 'follow'
        });

        const result = await response.json().catch(() => null);
        return res.status(200).json({
          ok: true,
          method: 'google_apps_script',
          synced_count: rows.length,
          response: result
        });
      }

      // 2. Jika tidak ada Apps Script URL langsung, sediakan payload terformat dan CSV data
      const csvHeader = ['nama', 'entitas', 'soal 1', 'soal 2', 'soal 3', 'soal 4', 'soal 5', 'soal 6', 'soal 7', 'soal 8', 'total'];
      const csvLines = [
        csvHeader.join(','),
        ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return res.status(200).json({
        ok: true,
        method: 'ready_for_sync',
        spreadsheet_id: spreadsheetId,
        synced_count: rows.length,
        rows,
        csv: csvLines,
        message: 'Data siap dikirim. Hubungkan Apps Script Web App untuk otomatisasi langsung ke sheet.'
      });
    }

    if (action === 'export_csv') {
      const players = body.players || [];
      const rows = players.map(formatPlayerRow);
      const csvHeader = ['nama', 'entitas', 'soal 1', 'soal 2', 'soal 3', 'soal 4', 'soal 5', 'soal 6', 'soal 7', 'soal 8', 'total'];
      const csvContent = [
        csvHeader.join(','),
        ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leaderboard_kopi_ijen.csv"');
      return res.status(200).send(csvContent);
    }

    return res.status(400).json({ error: `Aksi '${action}' tidak valid` });
  } catch (err) {
    console.error('Sheet Sync Error:', err);
    return res.status(500).json({ error: err.message || 'Gagal sinkronisasi spreadsheet' });
  }
};
