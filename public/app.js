// public/app.js - Quiz Podcast DSPS (Kopi Ijen Challenge)
// Didesain khusus agar Super Mudah & Ramah untuk User Non-IT

(() => {
  'use strict';

  const config = window.GAME_CONFIG || {};
  const API_BASE = '/api';

  const QUESTION = 'Apa saja faktor yang membuat Kopi Ijen memiliki cita rasa istimewa dan diakui secara global?';

  // Opsi soal default
  const DEFAULT_BEANS = [
    { id: 1, label: 'Tanah vulkanik kaya unsur hara seperti kalium dan magnesium', correct: true },
    { id: 2, label: 'Ditanam di atas 1.000 mdpl sehingga pematangan buah lebih lambat', correct: true },
    { id: 3, label: 'Pemetikan selektif hanya pada buah kopi yang merah segar', correct: true },
    { id: 4, label: 'Penerapan double sortasi dan fermentasi alami selama 12–36 jam', correct: true },
    { id: 5, label: 'Memetik semua buah kopi tanpa memperhatikan tingkat kematangan', correct: false },
    { id: 6, label: 'Mempercepat pematangan buah untuk menghilangkan seluruh keasaman', correct: false },
    { id: 7, label: 'Mengolah biji tanpa sortasi untuk menghasilkan rasa yang konsisten', correct: false },
    { id: 8, label: 'Tanah miskin unsur hara membuat biji kopi lebih manis', correct: false }
  ];

  const $ = s => document.querySelector(s);
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // State aplikasi
  let role = ''; // 'host' | 'player' | 'demo'
  let roomCode = '';
  let hostToken = '';
  let playerToken = '';
  let playerId = '';
  let playerName = '';
  let playerEntity = '';
  let gameState = null;
  let revealedBeans = {};
  let thrownBeans = {};
  let selectedBean = null;
  let beanOrder = [];
  let pollInterval = null;
  let timerInterval = null;
  let isBusy = false;
  let feedbackMessage = '';
  let audioContext = null;
  let audioMuted = false;

  // Basket SVG
  const BASKET_SVG = `
    <svg class="basket-svg" viewBox="0 0 300 140" aria-hidden="true">
      <defs>
        <linearGradient id="basketGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#dfaa5b"/>
          <stop offset="1" stop-color="#93531f"/>
        </linearGradient>
        <pattern id="weavePattern" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 9L18 9M9 0L9 18" stroke="#774123" stroke-width="3.5" opacity="0.6"/>
        </pattern>
      </defs>
      <path d="M21 31Q150 -8 279 31L249 122Q150 151 50 122Z" fill="url(#basketGrad)" stroke="#6e3c18" stroke-width="7"/>
      <path d="M21 31Q150 -8 279 31L249 122Q150 151 50 122Z" fill="url(#weavePattern)"/>
      <ellipse cx="150" cy="30" rx="131" ry="24" fill="#754322" stroke="#edbe6d" stroke-width="8"/>
      <ellipse cx="150" cy="31" rx="108" ry="12" fill="#3a2818"/>
    </svg>
  `;

  // ==========================================
  // CONFETTI BURST (Pesta Perayaan)
  // ==========================================
  function fireConfetti() {
    const canvas = $('#confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f5b027', '#25d366', '#ff4757', '#2ed573', '#ffffff', '#ffa502'];
    const particles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravitasi
        p.rotation += p.vr;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(animate);
  }

  // ==========================================
  // SOUND EFFECTS
  // ==========================================
  function playSound(type) {
    if (audioMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = audioContext || new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();

      const now = audioContext.currentTime;
      const notes = type === 'correct' ? [523.25, 659.25, 783.99, 1046.5] : [311.13, 220.0];

      notes.forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = now + idx * (type === 'correct' ? 0.08 : 0.14);

        osc.type = type === 'correct' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch (e) {
      console.warn('Audio nonaktif:', e);
    }
  }

  function showToast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => el.classList.remove('show'), 3800);
  }

  async function apiCall(endpoint, data = {}) {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Terjadi gangguan koneksi server');
    return json;
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getRemainingSeconds() {
    if (!gameState || !gameState.ends_at) return 0;
    return Math.max(0, Math.ceil((gameState.ends_at - Date.now()) / 1000));
  }

  function updateClockDisplay() {
    const clockEl = $('#clock');
    if (clockEl) {
      const left = getRemainingSeconds();
      clockEl.textContent = `${left}s`;
      if (left <= 0 && gameState?.status === 'playing') {
        gameState.status = 'finished';
        renderCurrentScreen();
      }
    }
  }

  function startPolling() {
    stopPolling();
    pollInterval = setInterval(fetchState, 2000);
    timerInterval = setInterval(updateClockDisplay, 250);
  }

  function stopPolling() {
    if (pollInterval) clearInterval(pollInterval);
    if (timerInterval) clearInterval(timerInterval);
    pollInterval = null;
    timerInterval = null;
  }

  async function fetchState() {
    if (isBusy || !roomCode) return;
    try {
      const data = await apiCall('game', {
        action: 'game_state',
        code: roomCode,
        host_token: role === 'host' ? hostToken : undefined,
        player_token: role === 'player' ? playerToken : undefined
      });

      const prevStatus = gameState?.status;
      gameState = data;

      if (role === 'host') {
        renderHostDashboard();
      } else if (role === 'player') {
        for (const b of (data.beans || [])) {
          revealedBeans[b.id] = b.label;
          if (b.thrown) {
            thrownBeans[b.id] = { correct: b.correct };
          }
        }
        if (data.status === 'waiting') renderPlayerWaiting();
        else renderPlayerGame();
      }

      if (prevStatus === 'playing' && data.status === 'finished') {
        fireConfetti();
        showToast('🏁 Ronde kuis selesai!');
      }
    } catch (err) {
      console.warn('Polling status:', err.message);
    }
  }

  function renderCurrentScreen() {
    if (role === 'host') renderHostDashboard();
    else if (role === 'player') {
      if (gameState?.status === 'waiting') renderPlayerWaiting();
      else renderPlayerGame();
    } else {
      renderLanding();
    }
  }

  // ==========================================
  // 1. LANDING SCREEN (PILIH PERAN)
  // ==========================================
  function renderLanding() {
    stopPolling();
    role = '';
    const screen = $('#screen');

    const params = new URLSearchParams(window.location.search);
    const urlRoom = (params.get('room') || '').toUpperCase().trim();

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="eyebrow" style="margin-bottom: 6px;">🎙️ Edisi Khusus Podcast DSPS</span>
            <h2>Pilih Peran Anda untuk Memulai</h2>
            <p class="muted">Kuis interaktif memetik buah kopi Ijen terbaik. Skor peserta otomatis tercatat rapi ke Google Spreadsheet.</p>
          </div>
          
          <div class="two-grid">
            <div class="role-card">
              <h3>🎙️ Saya Host / Panitia</h3>
              <p class="muted small">Buat ruang kuis baru, bagikan QR Code atau link WhatsApp ke peserta, kendalikan jalannya kuis, dan simpan nilai ke Google Spreadsheet.</p>
              <button id="btnChooseHost" class="btn primary" style="margin-top: auto; font-size: 16px;">
                Buat Ruang Kuis (Host) →
              </button>
            </div>

            <div class="role-card">
              <h3>🍒 Saya Peserta Kuis</h3>
              <p class="muted small">Cukup masukkan nama dan asal unit/divisi Anda untuk bergabung. Buka buah kopi merah dan kumpulkan jawaban yang tepat!</p>
              <button id="btnChoosePlayer" class="btn green" style="margin-top: auto; font-size: 16px;">
                Gabung Kuis (Peserta) →
              </button>
            </div>
          </div>

          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #dce2d6; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div class="small" style="color: #175438; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>🟢</span> Database: <a href="${config.spreadsheetUrl}" target="_blank" style="color: #175438; text-decoration: underline;">Google Spreadsheet Kopi Ijen</a>
            </div>
            <button id="btnDemo" class="btn ghost sm">▶ Coba Demo Mandiri</button>
          </div>
        </div>
      </div>
    `;

    $('#btnChooseHost').onclick = renderHostForm;
    $('#btnChoosePlayer').onclick = () => renderPlayerForm(urlRoom);
    $('#btnDemo').onclick = startDemoMode;

    if (urlRoom && !role) {
      renderPlayerForm(urlRoom);
    }
  }

  // ==========================================
  // 2. FORM BUAT ROOM (HOST) DENGAN PRESET SKOR
  // ==========================================
  function renderHostForm() {
    const screen = $('#screen');
    const defaultAppsScript = config.appsScriptUrl || '';

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 620px; margin: 0 auto;">
          <h2>🎙️ Buat Ruangan Kuis Baru</h2>
          <p class="muted">Tentukan nama penyelenggara dan pilih tingkat kesulitan kuis.</p>

          <form id="hostForm" class="stack" style="margin-top: 18px;">
            <div class="field-group">
              <label class="field-label">Nama Host / Penyelenggara</label>
              <input id="inputHostName" class="field" required placeholder="Contoh: Tim Podcast DSPS / Panitia" value="Host Podcast DSPS" maxlength="50">
            </div>

            <!-- Panel Pengatur Skor Ramah Non-IT -->
            <div class="settings-box">
              <h4>⚙️ Pilihan Pengaturan Skor Kuis</h4>
              <p class="muted small" style="margin-bottom: 10px;">Pilih preset cepat di bawah atau sesuaikan angka sesuai kebutuhan Anda:</p>
              
              <div class="preset-buttons">
                <button type="button" class="preset-chip" id="presetSantai">☕ Santai (+100 / 0)</button>
                <button type="button" class="preset-chip active" id="presetStandar">⚖️ Standar (+100 / -50)</button>
                <button type="button" class="preset-chip" id="presetTantangan">🔥 Tantangan (+150 / -75)</button>
              </div>

              <div class="settings-grid" style="margin-top: 14px;">
                <div class="field-group">
                  <label class="field-label">Poin Benar</label>
                  <input id="setCorrect" type="number" class="field" value="100" required>
                </div>
                <div class="field-group">
                  <label class="field-label">Penalti Salah</label>
                  <input id="setWrong" type="number" class="field" value="-50" required>
                </div>
                <div class="field-group">
                  <label class="field-label">Bonus Sapu Bersih</label>
                  <input id="setBonus" type="number" class="field" value="100" required>
                </div>
                <div class="field-group">
                  <label class="field-label">Durasi Waktu</label>
                  <input id="setDuration" type="number" class="field" value="90" min="15" max="300" required>
                </div>
              </div>
            </div>

            <div style="background: #eef6ec; border: 1px solid #c9dec4; border-radius: 12px; padding: 12px 14px; font-size: 13px; color: #1e4a2c;">
              🟢 <b>Google Spreadsheet Terhubung:</b> Nilai peserta otomatis siap diekspor ke sheet <code>game salwawa</code>.
            </div>

            <div class="actions" style="margin-top: 10px;">
              <button id="btnSubmitHost" type="submit" class="btn primary" style="flex: 1; font-size: 16px;">
                🚀 Buka Ruangan Kuis Sekarang
              </button>
              <button type="button" class="btn ghost" id="btnBackLanding">Kembali</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Presets handler
    $('#presetSantai').onclick = () => {
      $('#setCorrect').value = 100;
      $('#setWrong').value = 0;
      $('#setBonus').value = 50;
      $('#setDuration').value = 90;
      $('.preset-chip.active')?.classList.remove('active');
      $('#presetSantai').classList.add('active');
    };

    $('#presetStandar').onclick = () => {
      $('#setCorrect').value = 100;
      $('#setWrong').value = -50;
      $('#setBonus').value = 100;
      $('#setDuration').value = 90;
      $('.preset-chip.active')?.classList.remove('active');
      $('#presetStandar').classList.add('active');
    };

    $('#presetTantangan').onclick = () => {
      $('#setCorrect').value = 150;
      $('#setWrong').value = -75;
      $('#setBonus').value = 150;
      $('#setDuration').value = 60;
      $('.preset-chip.active')?.classList.remove('active');
      $('#presetTantangan').classList.add('active');
    };

    $('#btnBackLanding').onclick = renderLanding;

    $('#hostForm').onsubmit = async e => {
      e.preventDefault();
      const hostName = $('#inputHostName').value.trim();
      const correctScore = Number($('#setCorrect').value) || 100;
      const wrongScore = Number($('#setWrong').value) || -50;
      const bonusScore = Number($('#setBonus').value) || 100;
      const duration = Number($('#setDuration').value) || 90;

      $('#btnSubmitHost').disabled = true;
      try {
        const res = await apiCall('game', {
          action: 'create_room',
          host_name: hostName,
          correct_score: correctScore,
          wrong_score: wrongScore,
          bonus_score: bonusScore,
          duration: duration,
          apps_script_url: defaultAppsScript
        });

        role = 'host';
        roomCode = res.code;
        hostToken = res.host_token;

        sessionStorage.setItem(`kopi_host_${roomCode}`, hostToken);
        window.history.replaceState({}, '', `${window.location.pathname}?room=${roomCode}&role=host`);

        await fetchState();
        startPolling();
      } catch (err) {
        showToast(err.message);
      } finally {
        $('#btnSubmitHost').disabled = false;
      }
    };
  }

  // ==========================================
  // 3. DASHBOARD HOST DENGAN QR CODE & SHARE WA
  // ==========================================
  function renderHostDashboard() {
    if (!gameState) return;
    const screen = $('#screen');
    const isWaiting = gameState.status === 'waiting';
    const isPlaying = gameState.status === 'playing';
    const isFinished = gameState.status === 'finished';
    const players = gameState.players || [];
    const settings = gameState.settings || {};

    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;
    const waShareText = `Halo semuanya! 🍒 Yuk ikutan Kuis Interaktif Podcast DSPS (Rahasia Kopi Ijen)! Klik tautan ini untuk langsung bergabung: ${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waShareText)}`;

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <span class="eyebrow">${isWaiting ? '● LOBBY: MENUNGGU PESERTA' : isPlaying ? '🔥 KUIS SEDANG BERLANGSUNG' : '🏁 RONDE SELESAI'}</span>
              <h2 style="margin-top: 6px;">Layar Host: ${escapeHtml(gameState.host_name)}</h2>
            </div>
            <div style="text-align: right;">
              <small class="muted" style="display: block; font-weight: 800;">KODE ROOM PESERTA</small>
              <div class="code-badge">${escapeHtml(roomCode)}</div>
            </div>
          </div>

          <!-- Section Undangan Peserta (QR Code + Link WA) -->
          <div style="background: #ffffff; border: 2px solid #d9e3d4; border-radius: 18px; padding: 18px; margin-bottom: 18px; display: grid; grid-template-columns: auto 1fr; gap: 20px; align-items: center;">
            <div class="qr-container">
              <img src="${qrUrl}" alt="Scan QR Code untuk Gabung" loading="lazy">
              <span style="font-size: 11px; font-weight: 800; color: #184c30; margin-top: 6px;">📷 SCAN DENGAN HP</span>
            </div>

            <div>
              <h3 style="font-size: 18px; color: #173f2b; margin-bottom: 6px;">Bagikan ke Peserta / Audiens Acara:</h3>
              <p class="muted small" style="margin-bottom: 12px;">Peserta cukup memindai QR Code di samping menggunakan kamera HP, atau klik tautan di bawah ini:</p>
              
              <div style="background: #f4f8f1; padding: 9px 14px; border-radius: 10px; font-size: 13px; font-weight: 700; color: #1c5235; word-break: break-all; margin-bottom: 12px;">
                ${escapeHtml(shareUrl)}
              </div>

              <div class="actions">
                <a href="${waUrl}" target="_blank" class="btn sm wa">💬 Kirim ke WhatsApp</a>
                <button id="btnCopyLink" class="btn sm green">📋 Salin Tautan</button>
                <button id="btnCopyCode" class="btn sm ghost">Salin Kode Saja</button>
              </div>
            </div>
          </div>

          <!-- Live Stats Host -->
          <div class="stats" style="margin-bottom: 18px;">
            <div class="stat-item" style="background: #eef6ec; color: #133d26;">
              <b style="color: #133d26;">${gameState.player_count || 0}</b>
              <small style="color: #3f684e;">Peserta Gabung</small>
            </div>
            <div class="stat-item" style="background: #eef6ec; color: #133d26;">
              <b id="clock" style="color: #133d26;">${isWaiting ? `${settings.duration || 90}s` : isFinished ? '0s' : `${getRemainingSeconds()}s`}</b>
              <small style="color: #3f684e;">Sisa Waktu</small>
            </div>
            <div class="stat-item" style="background: #eef6ec; color: #133d26;">
              <b style="color: #133d26;">+${settings.correct_score} / ${settings.wrong_score}</b>
              <small style="color: #3f684e;">Poin Benar / Salah</small>
            </div>
            <div class="stat-item" style="background: #eef6ec; color: #133d26;">
              <b style="color: #133d26;">+${settings.bonus_score}</b>
              <small style="color: #3f684e;">Bonus Sapu Bersih</small>
            </div>
          </div>

          <!-- Tombol Kontrol Utama Host -->
          <div class="actions" style="margin-bottom: 22px;">
            ${isWaiting ? `<button id="btnStartGame" class="btn primary" style="font-size: 16px; padding: 14px 24px;">▶ Mulai Kuis Bersama!</button>` : ''}
            ${isPlaying ? `<button id="btnFinishGame" class="btn danger">■ Akhiri Ronde Sekarang</button>` : ''}
            <button id="btnSyncSheet" class="btn green">📤 Kirim Nilai ke Spreadsheet</button>
            <button id="btnToggleSettings" class="btn ghost">⚙️ Ubah Aturan Skor</button>
            <button id="btnExportCsv" class="btn ghost">📥 Unduh CSV</button>
          </div>

          <!-- Dropdown Pengatur Skor -->
          <div id="hostSettingsBox" class="settings-box" style="display: none;">
            <h4>⚙️ Sesuaikan Aturan Skor Real-Time</h4>
            <div class="settings-grid">
              <div class="field-group">
                <label class="field-label">Poin Benar</label>
                <input id="editCorrect" type="number" class="field" value="${settings.correct_score}">
              </div>
              <div class="field-group">
                <label class="field-label">Penalti Salah</label>
                <input id="editWrong" type="number" class="field" value="${settings.wrong_score}">
              </div>
              <div class="field-group">
                <label class="field-label">Bonus Sapu Bersih</label>
                <input id="editBonus" type="number" class="field" value="${settings.bonus_score}">
              </div>
              <div class="field-group">
                <label class="field-label">Durasi (Detik)</label>
                <input id="editDuration" type="number" class="field" value="${settings.duration}">
              </div>
            </div>
            <div class="actions" style="margin-top: 12px;">
              <button id="btnSaveSettings" class="btn primary sm">Simpan Aturan Baru</button>
              <button id="btnCloseSettings" class="btn ghost sm">Batal</button>
            </div>
          </div>

          <!-- Papan Peringkat / Leaderboard -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <h3>🏆 ${isFinished ? 'Pemenang Kuis (Hasil Akhir)' : 'Papan Peringkat Langsung (Live Leaderboard)'}</h3>
            <span class="small muted">${players.length} Peserta Terdaftar</span>
          </div>

          <div class="rank-table-wrap">
            <table class="rank-table">
              <thead>
                <tr>
                  <th style="width: 50px;">Juara</th>
                  <th>Nama Lengkap Peserta</th>
                  <th>Asal Entitas / Divisi</th>
                  <th>Jawaban Benar</th>
                  <th>Koreksi Nilai</th>
                  <th style="text-align: right;">Total Nilai</th>
                </tr>
              </thead>
              <tbody>
                ${players.length ? players.map((p, idx) => `
                  <tr class="${idx === 0 ? 'rank-1' : ''}">
                    <td style="font-size: 16px;">${idx === 0 ? '👑 🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                    <td><b>${escapeHtml(p.name)}</b></td>
                    <td>${escapeHtml(p.entity || '—')}</td>
                    <td>${p.correct_count}/4 buah benar</td>
                    <td>
                      <button class="btn ghost sm" style="padding: 2px 8px;" onclick="window.kopiAdjustScore('${p.id}', 10)">+10</button>
                      <button class="btn ghost sm" style="padding: 2px 8px;" onclick="window.kopiAdjustScore('${p.id}', -10)">-10</button>
                      ${p.manual_adjustment ? `<span class="small muted" style="margin-left: 4px;">(${p.manual_adjustment > 0 ? '+' : ''}${p.manual_adjustment})</span>` : ''}
                    </td>
                    <td style="text-align: right; font-size: 17px;"><b>${p.score}</b></td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 26px;" class="muted">
                      Belum ada peserta yang bergabung. Minta peserta scan QR Code di atas!
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <!-- Footer Host Action -->
          <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <a href="${config.spreadsheetUrl}" target="_blank" class="small" style="color: #175438; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              📊 Buka Google Spreadsheet Database (${config.spreadsheetId})
            </a>
            ${isFinished ? `<button id="btnNewRoom" class="btn green sm">Buat Sesi Kuis Baru</button>` : ''}
          </div>
        </div>
      </div>
    `;

    // Pasang Event Listeners Host
    $('#btnCopyLink').onclick = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('✅ Tautan kuis berhasil disalin!');
      } catch {
        prompt('Salin tautan ini:', shareUrl);
      }
    };

    $('#btnCopyCode').onclick = async () => {
      try {
        await navigator.clipboard.writeText(roomCode);
        showToast('✅ Kode room berhasil disalin!');
      } catch {
        prompt('Salin kode:', roomCode);
      }
    };

    if ($('#btnStartGame')) {
      $('#btnStartGame').onclick = async () => {
        try {
          await apiCall('game', {
            action: 'start_game',
            code: roomCode,
            host_token: hostToken
          });
          showToast('Permainan dimulai!');
          fetchState();
        } catch (err) {
          showToast(err.message);
        }
      };
    }

    if ($('#btnFinishGame')) {
      $('#btnFinishGame').onclick = async () => {
        if (!confirm('Akhiri ronde sekarang untuk seluruh peserta?')) return;
        try {
          await apiCall('game', {
            action: 'finish_game',
            code: roomCode,
            host_token: hostToken
          });
          showToast('Ronde kuis diakhiri!');
          fireConfetti();
          fetchState();
        } catch (err) {
          showToast(err.message);
        }
      };
    }

    $('#btnToggleSettings').onclick = () => {
      const box = $('#hostSettingsBox');
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    };

    $('#btnCloseSettings').onclick = () => {
      $('#hostSettingsBox').style.display = 'none';
    };

    $('#btnSaveSettings').onclick = async () => {
      try {
        const correct = Number($('#editCorrect').value);
        const wrong = Number($('#editWrong').value);
        const bonus = Number($('#editBonus').value);
        const duration = Number($('#editDuration').value);

        await apiCall('game', {
          action: 'update_settings',
          code: roomCode,
          host_token: hostToken,
          correct_score: correct,
          wrong_score: wrong,
          bonus_score: bonus,
          duration: duration
        });

        showToast('✅ Pengaturan skor kuis berhasil diperbarui!');
        $('#hostSettingsBox').style.display = 'none';
        fetchState();
      } catch (err) {
        showToast(err.message);
      }
    };

    $('#btnSyncSheet').onclick = async () => {
      if (!players.length) {
        showToast('Belum ada data peserta untuk dikirim');
        return;
      }
      const btn = $('#btnSyncSheet');
      btn.disabled = true;
      btn.textContent = '⏳ Mengirim ke Spreadsheet...';
      try {
        const res = await apiCall('sheet', {
          action: 'sync',
          spreadsheet_id: config.spreadsheetId,
          apps_script_url: config.appsScriptUrl,
          players: players
        });

        if (res.method === 'google_apps_script') {
          showToast(`✅ Berhasil mengirim ${res.synced_count} baris peserta ke Google Spreadsheet!`);
        } else {
          showToast(`✅ Data terformat siap (${res.synced_count} baris).`);
        }
      } catch (err) {
        showToast(`❌ Gagal: ${err.message}`);
      } finally {
        btn.disabled = false;
        btn.textContent = '📤 Kirim Nilai ke Spreadsheet';
      }
    };

    $('#btnExportCsv').onclick = () => {
      if (!players.length) {
        showToast('Belum ada data peserta');
        return;
      }
      const header = ['nama', 'entitas', 'soal 1', 'soal 2', 'soal 3', 'soal 4', 'soal 5', 'soal 6', 'soal 7', 'soal 8', 'total'];
      const rows = players.map(p => {
        const answers = p.answers || {};
        const getAns = i => {
          const a = answers[i];
          if (!a) return '-';
          return a.correct ? `Benar (${a.points > 0 ? '+' : ''}${a.points})` : `Salah (${a.points})`;
        };
        return [
          `"${p.name.replace(/"/g, '""')}"`,
          `"${(p.entity || '').replace(/"/g, '""')}"`,
          `"${getAns(1)}"`, `"${getAns(2)}"`, `"${getAns(3)}"`, `"${getAns(4)}"`,
          `"${getAns(5)}"`, `"${getAns(6)}"`, `"${getAns(7)}"`, `"${getAns(8)}"`,
          p.score
        ].join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rekap_podcast_dsps_${roomCode}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 File CSV berhasil diunduh!');
    };

    if ($('#btnNewRoom')) {
      $('#btnNewRoom').onclick = () => {
        window.history.replaceState({}, '', window.location.pathname);
        renderHostForm();
      };
    }
  }

  // Koreksi skor manual oleh host
  window.kopiAdjustScore = async (pId, amount) => {
    try {
      await apiCall('game', {
        action: 'adjust_score',
        code: roomCode,
        host_token: hostToken,
        player_id: pId,
        adjustment: amount
      });
      showToast(`Skor disesuaikan: ${amount > 0 ? '+' : ''}${amount}`);
      fetchState();
    } catch (err) {
      showToast(err.message);
    }
  };

  // ==========================================
  // 4. FORM GABUNG PESERTA (RAMAH NON-IT)
  // ==========================================
  function renderPlayerForm(prefilledCode = '') {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 560px; margin: 0 auto;">
          <h2>🍒 Masuk Sebagai Peserta</h2>
          <p class="muted">Cukup isi nama dan unit kerja Anda untuk langsung ikut kuis.</p>

          <form id="playerForm" class="stack" style="margin-top: 18px;">
            <div class="field-group">
              <label class="field-label">Kode Room Kuis</label>
              <input id="inputRoomCode" class="field" required placeholder="Contoh: A8K9X2" value="${escapeHtml(prefilledCode)}" maxlength="6" style="text-transform: uppercase; font-weight: 800; letter-spacing: 0.12em;">
            </div>

            <div class="field-group">
              <label class="field-label">Nama Lengkap Peserta</label>
              <input id="inputPlayerName" class="field" required placeholder="Ketik nama lengkap Anda" maxlength="60" autocomplete="name">
            </div>

            <div class="field-group">
              <label class="field-label">Asal Unit Kerja / Divisi / Instansi</label>
              <input id="inputPlayerEntity" class="field" required placeholder="Contoh: Divisi IT / Kebun Ijen / PTPN" maxlength="80">
            </div>

            <div class="actions" style="margin-top: 8px;">
              <button id="btnSubmitPlayer" type="submit" class="btn green" style="flex: 1; font-size: 16px;">
                Masuk ke Ruang Tunggu Kuis →
              </button>
              <button type="button" class="btn ghost" id="btnBackToLanding">Kembali</button>
            </div>
          </form>
        </div>
      </div>
    `;

    $('#btnBackToLanding').onclick = renderLanding;
    $('#playerForm').onsubmit = async e => {
      e.preventDefault();
      const code = $('#inputRoomCode').value.toUpperCase().trim();
      const name = $('#inputPlayerName').value.trim();
      const entity = $('#inputPlayerEntity').value.trim();

      $('#btnSubmitPlayer').disabled = true;
      try {
        const res = await apiCall('game', {
          action: 'join_game',
          code,
          name,
          entity
        });

        role = 'player';
        roomCode = res.code;
        playerToken = res.player_token;
        playerId = res.player_id;
        playerName = name;
        playerEntity = entity;

        sessionStorage.setItem(`kopi_player_${roomCode}`, playerToken);
        window.history.replaceState({}, '', `${window.location.pathname}?room=${roomCode}`);

        await fetchState();
        startPolling();
      } catch (err) {
        showToast(err.message);
      } finally {
        $('#btnSubmitPlayer').disabled = false;
      }
    };
  }

  // ==========================================
  // 5. LOBBY MENUNGGU PESERTA (RAMAH NON-IT)
  // ==========================================
  function renderPlayerWaiting() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="text-align: center; max-width: 620px; margin: 0 auto;">
          <span class="eyebrow">✓ BERHASIL BERGABUNG</span>
          <h2 style="margin-top: 12px;">Selamat Datang, ${escapeHtml(playerName)}! 👋</h2>
          <p class="muted">Asal: <b>${escapeHtml(playerEntity)}</b> · Kode Room: <b style="color: #175438;">${escapeHtml(roomCode)}</b></p>

          <div style="font-size: 52px; margin: 22px 0;">🍒 🍒 🍒</div>

          <div style="background: #f4f8f1; border: 1.5px solid #c9dec4; border-radius: 16px; padding: 18px; text-align: left; margin: 18px 0;">
            <strong style="color: #184c30; display: block; margin-bottom: 8px;">📖 Cara Main Singkat (Hanya 3 Langkah):</strong>
            <ol style="padding-left: 20px; font-size: 14px; color: #284c36; line-height: 1.7;">
              <li>Ketuk <b>Buah Kopi Merah</b> di layar untuk membaca teks rahasianya.</li>
              <li>Ada 8 buah kopi, temukan <b>4 buah dengan jawaban yang tepat</b>.</li>
              <li>Tekan tombol <b>"Masukkan ke Keranjang"</b> atau geser buahnya ke keranjang!</li>
            </ol>
          </div>

          <div style="background: #fff8e8; border: 1px solid #e5cc8d; border-radius: 12px; padding: 12px; font-size: 13.5px; color: #6b4d0e;">
            ⏳ Saat ini ada <b>${gameState?.player_count || 1}</b> peserta di lobby.<br>
            Tunggu Host menekan tombol mulai, layar ini akan otomatis berganti ke arena kuis!
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // 6. ARENA KUIS PESERTA (SUPER RAMAH HP)
  // ==========================================
  function renderPlayerGame() {
    const screen = $('#screen');
    if (!beanOrder.length) {
      beanOrder = shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
    }

    const isFinished = gameState?.status === 'finished';
    const score = gameState?.score || 0;
    const correctCount = gameState?.correct_count || 0;
    const totalThrown = Object.keys(thrownBeans).length;

    screen.innerHTML = `
      <!-- Stats Bar Peserta -->
      <div class="stats" style="margin-bottom: 10px;">
        <div class="stat-item">
          <b id="clock">${isFinished ? '0s' : `${getRemainingSeconds()}s`}</b>
          <small>Sisa Waktu</small>
        </div>
        <div class="stat-item">
          <b>${score}</b>
          <small>Skor Anda</small>
        </div>
        <div class="stat-item">
          <b>${correctCount}/4</b>
          <small>Benar</small>
        </div>
        <div class="stat-item">
          <b>${totalThrown}/8</b>
          <small>Dipanen</small>
        </div>
      </div>

      <!-- Banner Pertanyaan -->
      <div class="game-question">
        <small>🍃 PERTANYAAN KUIS PODCAST DSPS · PILIH 4 JAWABAN TEPAT</small>
        <h2>${QUESTION}</h2>
      </div>

      ${isFinished ? `
        <div class="result-banner good" style="margin-bottom: 16px;">
          🏁 <b>Kuis Selesai!</b> Skor akhir Anda: <b>${score} poin</b> (${correctCount}/4 benar).
          ${correctCount === 4 ? '🎉 Luar biasa! Anda berhasil memanen seluruh buah kopi terbaik!' : 'Terima kasih telah berpartisipasi!'}
        </div>
      ` : ''}

      <!-- Playfield Kopi -->
      <div class="playfield" id="playfield">
        <div class="bean-grid">
          ${beanOrder.map(i => {
            const isRevealed = Boolean(revealedBeans[i]);
            const isThrown = Boolean(thrownBeans[i]);
            const label = revealedBeans[i] || '';

            return `
              <button class="bean-card ${isRevealed ? 'revealed' : ''} ${isThrown ? 'thrown' : ''}" 
                      data-bean="${i}" 
                      ${isThrown || isFinished ? 'disabled' : ''}
                      aria-label="Buah Kopi ${i}">
                <div class="cherry-graphic"></div>
                ${isRevealed ? `
                  <div class="answer-box">
                    <span>${escapeHtml(label)}${isThrown ? ' ✓' : ''}</span>
                  </div>
                ` : `
                  <div class="number-badge">BUAH ${String(i).padStart(2, '0')} · ?</div>
                `}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Target Keranjang -->
        <div class="basket-zone" id="basketTarget">
          <span class="basket-caption">🧺 KERANJANG BIJI TERBAIK</span>
          ${BASKET_SVG}
        </div>
      </div>

      <!-- Panduan Mudah -->
      <p style="text-align: center; color: #d0e6d6; font-size: 13px; margin-top: 10px;">
        💡 <b>Tips:</b> Ketuk buah untuk membaca opsinya, lalu tekan tombol <b>"Masukkan ke Keranjang"</b> di bawah.
      </p>

      <!-- Selected Bean Bar Ramah Non-IT (1-Tap Masuk Keranjang) -->
      ${selectedBean && !isFinished ? `
        <div class="selected-bar">
          <div style="flex: 1;">
            <strong>🍒 Buah Kopi Nomor ${selectedBean} Terpilih:</strong>
            <p>${escapeHtml(revealedBeans[selectedBean] || '')}</p>
          </div>
          <div class="actions" style="margin-top: 6px;">
            <button id="btnThrowBean" class="btn green sm" style="font-size: 14px; padding: 10px 16px;">
              🧺 Masukkan ke Keranjang
            </button>
            <button id="btnCancelBean" class="btn ghost sm">Batal</button>
          </div>
        </div>
      ` : ''}

      ${feedbackMessage ? `
        <div class="result-banner ${feedbackMessage.startsWith('✅') ? 'good' : 'bad'}">
          ${escapeHtml(feedbackMessage)}
        </div>
      ` : ''}

      <!-- Leaderboard Peserta saat Selesai -->
      ${isFinished && (gameState?.leaderboard || []).length ? `
        <div class="panel" style="margin-top: 24px;">
          <div class="panel-inner">
            <h3>🏆 Papan Peringkat Akhir (Top 10)</h3>
            <div class="rank-table-wrap">
              <table class="rank-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nama Peserta</th>
                    <th>Entitas</th>
                    <th>Benar</th>
                    <th style="text-align: right;">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  ${gameState.leaderboard.map((p, idx) => `
                    <tr class="${idx === 0 ? 'rank-1' : ''}">
                      <td>${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                      <td><b>${escapeHtml(p.name)}</b> ${p.name === playerName ? ' (Anda)' : ''}</td>
                      <td>${escapeHtml(p.entity || '—')}</td>
                      <td>${p.correct_count}/4</td>
                      <td style="text-align: right;"><b>${p.score}</b></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="actions" style="margin-top: 16px;">
              <button id="btnBackHome" class="btn ghost sm">Kembali ke Beranda</button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    // Event Listeners Bean
    for (const el of document.querySelectorAll('[data-bean]')) {
      const bId = Number(el.dataset.bean);

      el.onclick = () => handleBeanClick(bId);

      // Drag interaction (opsional jika peserta ingin menggeser)
      el.onpointerdown = e => {
        if (revealedBeans[bId] && !thrownBeans[bId] && !isFinished) {
          el.dataset.dragStart = `${e.clientX},${e.clientY}`;
          if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
        }
      };

      el.onpointerup = e => {
        if (!el.dataset.dragStart) return;
        const [startX, startY] = el.dataset.dragStart.split(',').map(Number);
        delete el.dataset.dragStart;

        const basket = $('#basketTarget');
        if (!basket) return;

        const rect = basket.getBoundingClientRect();
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);

        if (dist > 40 && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          e.preventDefault();
          selectedBean = bId;
          handleThrowSelected();
        }
      };
    }

    if ($('#btnThrowBean')) $('#btnThrowBean').onclick = handleThrowSelected;
    if ($('#btnCancelBean')) $('#btnCancelBean').onclick = () => { selectedBean = null; renderPlayerGame(); };
    if ($('#btnBackHome')) $('#btnBackHome').onclick = () => { window.location.href = window.location.pathname; };
  }

  async function handleBeanClick(bId) {
    if (isBusy || gameState?.status !== 'playing') return;
    if (thrownBeans[bId]) return;

    if (revealedBeans[bId]) {
      selectedBean = bId;
      renderPlayerGame();
      return;
    }

    isBusy = true;
    try {
      const res = await apiCall('game', {
        action: 'reveal_bean',
        code: roomCode,
        player_token: playerToken,
        bean_id: bId
      });

      revealedBeans[bId] = res.label;
      selectedBean = bId;
      renderPlayerGame();
    } catch (err) {
      showToast(err.message);
    } finally {
      isBusy = false;
    }
  }

  async function handleThrowSelected() {
    if (!selectedBean || isBusy || gameState?.status !== 'playing') return;
    const bId = selectedBean;
    isBusy = true;

    try {
      const res = await apiCall('game', {
        action: 'throw_bean',
        code: roomCode,
        player_token: playerToken,
        bean_id: bId
      });

      thrownBeans[bId] = { correct: res.correct, points: res.points };
      selectedBean = null;

      const isGood = res.correct;
      feedbackMessage = isGood
        ? `✅ Pilihan Cerdas! +${res.points} poin${res.bonus ? ' · 🏆 BONUS SAPU BERSIH!' : ''}`
        : `❌ Kurang Tepat! ${res.points} poin`;

      playSound(isGood ? 'correct' : 'wrong');
      if (isGood) fireConfetti();

      if (res.room_finished) {
        gameState.status = 'finished';
      }

      await fetchState();

      setTimeout(() => {
        feedbackMessage = '';
        if (gameState?.status === 'playing') renderPlayerGame();
      }, 2500);

    } catch (err) {
      showToast(err.message);
    } finally {
      isBusy = false;
    }
  }

  // ==========================================
  // 7. DEMO MODE OFFLINE
  // ==========================================
  function startDemoMode() {
    role = 'player';
    roomCode = 'DEMO99';
    playerToken = 'demo-token';
    playerName = 'Peserta Demo';
    playerEntity = 'Uji Coba Mandiri';
    revealedBeans = {};
    thrownBeans = {};
    selectedBean = null;
    beanOrder = shuffle([1, 2, 3, 4, 5, 6, 7, 8]);

    gameState = {
      status: 'playing',
      score: 0,
      correct_count: 0,
      ends_at: Date.now() + 90000,
      settings: { correct_score: 100, wrong_score: -50, bonus_score: 100, duration: 90 },
      beans: []
    };

    stopPolling();
    timerInterval = setInterval(updateClockDisplay, 250);
    renderPlayerGame();
    showToast('Mode demo aktif! Temukan 4 buah kopi terbaik.');
  }

  // ==========================================
  // 8. GLOBAL BUTTONS (AUDIO & FULLSCREEN)
  // ==========================================
  function setupGlobalControls() {
    const audioBtn = $('#btnAudioToggle');
    if (audioBtn) {
      audioBtn.onclick = () => {
        audioMuted = !audioMuted;
        audioBtn.textContent = audioMuted ? '🔇' : '🔊';
        showToast(audioMuted ? 'Efek suara dimatikan' : 'Efek suara dinyalakan');
      };
    }

    const fsBtn = $('#btnFullscreenToggle');
    if (fsBtn) {
      fsBtn.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
          showToast('Mode layar penuh aktif (cocok untuk proyektor)');
        } else {
          document.exitFullscreen?.().catch(() => {});
          showToast('Keluar dari layar penuh');
        }
      };
    }
  }

  // ==========================================
  // 9. INISIALISASI
  // ==========================================
  async function init() {
    setupGlobalControls();

    const params = new URLSearchParams(window.location.search);
    const roomParam = (params.get('room') || '').toUpperCase().trim();
    const roleParam = params.get('role');

    if (roomParam) {
      if (roleParam === 'host') {
        const storedHost = sessionStorage.getItem(`kopi_host_${roomParam}`);
        if (storedHost) {
          role = 'host';
          roomCode = roomParam;
          hostToken = storedHost;
          await fetchState();
          startPolling();
          return;
        }
      } else {
        const storedPlayer = sessionStorage.getItem(`kopi_player_${roomParam}`);
        if (storedPlayer) {
          role = 'player';
          roomCode = roomParam;
          playerToken = storedPlayer;
          await fetchState();
          startPolling();
          return;
        }
      }
    }

    renderLanding();
  }

  init();
})();
