// public/app.js - Quiz Podcast DSPS (Kopi Ijen Challenge)
// Sistem Mandiri 24/7 Tanpa Host · Terhubung Google Spreadsheet

(() => {
  'use strict';

  const config = window.GAME_CONFIG || {};
  const API_BASE = '/api';

  const QUESTION = 'Apa saja faktor yang membuat Kopi Ijen memiliki cita rasa istimewa dan diakui secara global?';

  // Bank Soal Kopi Ijen: 4 Benar & 4 Salah
  const BEANS_DATA = [
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

  // State
  let currentTab = 'play'; // 'play' | 'leaderboard' | 'education'
  let gameStatus = 'intro'; // 'intro' | 'playing' | 'result'
  let playerName = '';
  let playerEntity = '';
  let score = 0;
  let correctCount = 0;
  let timeRemaining = 90;
  let timerInterval = null;
  let revealedBeans = {};
  let thrownBeans = {};
  let selectedBean = null;
  let beanOrder = [];
  let isBusy = false;
  let feedbackMessage = '';
  let audioMuted = false;
  let audioContext = null;
  let cachedLeaderboard = [];

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
  // CONFETTI BURST
  // ==========================================
  function fireConfetti() {
    const canvas = $('#confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f5b027', '#25d366', '#ff4757', '#2ed573', '#ffffff', '#ffa502'];
    const particles = [];
    const count = 100;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.55,
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
        p.vy += 0.35;
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

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ==========================================
  // RENDER CONTROLLER
  // ==========================================
  function render() {
    // Update active tab buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === currentTab);
    });

    const hero = $('#mainHero');
    if (hero) {
      hero.style.display = (currentTab === 'play' && gameStatus === 'playing') ? 'none' : 'block';
    }

    if (currentTab === 'play') {
      if (gameStatus === 'intro') renderIntro();
      else if (gameStatus === 'playing') renderPlayfield();
      else if (gameStatus === 'result') renderResult();
    } else if (currentTab === 'leaderboard') {
      renderLeaderboard();
    } else if (currentTab === 'education') {
      renderEducation();
    }
  }

  // ==========================================
  // TAB 1: FORM INTRO (MASUK KUIS)
  // ==========================================
  function renderIntro() {
    const screen = $('#screen');
    const storedName = localStorage.getItem('kopi_player_name') || '';
    const storedEntity = localStorage.getItem('kopi_player_entity') || '';

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 620px; margin: 0 auto;">
          <h2>🍒 Siap Uji Pengetahuan Kopi Ijen?</h2>
          <p class="muted">Kuis ini dapat diakses kapan saja secara mandiri. Nilai Anda akan langsung tercatat di Papan Peringkat Google Spreadsheet.</p>

          <form id="startQuizForm" class="stack" style="margin-top: 18px;">
            <div class="field-group">
              <label class="field-label">Nama Lengkap Anda</label>
              <input id="inputName" class="field" required placeholder="Ketik nama lengkap Anda" value="${escapeHtml(storedName)}" maxlength="60" autocomplete="name">
            </div>

            <div class="field-group">
              <label class="field-label">Asal Unit Kerja / Divisi / Instansi</label>
              <input id="inputEntity" class="field" required placeholder="Contoh: Holding PTPN / Divisi IT / Kebun Ijen" value="${escapeHtml(storedEntity)}" maxlength="80">
            </div>

            <!-- Petunjuk Ringkas Kuis -->
            <div style="background: #f4f8f1; border: 1.5px solid #cbdbc1; border-radius: 14px; padding: 16px; margin: 6px 0;">
              <strong style="color: #17452d; display: block; margin-bottom: 6px;">📖 Aturan Kuis:</strong>
              <ul style="padding-left: 20px; font-size: 13.5px; color: #284c36; line-height: 1.6;">
                <li>Ada <b>8 buah kopi merah</b>. Pilih <b>4 faktor</b> yang membuat Kopi Ijen istimewa.</li>
                <li>Jawaban Benar: <b>+100 poin</b> · Pilihan Salah: <b>-50 poin</b>.</li>
                <li>Temukan ke-4 jawaban benar untuk mendapatkan <b>Bonus +100 poin</b>!</li>
                <li>Waktu pengerjaan: <b>90 detik</b>.</li>
              </ul>
            </div>

            <button type="submit" class="btn primary" style="font-size: 16px; padding: 14px 24px; margin-top: 6px;">
              🍒 Mulai Kuis Sekarang →
            </button>
          </form>

          <div style="margin-top: 18px; text-align: center;">
            <button id="btnQuickLeaderboard" class="btn ghost sm">🏆 Lihat Papan Peringkat Pemain Lain</button>
          </div>
        </div>
      </div>
    `;

    $('#startQuizForm').onsubmit = e => {
      e.preventDefault();
      const n = $('#inputName').value.trim();
      const ent = $('#inputEntity').value.trim();

      if (n.length < 2) return showToast('Nama minimal 2 karakter');
      if (ent.length < 2) return showToast('Asal unit/instansi minimal 2 karakter');

      playerName = n;
      playerEntity = ent;
      localStorage.setItem('kopi_player_name', n);
      localStorage.setItem('kopi_player_entity', ent);

      startQuiz();
    };

    $('#btnQuickLeaderboard').onclick = () => {
      currentTab = 'leaderboard';
      render();
    };
  }

  // ==========================================
  // MEMULAI KUIS
  // ==========================================
  function startQuiz() {
    score = 0;
    correctCount = 0;
    timeRemaining = 90;
    revealedBeans = {};
    thrownBeans = {};
    selectedBean = null;
    feedbackMessage = '';
    beanOrder = shuffle([1, 2, 3, 4, 5, 6, 7, 8]);

    gameStatus = 'playing';
    render();

    // Timer countdown
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeRemaining--;
      const clockEl = $('#clock');
      if (clockEl) clockEl.textContent = `${timeRemaining}s`;

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        finishQuiz();
      }
    }, 1000);

    showToast('Kuis dimulai! Ketuk buah kopi untuk membaca.');
  }

  // ==========================================
  // TAB 1: ARENA PERMAINAN (PLAYFIELD)
  // ==========================================
  function renderPlayfield() {
    const screen = $('#screen');
    const totalThrown = Object.keys(thrownBeans).length;

    screen.innerHTML = `
      <!-- Bar Skor & Waktu -->
      <div class="stats" style="margin-bottom: 12px;">
        <div class="stat-item">
          <b id="clock">${timeRemaining}s</b>
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
          <small>Dipetik</small>
        </div>
      </div>

      <!-- Banner Pertanyaan -->
      <div class="game-question">
        <small>🍃 PERTANYAAN KUIS PODCAST DSPS · PILIH 4 FAKTOR BENAR</small>
        <h2>${QUESTION}</h2>
      </div>

      <!-- Playfield Pohon Buah Kopi -->
      <div class="playfield" id="playfield">
        <div class="bean-grid">
          ${beanOrder.map(i => {
            const isRevealed = Boolean(revealedBeans[i]);
            const isThrown = Boolean(thrownBeans[i]);
            const label = revealedBeans[i] || '';

            return `
              <button class="bean-card ${isRevealed ? 'revealed' : ''} ${isThrown ? 'thrown' : ''}" 
                      data-bean="${i}" 
                      ${isThrown ? 'disabled' : ''}
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

      <p style="text-align: center; color: #d0e6d6; font-size: 13px; margin-top: 10px;">
        💡 Ketuk buah untuk membaca opsinya, lalu tekan tombol <b>"Masukkan ke Keranjang"</b> di bawah.
      </p>

      <!-- Action Bar Ramah Non-IT (1-Tap Masuk Keranjang) -->
      ${selectedBean ? `
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
    `;

    // Event listener buah kopi
    for (const el of document.querySelectorAll('[data-bean]')) {
      const bId = Number(el.dataset.bean);

      el.onclick = () => handleBeanClick(bId);

      // Drag interaction (opsional)
      el.onpointerdown = e => {
        if (revealedBeans[bId] && !thrownBeans[bId]) {
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
          handleThrowBean();
        }
      };
    }

    if ($('#btnThrowBean')) $('#btnThrowBean').onclick = handleThrowBean;
    if ($('#btnCancelBean')) $('#btnCancelBean').onclick = () => { selectedBean = null; renderPlayfield(); };
  }

  function handleBeanClick(bId) {
    if (thrownBeans[bId]) return;

    if (revealedBeans[bId]) {
      selectedBean = bId;
      renderPlayfield();
      return;
    }

    // Buka teks buah kopi
    const bean = BEANS_DATA.find(b => b.id === bId);
    if (!bean) return;

    revealedBeans[bId] = bean.label;
    selectedBean = bId;
    renderPlayfield();
  }

  function handleThrowBean() {
    if (!selectedBean || isBusy) return;
    const bId = selectedBean;
    const bean = BEANS_DATA.find(b => b.id === bId);
    if (!bean) return;

    isBusy = true;
    const isCorrect = bean.correct;
    const points = isCorrect ? 100 : -50;

    score += points;
    if (isCorrect) correctCount++;

    thrownBeans[bId] = { correct: isCorrect, points };
    selectedBean = null;

    let bonus = false;
    // Golden Snitch: jika dapat 4 benar!
    if (correctCount === 4) {
      bonus = true;
      score += 100;
    }

    feedbackMessage = isCorrect
      ? `✅ Pilihan Cerdas! +100 poin${bonus ? ' · 🏆 BONUS SAPU BERSIH +100!' : ''}`
      : `❌ Kurang Tepat! -50 poin`;

    playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) fireConfetti();

    if (correctCount === 4) {
      if (timerInterval) clearInterval(timerInterval);
      setTimeout(() => {
        isBusy = false;
        finishQuiz();
      }, 1200);
      return;
    }

    renderPlayfield();

    setTimeout(() => {
      feedbackMessage = '';
      if (gameStatus === 'playing') renderPlayfield();
      isBusy = false;
    }, 2400);
  }

  // ==========================================
  // PENYELESAIAN KUIS & AUTO-SYNC KE SPREADSHEET
  // ==========================================
  async function finishQuiz() {
    if (timerInterval) clearInterval(timerInterval);
    gameStatus = 'result';
    render();
    fireConfetti();

    // Kirim otomatis ke Google Spreadsheet via API
    try {
      await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_score',
          name: playerName,
          entity: playerEntity,
          score: score,
          answers: thrownBeans
        })
      });
      showToast('✅ Nilai Anda otomatis tersimpan di Google Spreadsheet!');
    } catch (err) {
      console.warn('Gagal sync ke spreadsheet:', err);
    }
  }

  // ==========================================
  // TAB 1: HASIL KUIS (RESULT SCREEN)
  // ==========================================
  function renderResult() {
    const screen = $('#screen');
    const waText = `Halo! 🍒 Saya baru saja mendapatkan skor ${score} poin di Quiz Podcast DSPS (Kopi Ijen Challenge)! Coba kalahkan skor saya di sini: ${window.location.origin}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 640px; margin: 0 auto; text-align: center;">
          <div style="font-size: 56px; margin-bottom: 8px;">🎉 🏆 ☕</div>
          <h2>Kuis Selesai! Kerja Bagus, ${escapeHtml(playerName)}!</h2>
          <p class="muted">Asal Unit: <b>${escapeHtml(playerEntity)}</b></p>

          <!-- Kartu Nilai Akhir -->
          <div style="background: linear-gradient(145deg, #fffcf0 0%, #fff7d6 100%); border: 2.5px solid #f5b027; border-radius: 20px; padding: 24px; margin: 20px 0; box-shadow: var(--shadow-pop);">
            <small style="color: #8c630f; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">TOTAL SKOR AKHIR ANDA</small>
            <div style="font-size: clamp(48px, 8vw, 64px); font-weight: 950; color: #16472b; margin: 6px 0;">
              ${score}
            </div>
            <p style="color: #3b5f48; font-weight: 700; font-size: 15px;">
              ${correctCount === 4 ? '🌟 Sempurna! Anda berhasil memanen semua 4 buah kopi terbaik!' : `Anda berhasil menemukan ${correctCount} dari 4 jawaban benar.`}
            </p>
          </div>

          <div style="background: #eef6ec; border: 1.5px solid #c8d9be; border-radius: 12px; padding: 12px; font-size: 13.5px; color: #19462b; margin-bottom: 22px;">
            🟢 <b>Tersimpan:</b> Data hasil kuis Anda otomatis tercatat di Google Spreadsheet.
          </div>

          <!-- Tombol Aksi -->
          <div class="actions" style="justify-content: center; gap: 12px;">
            <a href="${waUrl}" target="_blank" class="btn wa" style="font-size: 15px;">
              💬 Bagikan Skor ke WhatsApp
            </a>
            <button id="btnViewLeaderboard" class="btn green" style="font-size: 15px;">
              🏆 Lihat Papan Peringkat
            </button>
            <button id="btnPlayAgain" class="btn primary" style="font-size: 15px;">
              🔄 Main Lagi
            </button>
          </div>
        </div>
      </div>
    `;

    $('#btnViewLeaderboard').onclick = () => {
      currentTab = 'leaderboard';
      render();
    };

    $('#btnPlayAgain').onclick = () => {
      gameStatus = 'intro';
      render();
    };
  }

  // ==========================================
  // TAB 2: PAPAN PERINGKAT (GLOBAL LEADERBOARD)
  // ==========================================
  async function renderLeaderboard() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
            <div>
              <span class="eyebrow">🏆 Live Leaderboard 24/7</span>
              <h2 style="margin-top: 4px;">Papan Peringkat Kopi Ijen</h2>
              <p class="muted small">Data tersinkronisasi langsung dari Google Spreadsheet resmi.</p>
            </div>
            <div class="actions">
              <a href="${config.spreadsheetUrl}" target="_blank" class="btn ghost sm">📊 Buka Spreadsheet Asli</a>
              <button id="btnRefreshLeaderboard" class="btn green sm">↻ Muat Ulang</button>
            </div>
          </div>

          <div id="leaderboardContent">
            <p class="muted" style="text-align: center; padding: 30px 0;">Memuat peringkat dari Google Spreadsheet...</p>
          </div>

          <div class="actions" style="margin-top: 24px; justify-content: center;">
            <button id="btnPlayFromLeaderboard" class="btn primary">🍒 Ikut Main Kuis Sekarang!</button>
          </div>
        </div>
      </div>
    `;

    $('#btnPlayFromLeaderboard').onclick = () => {
      currentTab = 'play';
      gameStatus = 'intro';
      render();
    };

    $('#btnRefreshLeaderboard').onclick = loadLeaderboardData;
    loadLeaderboardData();
  }

  async function loadLeaderboardData() {
    const container = $('#leaderboardContent');
    if (!container) return;

    try {
      const res = await fetch(`${API_BASE}/scores?action=get_leaderboard`);
      const data = await res.json();
      const list = data.leaderboard || [];
      cachedLeaderboard = list;

      if (!list.length) {
        container.innerHTML = `
          <div style="text-align: center; padding: 36px 14px;" class="muted">
            <p>Belum ada data pemain tercatat.</p>
            <p class="small">Jadilah orang pertama yang menyelesaikan kuis ini!</p>
          </div>
        `;
        return;
      }

      // Top 3 Podium
      const top1 = list[0];
      const top2 = list[1];
      const top3 = list[2];

      container.innerHTML = `
        <!-- Podium Top 3 -->
        <div class="podium-grid">
          ${top2 ? `
            <div class="podium-card">
              <span class="podium-badge">🥈</span>
              <div class="podium-name">${escapeHtml(top2.name)}</div>
              <div class="podium-entity">${escapeHtml(top2.entity || '—')}</div>
              <div class="podium-score">${top2.score} Poin</div>
            </div>
          ` : '<div style="display:none"></div>'}

          ${top1 ? `
            <div class="podium-card first">
              <span class="podium-badge">👑 🥇</span>
              <div class="podium-name">${escapeHtml(top1.name)}</div>
              <div class="podium-entity">${escapeHtml(top1.entity || '—')}</div>
              <div class="podium-score">${top1.score} Poin</div>
            </div>
          ` : ''}

          ${top3 ? `
            <div class="podium-card">
              <span class="podium-badge">🥉</span>
              <div class="podium-name">${escapeHtml(top3.name)}</div>
              <div class="podium-entity">${escapeHtml(top3.entity || '—')}</div>
              <div class="podium-score">${top3.score} Poin</div>
            </div>
          ` : '<div style="display:none"></div>'}
        </div>

        <!-- Tabel Peringkat Lengkap -->
        <div class="rank-table-wrap">
          <table class="rank-table">
            <thead>
              <tr>
                <th style="width: 50px;">Rank</th>
                <th>Nama Peserta</th>
                <th>Entitas / Unit</th>
                <th>Benar</th>
                <th style="text-align: right;">Total Skor</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => `
                <tr class="${p.rank === 1 ? 'rank-1' : ''}">
                  <td><b>${p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}</b></td>
                  <td><b>${escapeHtml(p.name)}</b></td>
                  <td>${escapeHtml(p.entity || '—')}</td>
                  <td>${p.correctCount}/4 benar</td>
                  <td style="text-align: right; font-size: 16px;"><b>${p.score}</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: #8c1e24;">
          Gagal memuat papan peringkat. Pastikan koneksi internet aktif.
        </div>
      `;
    }
  }

  // ==========================================
  // TAB 3: EDUKASI / RAHASIA KOPI IJEN
  // ==========================================
  function renderEducation() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner">
          <span class="eyebrow">📖 Wawasan Mutu</span>
          <h2>Rahasia Mengapa Kopi Ijen Begitu Istimewa</h2>
          <p class="muted">Kopi Arabika dari Pegunungan Ijen (Bondowoso/Banyuwangi) memiliki cita rasa khas asam buah-buahan segar (*fruity*) dengan aroma floral yang diakui dunia internasional.</p>

          <div class="edu-grid">
            <div class="edu-card">
              <h4>🌋 1. Tanah Vulkanik Kaya Hara</h4>
              <p>Lereng Gunung Ijen kaya akan unsur hara alami dari abu vulkanik, terutama kalium dan magnesium, yang memberikan nutrisi optimal bagi pohon kopi.</p>
            </div>

            <div class="edu-card">
              <h4>⛰️ 2. Ketinggian di Atas 1.000 mdpl</h4>
              <p>Suhu sejuk di dataran tinggi memperlambat proses pematangan buah kopi, sehingga penumpukan gula alami dan senyawa aromatik di dalam biji menjadi sangat padat.</p>
            </div>

            <div class="edu-card">
              <h4>🍒 3. Petik Merah Selektif</h4>
              <p>Hanya buah kopi yang benar-benar merah segar dan matang optimal (*cherry picking*) yang dipetik. Buah hijau atau setengah matang disortir agar rasa tidak getir.</p>
            </div>

            <div class="edu-card">
              <h4>🧺 4. Sortasi Ganda & Fermentasi</h4>
              <p>Melalui proses double sortasi dan fermentasi alami selama 12–36 jam untuk mengunci kejernihan rasa (*clean cup*) dan keasaman sitrus yang menyegarkan.</p>
            </div>
          </div>

          <div class="actions" style="margin-top: 20px; justify-content: center;">
            <button id="btnPlayFromEdu" class="btn primary">🍒 Mainkan Kuisnya Sekarang!</button>
          </div>
        </div>
      </div>
    `;

    $('#btnPlayFromEdu').onclick = () => {
      currentTab = 'play';
      gameStatus = 'intro';
      render();
    };
  }

  // ==========================================
  // SETUP GLOBAL CONTROLS
  // ==========================================
  function setupControls() {
    // Nav tabs switcher
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.onclick = () => {
        currentTab = btn.dataset.tab;
        render();
      };
    });

    // Audio toggle
    const audioBtn = $('#btnAudioToggle');
    if (audioBtn) {
      audioBtn.onclick = () => {
        audioMuted = !audioMuted;
        audioBtn.textContent = audioMuted ? '🔇' : '🔊';
        showToast(audioMuted ? 'Efek suara dimatikan' : 'Efek suara dinyalakan');
      };
    }

    // Fullscreen toggle
    const fsBtn = $('#btnFullscreenToggle');
    if (fsBtn) {
      fsBtn.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
          showToast('Mode layar penuh aktif');
        } else {
          document.exitFullscreen?.().catch(() => {});
          showToast('Keluar dari layar penuh');
        }
      };
    }
  }

  function init() {
    setupControls();
    render();
  }

  init();
})();
