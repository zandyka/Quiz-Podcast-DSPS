// public/app.js - Quiz Podcast DSPS (Kopi Ijen Challenge)
// Sistem Admin (Password: dsps), Entitas PTPN Group & Mobile-First Motion

(() => {
  'use strict';

  const config = window.GAME_CONFIG || {};
  const API_BASE = '/api';

  const QUESTION = 'Apa saja faktor yang membuat Kopi Ijen memiliki cita rasa istimewa dan diakui secara global?';

  // Daftar Resmi Entitas PTPN Group
  const PTPN_ENTITIES = [
    'Holding Perkebunan Nusantara (PTPN III Persero)',
    'PTPN IV PalmCo - Kantor Pusat',
    'PTPN IV PalmCo - Regional 1',
    'PTPN IV PalmCo - Regional 2',
    'PTPN IV PalmCo - Regional 3',
    'PTPN IV PalmCo - Regional 4',
    'PTPN IV PalmCo - Regional 5',
    'PTPN I SupportingCo - Kantor Pusat',
    'PTPN I SupportingCo - Regional 1',
    'PTPN I SupportingCo - Regional 2',
    'PTPN I SupportingCo - Regional 3',
    'PTPN I SupportingCo - Regional 4',
    'PTPN I SupportingCo - Regional 5',
    'PT Sinergi Gula Nusantara (SugarCo)',
    'PT Riset Perkebunan Nusantara (RPN)',
    'PT LPP Agro Nusantara (LPP)',
    'PT Kharisma Pemasaran Bersama Nusantara (KPBN)',
    'PT Industri Nabati Lestari (INL)',
    'PT Dasaplast Nusantara',
    'PT Bio Industri Nusantara',
    'PT Sarana Agro Nusantara',
    'PT Kawasan Industri Terpadu Batang (KITB)',
    'Afiliasi / Mitra PTPN Group Lainnya'
  ];

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

  // State aplikasi
  let currentTab = 'play'; // 'play' | 'leaderboard' | 'education'
  let gameStatus = 'intro'; // 'intro' | 'playing' | 'result'
  let quizGlobalStatus = 'open'; // 'open' | 'closed' (dikendalikan admin)
  let isAdminLoggedIn = false;
  let adminPassword = '';

  let playerName = '';
  let playerEntity = '';
  let score = 0;
  let correctCount = 0;
  let elapsedSeconds = 0;
  let timerInterval = null;
  let revealedBeans = {};
  let thrownBeans = {};
  let selectedBean = null;
  let beanOrder = [];
  let isBusy = false;
  let feedbackMessage = '';
  let audioMuted = false;
  let audioContext = null;

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
        y: canvas.height * 0.55,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.7) * 15,
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

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // ==========================================
  // STATUS KUIS (DIBUKA / DITUTUP ADMIN)
  // ==========================================
  async function fetchQuizStatus() {
    try {
      const res = await fetch(`${API_BASE}/scores?action=get_status`);
      const data = await res.json();
      quizGlobalStatus = data.status || 'open';
    } catch {
      quizGlobalStatus = 'open';
    }
    updateAdminUIStatus();
  }

  // ==========================================
  // RENDER CONTROLLER
  // ==========================================
  function render() {
    // Nav tab active state
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === currentTab);
    });

    const hero = $('#mainHero');
    if (hero) {
      hero.style.display = (currentTab === 'play' && gameStatus === 'playing') ? 'none' : 'block';
    }

    if (currentTab === 'play') {
      // Jika kuis ditutup oleh admin
      if (quizGlobalStatus === 'closed' && gameStatus !== 'result') {
        renderQuizClosed();
        return;
      }

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
  // LAYAR JIKA KUIS DITUTUP OLEH ADMIN
  // ==========================================
  function renderQuizClosed() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="text-align: center; max-width: 480px; margin: 0 auto; padding: 36px 18px;">
          <div style="font-size: 54px; margin-bottom: 12px;">🔒 ☕</div>
          <h2>Kuis Saat Ini Sedang Ditutup</h2>
          <p class="muted" style="margin: 10px 0 20px; font-size: 14px;">
            Terima kasih atas antusiasme seluruh rekan <b>PTPN Group</b>! Kuis telah resmi ditutup oleh panitia/admin.
          </p>
          <div style="background: #eef6ec; border: 1.5px solid #cbdbc1; border-radius: 14px; padding: 14px; font-size: 13.5px; color: #17452d; margin-bottom: 20px;">
            🏆 Anda tetap dapat melihat perolehan skor akhir seluruh peserta di Papan Peringkat.
          </div>
          <button id="btnViewLeaderboardClosed" class="btn primary" style="width: 100%;">
            🏆 Lihat Papan Peringkat PTPN Group →
          </button>
        </div>
      </div>
    `;

    $('#btnViewLeaderboardClosed').onclick = () => {
      currentTab = 'leaderboard';
      render();
    };
  }

  // ==========================================
  // TAB 1: FORM INTRO (DROPDOWN ENTITAS PTPN)
  // ==========================================
  function renderIntro() {
    const screen = $('#screen');
    const storedName = localStorage.getItem('kopi_player_name') || '';
    const storedEntity = localStorage.getItem('kopi_player_entity') || '';

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 480px; margin: 0 auto;">
          <h2>🍒 Kuis Kopi Ijen PTPN Group</h2>
          <p class="muted small">Pilih entitas asal Anda dan uji ketajaman pengetahuan tentang mutu kopi Ijen.</p>

          <form id="startQuizForm" class="stack" style="margin-top: 16px;">
            <div class="field-group">
              <label class="field-label">Nama Lengkap Peserta</label>
              <input id="inputName" class="field" required placeholder="Ketik nama lengkap Anda..." value="${escapeHtml(storedName)}" maxlength="60" autocomplete="name">
            </div>

            <!-- Dropdown Entitas PTPN Group -->
            <div class="field-group">
              <label class="field-label">Asal Unit Kerja / Entitas PTPN Group</label>
              <select id="selectEntity" class="field" required>
                <option value="" disabled ${!storedEntity ? 'selected' : ''}>-- Pilih Entitas PTPN Group --</option>
                ${PTPN_ENTITIES.map(ent => `
                  <option value="${escapeHtml(ent)}" ${storedEntity === ent ? 'selected' : ''}>${escapeHtml(ent)}</option>
                `).join('')}
              </select>
            </div>

            <!-- Petunjuk Ringkas Kuis Mobile -->
            <div style="background: #f4f8f1; border: 1.5px solid #cbdbc1; border-radius: 14px; padding: 14px; margin: 6px 0;">
              <strong style="color: #17452d; display: block; margin-bottom: 5px; font-size: 13.5px;">📖 Cara Main Singkat:</strong>
              <ul style="padding-left: 18px; font-size: 13px; color: #284c36; line-height: 1.6;">
                <li>Ada <b>8 buah kopi merah</b>. Pilih <b>4 faktor mutu</b> Kopi Ijen.</li>
                <li>Jawaban Benar: <b>+100</b> · Pilihan Salah: <b>-50</b>.</li>
                <li>Temukan 4 buah benar untuk bonus sapu bersih <b>+100 poin</b>!</li>
                <li>Bebas bermain tanpa batasan durasi acara kuis.</li>
              </ul>
            </div>

            <button type="submit" class="btn primary" style="font-size: 16px; padding: 14px; margin-top: 4px;">
              🍒 Mulai Kuis Sekarang →
            </button>
          </form>

          <div style="margin-top: 16px; text-align: center;">
            <button id="btnQuickLeaderboard" class="btn ghost sm">🏆 Lihat Papan Peringkat</button>
          </div>
        </div>
      </div>
    `;

    $('#startQuizForm').onsubmit = e => {
      e.preventDefault();
      const n = $('#inputName').value.trim();
      const ent = $('#selectEntity').value;

      if (n.length < 2) return showToast('Nama lengkap minimal 2 karakter');
      if (!ent) return showToast('Pilih salah satu entitas PTPN Group');

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
    elapsedSeconds = 0;
    revealedBeans = {};
    thrownBeans = {};
    selectedBean = null;
    feedbackMessage = '';
    beanOrder = shuffle([1, 2, 3, 4, 5, 6, 7, 8]);

    gameStatus = 'playing';
    render();

    // Stopwatch permainan santai
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      const timeEl = $('#timeDisplay');
      if (timeEl) timeEl.textContent = formatTime(elapsedSeconds);
    }, 1000);

    showToast('Kuis dimulai! Ketuk buah kopi untuk membaca.');
  }

  // ==========================================
  // TAB 1: ARENA PERMAINAN (PLAYFIELD DENGAN MOTION)
  // ==========================================
  function renderPlayfield() {
    const screen = $('#screen');
    const totalThrown = Object.keys(thrownBeans).length;

    screen.innerHTML = `
      <!-- Stats Bar Mobile -->
      <div class="stats" style="margin-bottom: 10px;">
        <div class="stat-item">
          <b id="timeDisplay">${formatTime(elapsedSeconds)}</b>
          <small>Waktu Main</small>
        </div>
        <div class="stat-item">
          <b id="scoreDisplay">${score}</b>
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
        <small>🍃 SOAL KUIS PODCAST DSPS · PILIH 4 JAWABAN TEPAT</small>
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

        <!-- Target Keranjang Animasi -->
        <div class="basket-zone" id="basketTarget">
          <span class="basket-caption">🧺 KERANJANG BIJI TERBAIK</span>
          ${BASKET_SVG}
        </div>
      </div>

      <p style="text-align: center; color: #cbe0d3; font-size: 12.5px; margin-top: 8px;">
        💡 <b>Tips:</b> Ketuk buah untuk membaca opsinya, lalu pilih <b>"Masukkan ke Keranjang"</b>.
      </p>

      <!-- Sticky Action Sheet Mobile (Jangkauan Jempol) -->
      ${selectedBean ? `
        <div class="selected-bar" id="selectedSheet">
          <div>
            <strong>🍒 Buah Kopi Nomor ${selectedBean} Terpilih:</strong>
            <p>${escapeHtml(revealedBeans[selectedBean] || '')}</p>
          </div>
          <div class="actions" style="gap: 8px;">
            <button id="btnThrowBean" class="btn green" style="flex: 1; font-size: 14.5px;">
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

      // Drag interaction opsional
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

        if (dist > 35 && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
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

    const bean = BEANS_DATA.find(b => b.id === bId);
    if (!bean) return;

    revealedBeans[bId] = bean.label;
    selectedBean = bId;
    renderPlayfield();
  }

  // Lempar ke keranjang dengan motion & efek jiggle
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

    // Animasi Keranjang Jiggle
    const basket = $('#basketTarget');
    if (basket) {
      basket.classList.remove('jiggle');
      void basket.offsetWidth; // trigger reflow
      basket.classList.add('jiggle');
    }

    let bonus = false;
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
      }, 1000);
      return;
    }

    renderPlayfield();

    setTimeout(() => {
      feedbackMessage = '';
      if (gameStatus === 'playing') renderPlayfield();
      isBusy = false;
    }, 2200);
  }

  // ==========================================
  // SELESAI KUIS & AUTO-SYNC KE SPREADSHEET
  // ==========================================
  async function finishQuiz() {
    if (timerInterval) clearInterval(timerInterval);
    gameStatus = 'result';
    render();
    fireConfetti();

    // Simpan otomatis ke Google Spreadsheet via API
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
    const waText = `Halo! 🍒 Saya baru saja meraih skor ${score} poin di Quiz Podcast DSPS Kopi Ijen (${playerEntity})! Coba kalahkan skor saya di sini: ${window.location.origin}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 480px; margin: 0 auto; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 6px;">🎉 🏆 ☕</div>
          <h2>Kuis Selesai! Kerja Luar Biasa!</h2>
          <p class="muted small" style="margin-top: 2px;">
            <b>${escapeHtml(playerName)}</b> · ${escapeHtml(playerEntity)}
          </p>

          <!-- Kartu Nilai Akhir -->
          <div style="background: linear-gradient(145deg, #fffcf0 0%, #fff7d6 100%); border: 2.5px solid #f5b027; border-radius: 18px; padding: 20px; margin: 18px 0; box-shadow: var(--shadow-pop);">
            <small style="color: #8c630f; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px;">TOTAL SKOR AKHIR ANDA</small>
            <div style="font-size: clamp(44px, 10vw, 58px); font-weight: 950; color: #16472b; margin: 4px 0;">
              ${score}
            </div>
            <p style="color: #3b5f48; font-weight: 700; font-size: 14px;">
              ${correctCount === 4 ? '🌟 Sempurna! Anda memanen semua 4 buah kopi terbaik!' : `Anda berhasil menemukan ${correctCount} dari 4 jawaban benar.`}
            </p>
            <div class="small muted" style="margin-top: 4px;">Waktu pengerjaan: <b>${formatTime(elapsedSeconds)}</b></div>
          </div>

          <div style="background: #eef6ec; border: 1.5px solid #c8d9be; border-radius: 12px; padding: 12px; font-size: 13px; color: #19462b; margin-bottom: 20px;">
            🟢 <b>Tercatat:</b> Nilai Anda otomatis masuk ke Google Spreadsheet resmi.
          </div>

          <!-- Tombol Aksi Mobile -->
          <div class="stack" style="gap: 10px;">
            <a href="${waUrl}" target="_blank" class="btn wa">
              💬 Bagikan Skor ke WhatsApp
            </a>
            <button id="btnViewLeaderboard" class="btn green">
              🏆 Lihat Papan Peringkat PTPN Group
            </button>
            <button id="btnPlayAgain" class="btn primary">
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
  // TAB 2: PAPAN PERINGKAT GLOBAL
  // ==========================================
  async function renderLeaderboard() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 480px; margin: 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
            <div>
              <span class="eyebrow">🏆 Papan Peringkat</span>
              <h2 style="margin-top: 2px;">Klasemen PTPN Group</h2>
            </div>
            <button id="btnRefreshLeaderboard" class="btn green sm">↻ Muat Ulang</button>
          </div>

          <div id="leaderboardContent">
            <p class="muted small" style="text-align: center; padding: 24px 0;">Memuat peringkat dari Google Spreadsheet...</p>
          </div>

          <div class="actions" style="margin-top: 18px; justify-content: center;">
            <button id="btnPlayFromLeaderboard" class="btn primary" style="width: 100%;">🍒 Mainkan Kuis Sekarang!</button>
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

      if (!list.length) {
        container.innerHTML = `
          <div style="text-align: center; padding: 30px 10px;" class="muted small">
            Belum ada skor peserta. Jadilah yang pertama bermain!
          </div>
        `;
        return;
      }

      const top1 = list[0];
      const top2 = list[1];
      const top3 = list[2];

      container.innerHTML = `
        <!-- Podium Top 3 Mobile -->
        <div class="podium-grid">
          ${top2 ? `
            <div class="podium-card">
              <span class="podium-badge">🥈</span>
              <div class="podium-name">${escapeHtml(top2.name)}</div>
              <div class="podium-entity">${escapeHtml(top2.entity || '—')}</div>
              <div class="podium-score">${top2.score}</div>
            </div>
          ` : '<div style="display:none"></div>'}

          ${top1 ? `
            <div class="podium-card first">
              <span class="podium-badge">👑 🥇</span>
              <div class="podium-name">${escapeHtml(top1.name)}</div>
              <div class="podium-entity">${escapeHtml(top1.entity || '—')}</div>
              <div class="podium-score">${top1.score}</div>
            </div>
          ` : ''}

          ${top3 ? `
            <div class="podium-card">
              <span class="podium-badge">🥉</span>
              <div class="podium-name">${escapeHtml(top3.name)}</div>
              <div class="podium-entity">${escapeHtml(top3.entity || '—')}</div>
              <div class="podium-score">${top3.score}</div>
            </div>
          ` : '<div style="display:none"></div>'}
        </div>

        <!-- Tabel Peringkat Lengkap -->
        <div class="rank-table-wrap">
          <table class="rank-table">
            <thead>
              <tr>
                <th style="width: 44px;">Rank</th>
                <th>Nama Peserta</th>
                <th>Entitas PTPN</th>
                <th style="text-align: right;">Skor</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => `
                <tr class="${p.rank === 1 ? 'rank-1' : ''}">
                  <td><b>${p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}</b></td>
                  <td><b>${escapeHtml(p.name)}</b></td>
                  <td>${escapeHtml(p.entity || '—')}</td>
                  <td style="text-align: right; font-size: 15px;"><b>${p.score}</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #8c1e24;" class="small">
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
        <div class="panel-inner" style="max-width: 480px; margin: 0 auto;">
          <span class="eyebrow">📖 Wawasan Mutu</span>
          <h2>Rahasia Mutu Kopi Ijen</h2>
          <p class="muted small">Faktor-faktor yang menjadikan Kopi Ijen primadona di pasar kopi spesialti dunia:</p>

          <div class="edu-grid">
            <div class="edu-card">
              <h4>🌋 1. Tanah Vulkanik Kaya Hara</h4>
              <p>Lereng Gunung Ijen kaya akan kalium & magnesium alami yang memberikan nutrisi optimal bagi pohon kopi.</p>
            </div>
            <div class="edu-card">
              <h4>⛰️ 2. Di Atas 1.000 mdpl</h4>
              <p>Suhu sejuk dataran tinggi memperlambat pematangan, sehingga gula alami dan senyawa aromatik buah kopi sangat padat.</p>
            </div>
            <div class="edu-card">
              <h4>🍒 3. Petik Merah Selektif</h4>
              <p>Hanya buah merah segar matang optimal yang dipetik. Buah hijau dipisahkan agar rasa tidak getir.</p>
            </div>
            <div class="edu-card">
              <h4>🧺 4. Sortasi Ganda & Fermentasi</h4>
              <p>Proses double sortasi dan fermentasi alami 12–36 jam untuk mengunci rasa bersih (*clean cup*) dan asam buah segar.</p>
            </div>
          </div>

          <div class="actions" style="margin-top: 16px; justify-content: center;">
            <button id="btnPlayFromEdu" class="btn primary" style="width: 100%;">🍒 Mainkan Kuis Sekarang!</button>
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
  // PANEL ADMIN (PASSWORD: dsps)
  // ==========================================
  function updateAdminUIStatus() {
    const isClosed = quizGlobalStatus === 'closed';
    const badge = $('#badgeAdminStatus');
    const text = $('#textAdminStatus');
    const btn = $('#btnToggleQuizStatus');

    if (badge) {
      badge.textContent = isClosed ? '🔴 KUIS DITUTUP' : '🟢 KUIS DIBUKA';
      badge.style.color = isClosed ? '#d32f2f' : '#1e704a';
    }
    if (text) {
      text.innerHTML = isClosed
        ? '🔴 KUIS DITUTUP (Peserta Tidak Bisa Bermain)'
        : '🟢 KUIS DIBUKA (Peserta Bebas Bermain)';
      text.style.color = isClosed ? '#8b1313' : '#124d31';
    }
    if (btn) {
      btn.className = isClosed ? 'btn green' : 'btn danger';
      btn.textContent = isClosed ? '▶ Buka Kuis Kembali' : '■ Tutup Kuis Sekarang';
    }
  }

  function setupAdminModal() {
    const modal = $('#adminModal');
    const btnOpen = $('#btnAdminModal');
    const btnClose = $('#btnCloseAdminModal');
    const formLogin = $('#adminLoginForm');
    const inputPass = $('#inputAdminPass');
    const loginSection = $('#adminLoginSection');
    const panelSection = $('#adminPanelSection');
    const btnToggle = $('#btnToggleQuizStatus');
    const btnLogout = $('#btnLogoutAdmin');

    btnOpen.onclick = () => {
      modal.classList.add('open');
      if (isAdminLoggedIn) {
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        updateAdminUIStatus();
      } else {
        loginSection.style.display = 'block';
        panelSection.style.display = 'none';
        inputPass.value = '';
        inputPass.focus();
      }
    };

    btnClose.onclick = () => modal.classList.remove('open');

    formLogin.onsubmit = async e => {
      e.preventDefault();
      const pass = inputPass.value.trim();
      if (pass !== 'dsps') {
        showToast('❌ Password Admin salah!');
        inputPass.value = '';
        inputPass.focus();
        return;
      }

      isAdminLoggedIn = true;
      adminPassword = pass;
      loginSection.style.display = 'none';
      panelSection.style.display = 'block';
      updateAdminUIStatus();
      showToast('✅ Berhasil masuk sebagai Admin');
    };

    btnToggle.onclick = async () => {
      const targetStatus = quizGlobalStatus === 'open' ? 'closed' : 'open';
      try {
        const res = await fetch(`${API_BASE}/scores?action=admin_set_status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: adminPassword,
            status: targetStatus
          })
        });
        const data = await res.json();
        if (data.ok) {
          quizGlobalStatus = data.status;
          updateAdminUIStatus();
          showToast(data.message);
          render();
        } else {
          showToast(data.error || 'Gagal mengubah status');
        }
      } catch {
        showToast('Gagal menghubungi server');
      }
    };

    btnLogout.onclick = () => {
      isAdminLoggedIn = false;
      adminPassword = '';
      modal.classList.remove('open');
      showToast('Admin berhasil keluar');
    };
  }

  // ==========================================
  // CONTROLS GLOBAL
  // ==========================================
  function setupControls() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.onclick = () => {
        currentTab = btn.dataset.tab;
        render();
      };
    });

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
          showToast('Mode layar penuh aktif');
        } else {
          document.exitFullscreen?.().catch(() => {});
          showToast('Keluar dari layar penuh');
        }
      };
    }

    setupAdminModal();
  }

  async function init() {
    setupControls();
    await fetchQuizStatus();
    render();
  }

  init();
})();
