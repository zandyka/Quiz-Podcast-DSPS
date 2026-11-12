// public/app.js - Quiz Podcast DSPS (Edisi Khusus PTPN Group)
// Fitur:
// 1. Musik Jingle PTPN (Web Audio Fanfare & March Synthesizer)
// 2. Papan Peringkat Khusus Admin (Password: dsps)
// 3. Edukasi dihilangkan, navigasi ramah mobile
// 4. Sematan YouTube Podcast Kata Kalcer episode "Rahasia di Balik Cita Rasa Kopi Ijen"
// 5. Mode Simulasi Interaktif Soal Jenis Kopi PTPN (Arabika, Robusta, Liberika vs Excelsa)

(() => {
  'use strict';

  const API_BASE = '/api';

  // Bank Soal Kuis Utama: Kopi Ijen (8 Buah Kopi: 4 Benar & 4 Salah)
  const QUESTION_MAIN = 'Apa saja faktor yang membuat Kopi Ijen memiliki cita rasa istimewa dan diakui secara global?';
  const BEANS_MAIN = [
    { id: 1, label: 'Tanah vulkanik kaya unsur hara seperti kalium dan magnesium', correct: true },
    { id: 2, label: 'Ditanam di atas 1.000 mdpl sehingga pematangan buah lebih lambat', correct: true },
    { id: 3, label: 'Pemetikan selektif hanya pada buah kopi yang merah segar', correct: true },
    { id: 4, label: 'Penerapan double sortasi dan fermentasi alami selama 12–36 jam', correct: true },
    { id: 5, label: 'Memetik semua buah kopi tanpa memperhatikan tingkat kematangan', correct: false },
    { id: 6, label: 'Mempercepat pematangan buah untuk menghilangkan seluruh keasaman', correct: false },
    { id: 7, label: 'Mengolah biji tanpa sortasi untuk menghasilkan rasa yang konsisten', correct: false },
    { id: 8, label: 'Tanah miskin unsur hara membuat biji kopi lebih manis', correct: false }
  ];

  // Bank Soal Ronde 2: Soal Pilihan Ganda Nilai Budaya
  const QUESTION_ROUND_2 = 'Apa nilai budaya yang tercantum dalam podcast jejak kopi nusantara?';
  const OPTIONS_ROUND_2 = [
    { key: 'A', text: 'Continuous learning', correct: false },
    { key: 'B', text: 'Excellence', correct: true },
    { key: 'C', text: 'Owner’s mindset', correct: false },
    { key: 'D', text: 'Networking', correct: false }
  ];
  const EXPLANATION_ROUND_2 = 'Nilai budaya Excellence (Keunggulan) merupakan salah satu pilar budaya kerja utama yang ditekankan dalam podcast jejak kopi nusantara — mengedepankan komitmen mutu terbaik, standar tinggi, dan dedikasi planters dari hulu kebun hingga ke cangkir kopi.';

  // Bank Soal Simulasi Tutorial (Soal Revisi 5)
  const QUESTION_SIMULATION = 'Apa saja jenis kopi yang diproduksi PTPN?';
  const BEANS_SIMULATION = [
    {
      id: 1,
      label: 'Arabika',
      correct: true,
      info: 'PTPN memproduksi kopi Arabika unggulan dari dataran tinggi sejuk (seperti Ijen-Raung) dengan cita rasa asam segar buah dan aroma bunga manis.'
    },
    {
      id: 2,
      label: 'Robusta',
      correct: true,
      info: 'PTPN merupakan produsen besar kopi Robusta berkualitas tinggi di berbagai kebun Nusantara dengan rasa kuat, tebal, dan aroma cokelat mantap.'
    },
    {
      id: 3,
      label: 'Liberika',
      correct: true,
      info: 'Kopi Liberika juga dibudidayakan di areal perkebunan PTPN dengan keunikan aroma buah nangka serta adaptasi kuat di lahan gambut.'
    },
    {
      id: 4,
      label: 'Excelsa',
      correct: false,
      info: 'Excelsa bukan merupakan komoditas jenis kopi utama yang diproduksi secara massal oleh PTPN Group (PTPN fokus pada Arabika, Robusta, & Liberika).'
    }
  ];

  // Data Podcast Kata Kalcer
  const PODCAST_DATA = {
    title: 'Rahasia di Balik Cita Rasa Kopi Ijen',
    show: 'Podcast Kata Kalcer · Life at PTPN',
    videoId: 'alpL3rtyaLU',
    caption: '(Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)',
    youtubeUrl: 'https://www.youtube.com/watch?v=alpL3rtyaLU'
  };

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

  const $ = s => document.querySelector(s);
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // ==========================================
  // JINGLE PTPN AUDIO PLAYER (One PTPN One Culture)
  // Default: MENYALA SECARA OTOMATIS
  // ==========================================
  class PTPNJinglePlayer {
    constructor() {
      this.audio = null;
      this.isPlaying = false;
      this.userPaused = false;
      this.interactionAttached = false;
    }

    getAudioElement() {
      if (!this.audio) {
        this.audio = $('#bgmAudio') || new Audio('audio/jingle-ptpn.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.65;

        this.audio.addEventListener('play', () => {
          this.isPlaying = true;
          this.updateUI(true);
        });

        this.audio.addEventListener('pause', () => {
          this.isPlaying = false;
          this.updateUI(false);
        });

        this.audio.addEventListener('ended', () => {
          this.isPlaying = false;
          this.updateUI(false);
        });
      }
      return this.audio;
    }

    async play() {
      if (this.userPaused) return;
      const a = this.getAudioElement();
      try {
        await a.play();
        this.isPlaying = true;
        this.updateUI(true);
      } catch (err) {
        // Jika diblokir oleh kebijakan browser sebelum sentuhan pertama, pasang listener interaksi
        this.attachFirstInteractionListener();
      }
    }

    attachFirstInteractionListener() {
      if (this.interactionAttached) return;
      this.interactionAttached = true;

      const onFirstInteraction = () => {
        if (!this.userPaused) {
          const a = this.getAudioElement();
          a.play().then(() => {
            this.isPlaying = true;
            this.updateUI(true);
          }).catch(() => {});
        }
        ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
          window.removeEventListener(evt, onFirstInteraction, true);
        });
      };

      ['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, onFirstInteraction, { capture: true, once: true });
      });
    }

    pause() {
      this.userPaused = true;
      const a = this.getAudioElement();
      a.pause();
      this.isPlaying = false;
      this.updateUI(false);
    }

    toggle() {
      const a = this.getAudioElement();
      if (!a.paused && this.isPlaying) {
        this.pause();
      } else {
        this.userPaused = false;
        this.play();
      }
      return this.isPlaying;
    }

    updateUI(playing) {
      const btn = $('#btnMusicToggle');
      if (!btn) return;
      btn.classList.toggle('playing', playing);
      btn.setAttribute('title', playing ? 'Jeda Jingle One PTPN One Culture' : 'Putar Jingle One PTPN One Culture');
    }
  }

  const jinglePlayer = new PTPNJinglePlayer();

  // Basket SVG Animasi
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
  // STATE APLIKASI
  // ==========================================
  let currentTab = 'quiz'; // 'quiz' | 'podcast'
  let gameStatus = 'intro'; // 'intro' | 'simulation' | 'playing' | 'round1_complete' | 'round2' | 'result'
  let quizGlobalStatus = 'open'; // 'open' | 'closed' (dikontrol oleh admin)

  let isAdminLoggedIn = false;
  let adminPassword = '';
  let cachedLeaderboard = [];

  // Data Peserta & Kuis Utama
  let playerName = '';
  let playerEntity = '';
  let playerWhatsApp = '';
  let score = 0; // Total skor akumulasi (Ronde 1 + Ronde 2)
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

  // State Ronde 2 (Pilihan Ganda Nilai Budaya)
  let round1Score = 0;
  let round2Score = 0;
  let round2Answer = '';
  let round2Correct = false;
  let round2Selected = null;
  let round2Done = false;

  // State Simulasi Tutorial
  let simScore = 0;
  let simCorrectCount = 0;
  let simRevealedBeans = {};
  let simThrownBeans = {};
  let simSelectedBean = null;
  let simFeedback = null; // { type: 'correct'|'wrong', title: string, text: string }

  // ==========================================
  // EFEK CONFETTI & SOUND
  // ==========================================
  function fireConfetti() {
    const canvas = $('#confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f5b027', '#25d366', '#ff4757', '#2ed573', '#ffffff', '#ffa502'];
    const particles = [];
    for (let i = 0; i < 90; i++) {
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
  // FETCH STATUS KUIS GLOBAL
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
      hero.style.display = (currentTab === 'quiz' && (gameStatus === 'playing' || gameStatus === 'simulation' || gameStatus === 'round1_complete' || gameStatus === 'round2')) ? 'none' : 'block';
    }

    if (currentTab === 'quiz') {
      if (quizGlobalStatus === 'closed' && gameStatus !== 'result') {
        renderQuizClosed();
        return;
      }
      if (gameStatus === 'intro') renderIntro();
      else if (gameStatus === 'simulation') renderSimulation();
      else if (gameStatus === 'playing') renderPlayfield();
      else if (gameStatus === 'round1_complete') renderRound1Complete();
      else if (gameStatus === 'round2') renderRound2();
      else if (gameStatus === 'result') renderResult();
    } else if (currentTab === 'podcast') {
      renderPodcastTab();
    }
  }

  // ==========================================
  // LAYAR JIKA KUIS DITUTUP ADMIN
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
            📢 Papan peringkat dan penetapan pemenang dikelola langsung oleh Panitia Admin melalui dashboard khusus.
          </div>
          <button id="btnOpenAdminFromClosed" class="btn primary" style="width: 100%;">
            🔒 Masuk Panel Admin Panitia →
          </button>
        </div>
      </div>
    `;

    $('#btnOpenAdminFromClosed').onclick = () => {
      $('#btnAdminModal').click();
    };
  }

  // ==========================================
  // TAB 1: FORM PENDAFTARAN & INTRO (MOBILE-FIRST)
  // Termasuk Sematan Video Podcast Kata Kalcer & Tombol Simulasi
  // ==========================================
  function renderIntro() {
    const screen = $('#screen');
    const storedName = localStorage.getItem('kopi_player_name') || '';
    const storedEntity = localStorage.getItem('kopi_player_entity') || '';
    const storedWhatsApp = localStorage.getItem('kopi_player_wa') || '';

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 520px; margin: 0 auto;">
          <h2>Kata Kalcer Podcast Interactive Quiz</h2>
          <p class="muted small">Lengkapi data kamu, ikuti simulasi memetik kopi, dan saksikan podcast resminya!</p>

          <!-- Sematan Video YouTube Podcast Kata Kalcer -->
          <div class="podcast-embed-card">
            <div class="podcast-highlight-badge">🎙️ Kuis podcast jejak kopi nusantara</div>
            <p class="podcast-title-tag">
              (Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)
            </p>

            <div class="video-container">
              <iframe 
                src="https://www.youtube-nocookie.com/embed/${PODCAST_DATA.videoId}?rel=0" 
                title="${escapeHtml(PODCAST_DATA.title)}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>

            <p class="podcast-title-tag bottom">
              (Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)
            </p>

            <a href="${PODCAST_DATA.youtubeUrl}" target="_blank" rel="noopener" class="btn-yt">
              ▶ Buka & Tonton di Aplikasi YouTube
            </a>
          </div>

          <!-- Form Identitas Peserta -->
          <form id="startQuizForm" class="stack" style="margin-top: 14px;">
            <div class="field-group">
              <label class="field-label">Nama Lengkap Peserta</label>
              <input id="inputName" class="field" required placeholder="Ketik nama lengkap kamu..." value="${escapeHtml(storedName)}" maxlength="60" autocomplete="name">
            </div>

            <div class="field-group">
              <label class="field-label">Asal Unit Kerja / Entitas PTPN Group</label>
              <select id="selectEntity" class="field" required>
                <option value="" disabled ${!storedEntity ? 'selected' : ''}>-- Pilih Entitas PTPN Group --</option>
                ${PTPN_ENTITIES.map(ent => `
                  <option value="${escapeHtml(ent)}" ${storedEntity === ent ? 'selected' : ''}>${escapeHtml(ent)}</option>
                `).join('')}
              </select>
            </div>

            <!-- Kolom Nomor WhatsApp di Bawah Entitas -->
            <div class="field-group">
              <label class="field-label">Nomor WhatsApp Aktif</label>
              <input type="tel" id="inputWhatsApp" class="field" required placeholder="Contoh: 081234567890" value="${escapeHtml(storedWhatsApp)}" maxlength="20" autocomplete="tel">
              <small class="muted" style="font-size: 11px; margin-top: 3px; display: block;">
                Nomor WhatsApp kamu diperlukan untuk konfirmasi dan pengumuman pemenang kuis.
              </small>
            </div>

            <!-- Petunjuk Aturan Poin -->
            <div style="background: #f4f8f1; border: 1.5px solid #cbdbc1; border-radius: 14px; padding: 14px; margin: 6px 0;">
              <strong style="color: #17452d; display: block; margin-bottom: 5px; font-size: 13.5px;">📖 Aturan Main Kuis (2 Ronde):</strong>
              <ul style="padding-left: 18px; font-size: 13px; color: #284c36; line-height: 1.6;">
                <li><b>Ronde 1 (Petik Buah Kopi):</b> 8 buah kopi, pilih 4 faktor mutu Kopi Ijen (Benar: <b>+100</b>, Salah: <b>-50</b>, Bonus Sapu Bersih: <b>+100</b>).</li>
                <li><b>Ronde 2 (Pilihan Ganda):</b> Jawab 1 pertanyaan nilai budaya planters dari podcast (Benar: <b>+100 poin</b>).</li>
                <li><b>Total Skor Maksimal:</b> <b>600 poin</b>. Hasil tersimpan otomatis di Google Spreadsheet panitia!</li>
              </ul>
            </div>

            <!-- Tombol Aksi: Simulasi atau Langsung Main -->
            <div class="stack" style="gap: 10px; margin-top: 6px;">
              <button type="button" id="btnGoSimulation" class="btn green" style="font-size: 15px; padding: 13px;">
                🧪 Coba Simulasi Kuis (Latihan Dulu) →
              </button>
              <button type="submit" class="btn primary" style="font-size: 16px; padding: 14px;">
                🍒 Langsung Mulai Kuis Utama →
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Handler Mulai Simulasi
    $('#btnGoSimulation').onclick = () => {
      const n = $('#inputName').value.trim();
      const ent = $('#selectEntity').value;
      const wa = $('#inputWhatsApp').value.trim();
      if (n) {
        playerName = n;
        localStorage.setItem('kopi_player_name', n);
      }
      if (ent) {
        playerEntity = ent;
        localStorage.setItem('kopi_player_entity', ent);
      }
      if (wa) {
        playerWhatsApp = wa;
        localStorage.setItem('kopi_player_wa', wa);
      }
      // Mulai jingle PTPN
      jinglePlayer.play();
      startSimulation();
    };

    // Handler Form Submit Kuis Utama
    $('#startQuizForm').onsubmit = e => {
      e.preventDefault();
      const n = $('#inputName').value.trim();
      const ent = $('#selectEntity').value;
      const wa = $('#inputWhatsApp').value.trim();

      if (n.length < 2) return showToast('Nama lengkap minimal 2 karakter');
      if (!ent) return showToast('Pilih salah satu entitas PTPN Group');
      if (!wa || wa.length < 8) return showToast('Masukkan nomor WhatsApp aktif kamu yang valid');

      playerName = n;
      playerEntity = ent;
      playerWhatsApp = wa;
      localStorage.setItem('kopi_player_name', n);
      localStorage.setItem('kopi_player_entity', ent);
      localStorage.setItem('kopi_player_wa', wa);

      // Mulai jingle PTPN
      jinglePlayer.play();
      startQuiz();
    };
  }

  // ==========================================
  // REVISI 5: MODE SIMULASI INTERAKTIF (TUTORIAL)
  // Soal: "Apa saja jenis kopi yang diproduksi PTPN?"
  // Pilihan: Arabika (Benar), Robusta (Benar), Liberika (Benar), Excelsa (Salah)
  // ==========================================
  function startSimulation() {
    simScore = 0;
    simCorrectCount = 0;
    simRevealedBeans = {};
    simThrownBeans = {};
    simSelectedBean = null;
    simFeedback = null;
    gameStatus = 'simulation';
    render();
    showToast('🧪 Mode Simulasi Dimulai! Coba ketuk buah kopi.');
  }

  function renderSimulation() {
    const screen = $('#screen');
    const totalSimThrown = Object.keys(simThrownBeans).length;

    screen.innerHTML = `
      <!-- Stats Bar Simulasi -->
      <div class="stats" style="margin-bottom: 10px;">
        <div class="stat-item">
          <b>🧪 LATIHAN</b>
          <small>Mode</small>
        </div>
        <div class="stat-item">
          <b id="simScoreDisplay">${simScore}</b>
          <small>Skor Simulasi</small>
        </div>
        <div class="stat-item">
          <b>${simCorrectCount}/3</b>
          <small>Benar</small>
        </div>
        <div class="stat-item">
          <b>${totalSimThrown}/4</b>
          <small>Dipetik</small>
        </div>
      </div>

      <!-- Banner Pertanyaan Simulasi (Revisi 5) -->
      <div class="game-question">
        <div class="sim-badge">🧪 SIMULASI KUIS · SOAL LATIHAN</div>
        <h2 style="margin-top: 4px;">${QUESTION_SIMULATION}</h2>
        <small style="color: #c9e0d1; display: block; margin-top: 4px;">
          Pilih 3 jenis kopi yang benar (+100) dan hindari yang bukan (-50)!
        </small>
      </div>

      <!-- Playfield 4 Buah Kopi Simulasi (2x2 Grid) -->
      <div class="playfield" id="playfieldSim">
        <div class="bean-grid" style="grid-template-columns: repeat(2, 1fr); max-width: 380px; margin: 0 auto;">
          ${BEANS_SIMULATION.map(b => {
            const isRevealed = Boolean(simRevealedBeans[b.id]);
            const isThrown = Boolean(simThrownBeans[b.id]);
            const label = simRevealedBeans[b.id] || '';

            return `
              <button class="bean-card ${isRevealed ? 'revealed' : ''} ${isThrown ? 'thrown' : ''}" 
                      data-sim-bean="${b.id}" 
                      ${isThrown ? 'disabled' : ''}
                      aria-label="Buah Kopi ${b.id}">
                <div class="cherry-graphic"></div>
                ${isRevealed ? `
                  <div class="answer-box">
                    <span style="font-size: 15px; font-weight: 900;">${escapeHtml(label)}${isThrown ? ' ✓' : ''}</span>
                  </div>
                ` : `
                  <div class="number-badge">OPSI ${b.id} · ?</div>
                `}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Target Keranjang Animasi -->
        <div class="basket-zone" id="basketTargetSim">
          <span class="basket-caption">🧺 KERANJANG BIJI TERBAIK</span>
          ${BASKET_SVG}
        </div>
      </div>

      <!-- Feedback Hasil Pilihan Simulasi -->
      ${simFeedback ? `
        <div class="sim-feedback-box ${simFeedback.type}">
          <strong>${simFeedback.title}</strong>
          <p style="margin-top: 3px;">${escapeHtml(simFeedback.text)}</p>
        </div>
      ` : ''}

      <!-- Sticky Action Bar Jangkauan Jempol -->
      ${simSelectedBean ? `
        <div class="selected-bar" id="selectedSheetSim">
          <div>
            <strong>🍒 Opsi ${simSelectedBean} Terpilih: "${escapeHtml(simRevealedBeans[simSelectedBean])}"</strong>
            <p style="font-size: 12.5px; color: #435e4e;">Masukkan ke keranjang untuk menguji jawaban.</p>
          </div>
          <div class="actions" style="gap: 8px;">
            <button id="btnThrowSimBean" class="btn green" style="flex: 1; font-size: 14px;">
              🧺 Masukkan ke Keranjang
            </button>
            <button id="btnCancelSimBean" class="btn ghost sm">Batal</button>
          </div>
        </div>
      ` : ''}

      <!-- Tombol Penyelesaian Simulasi / Skip ke Kuis Utama -->
      <div style="margin-top: 14px;" class="stack">
        ${simCorrectCount >= 3 ? `
          <div style="background: linear-gradient(145deg, #fffcf0 0%, #fff7d6 100%); border: 2px solid #f5b027; border-radius: 14px; padding: 14px; text-align: center; color: #173f27;">
            <div style="font-size: 26px;">🎉</div>
            <strong style="display: block; font-size: 15px;">Simulasi Sukses! Kamu Siap Masuk Kuis Utama!</strong>
            <p style="font-size: 12.5px; color: #476852; margin: 4px 0 10px;">
              Kamu telah menguasai cara memetik buah kopi dan penghitungan skor (+100 / -50).
            </p>
            <button id="btnFinishSimToGoMain" class="btn primary" style="width: 100%; font-size: 15px; font-weight: 900;">
              🚀 Masuk ke Kuis Utama Kopi Ijen →
            </button>
          </div>
        ` : `
          <button id="btnSkipSim" class="btn ghost sm" style="width: 100%; color: #cbe0d3;">
            Lewati Simulasi & Langsung ke Kuis Utama →
          </button>
        `}
      </div>
    `;

    // Event listener buah kopi simulasi
    for (const el of document.querySelectorAll('[data-sim-bean]')) {
      const bId = Number(el.dataset.simBean);
      el.onclick = () => handleSimBeanClick(bId);
    }

    if ($('#btnThrowSimBean')) $('#btnThrowSimBean').onclick = handleThrowSimBean;
    if ($('#btnCancelSimBean')) $('#btnCancelSimBean').onclick = () => { simSelectedBean = null; renderSimulation(); };

    if ($('#btnFinishSimToGoMain')) {
      $('#btnFinishSimToGoMain').onclick = () => {
        if (!playerName) {
          gameStatus = 'intro';
          render();
        } else {
          startQuiz();
        }
      };
    }

    if ($('#btnSkipSim')) {
      $('#btnSkipSim').onclick = () => {
        if (!playerName) {
          gameStatus = 'intro';
          render();
        } else {
          startQuiz();
        }
      };
    }
  }

  function handleSimBeanClick(bId) {
    if (simThrownBeans[bId]) return;

    if (simRevealedBeans[bId]) {
      simSelectedBean = bId;
      renderSimulation();
      return;
    }

    const bean = BEANS_SIMULATION.find(b => b.id === bId);
    if (!bean) return;

    simRevealedBeans[bId] = bean.label;
    simSelectedBean = bId;
    renderSimulation();
  }

  function handleThrowSimBean() {
    if (!simSelectedBean || isBusy) return;
    const bId = simSelectedBean;
    const bean = BEANS_SIMULATION.find(b => b.id === bId);
    if (!bean) return;

    isBusy = true;
    const isCorrect = bean.correct;
    const points = isCorrect ? 100 : -50;

    simScore += points;
    if (isCorrect) simCorrectCount++;

    simThrownBeans[bId] = { correct: isCorrect, points };
    simSelectedBean = null;

    // Animasi basket jiggle
    const basket = $('#basketTargetSim');
    if (basket) {
      basket.classList.remove('jiggle');
      void basket.offsetWidth;
      basket.classList.add('jiggle');
    }

    simFeedback = {
      type: isCorrect ? 'correct' : 'wrong',
      title: isCorrect ? `✅ Benar (+100 poin): ${bean.label}` : `❌ Kurang Tepat (-50 poin): ${bean.label}`,
      text: bean.info
    };

    playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) fireConfetti();

    renderSimulation();
    setTimeout(() => {
      isBusy = false;
    }, 400);
  }

  // ==========================================
  // MEMULAI KUIS UTAMA (KOPI IJEN)
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

    // Reset State Ronde 2
    round1Score = 0;
    round2Score = 0;
    round2Answer = '';
    round2Correct = false;
    round2Selected = null;
    round2Done = false;

    gameStatus = 'playing';
    render();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      const timeEl = $('#timeDisplay');
      if (timeEl) timeEl.textContent = formatTime(elapsedSeconds);
    }, 1000);

    showToast('Ronde 1: Petik buah kopi merah terbaik!');
  }

  // ==========================================
  // ARENA PERMAINAN RONDE 1 (8 BUAH KOPI)
  // ==========================================
  function renderPlayfield() {
    const screen = $('#screen');
    const totalThrown = Object.keys(thrownBeans).length;

    screen.innerHTML = `
      <!-- Stats Bar Mobile -->
      <div class="stats" style="margin-bottom: 10px;">
        <div class="stat-item">
          <b>🍒 RONDE 1</b>
          <small>Mode</small>
        </div>
        <div class="stat-item">
          <b id="timeDisplay">${formatTime(elapsedSeconds)}</b>
          <small>Waktu Main</small>
        </div>
        <div class="stat-item">
          <b id="scoreDisplay">${score}</b>
          <small>Skor Ronde 1</small>
        </div>
        <div class="stat-item">
          <b>${correctCount}/4</b>
          <small>Benar</small>
        </div>
      </div>

      <!-- Banner Pertanyaan Ronde 1 -->
      <div class="game-question">
        <div class="round-indicator">🍒 RONDE 1 DARI 2 · MEMETIK BUAH KOPI</div>
        <h2 style="margin-top: 4px;">${QUESTION_MAIN}</h2>
        <small style="color: #c9e0d1; display: block; margin-top: 4px;">
          Pilih 4 faktor mutu Kopi Ijen (+100) dan hindari faktor salah (-50)!
        </small>
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
        💡 <b>Tips:</b> Ketuk buah kopi untuk membuka, lalu pilih <b>"Masukkan ke Keranjang"</b>.
      </p>

      <!-- Tombol Lanjut ke Ronde 2 -->
      <div style="margin-top: 12px;">
        <button id="btnFinishPlay" class="btn primary" style="width: 100%; font-size: 15px; font-weight: 900; box-shadow: 0 4px 14px rgba(245, 176, 39, 0.45);">
          ➡️ Lanjut ke Ronde 2 (Pilihan Ganda) →
        </button>
      </div>

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

      // Drag / swipe ke keranjang
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

    const btnFinish = $('#btnFinishPlay');
    if (btnFinish) {
      btnFinish.onclick = () => {
        const totalThrown = Object.keys(thrownBeans).length;
        if (totalThrown === 0) {
          if (!confirm('Kamu belum memasukkan buah kopi ke keranjang. Yakin ingin langsung lanjut ke Ronde 2?')) return;
        }
        completeRound1();
      };
    }
  }

  function handleBeanClick(bId) {
    if (thrownBeans[bId]) return;

    if (revealedBeans[bId]) {
      selectedBean = bId;
      renderPlayfield();
      return;
    }

    const bean = BEANS_MAIN.find(b => b.id === bId);
    if (!bean) return;

    revealedBeans[bId] = bean.label;
    selectedBean = bId;
    renderPlayfield();
  }

  function handleThrowBean() {
    if (!selectedBean || isBusy) return;
    const bId = selectedBean;
    const bean = BEANS_MAIN.find(b => b.id === bId);
    if (!bean) return;

    isBusy = true;
    const isCorrect = bean.correct;
    const points = isCorrect ? 100 : -50;

    score += points;
    if (isCorrect) correctCount++;

    thrownBeans[bId] = { correct: isCorrect, points };
    selectedBean = null;

    // Animasi basket jiggle
    const basket = $('#basketTarget');
    if (basket) {
      basket.classList.remove('jiggle');
      void basket.offsetWidth;
      basket.classList.add('jiggle');
    }

    let bonus = false;
    if (correctCount === 4) {
      bonus = true;
      score += 100;
    }

    feedbackMessage = isCorrect
      ? `✅ Pilihan Tepat! +100 poin${bonus ? ' · 🏆 BONUS SAPU BERSIH +100!' : ''}`
      : `❌ Kurang Tepat! -50 poin`;

    playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) fireConfetti();

    if (correctCount === 4) {
      setTimeout(() => {
        isBusy = false;
        completeRound1();
      }, 1200);
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
  // TRANSISI RONDE 1 KE RONDE 2
  // ==========================================
  function completeRound1() {
    round1Score = score;
    gameStatus = 'round1_complete';
    render();
    fireConfetti();
    playSound('correct');
  }

  function renderRound1Complete() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 500px; margin: 0 auto; text-align: center;">
          <div class="round-transition-card">
            <div style="font-size: 48px; margin-bottom: 6px;">🎉 🍒</div>
            <div class="round-indicator" style="background: rgba(23, 69, 45, 0.08); color: #17452d; border-color: #cbdbc1; display: inline-block;">
              RONDE 1 SELESAI
            </div>
            <h2 style="color: #17452d; margin-top: 8px;">Keren! Ronde 1 Selesai!</h2>
            <p class="muted" style="font-size: 14px; margin: 6px 0 16px;">
              Kamu berhasil mengumpulkan <b>${correctCount} dari 4</b> faktor mutu Kopi Ijen.
            </p>

            <div style="background: linear-gradient(145deg, #fffcf0 0%, #fff7d6 100%); border: 2px solid #f5b027; border-radius: 16px; padding: 16px; margin: 12px 0;">
              <small style="color: #8c630f; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px;">SKOR SEMENTARA RONDE 1</small>
              <div style="font-size: 46px; font-weight: 950; color: #17452d; margin: 2px 0;">
                ${round1Score} <span style="font-size: 18px; font-weight: 700; color: #5a7b68;">poin</span>
              </div>
              ${correctCount === 4 ? '<span style="color: #15803d; font-weight: 800; font-size: 13px;">🏆 Bonus Sapu Bersih (+100) Berhasil Diraih!</span>' : ''}
            </div>

            <div style="background: #eef6ec; border: 1.5px solid #cbdbc1; border-radius: 14px; padding: 14px; text-align: left; font-size: 13.5px; color: #19462b; margin: 16px 0; line-height: 1.5;">
              <strong style="color: #113821; display: block; margin-bottom: 4px;">🚀 Bersiap untuk Ronde 2 (Pilihan Ganda):</strong>
              Uji pemahamanmu tentang <b>nilai budaya planters PTPN Group</b> yang tercantum dalam podcast jejak kopi nusantara. Jawaban benar bernilai <b>+100 poin</b>!
            </div>

            <button id="btnStartRound2" class="btn primary" style="width: 100%; font-size: 16px; font-weight: 900; padding: 15px; box-shadow: 0 4px 18px rgba(245, 176, 39, 0.5);">
              Mulai Ronde 2 Sekarang →
            </button>
          </div>
        </div>
      </div>
    `;

    $('#btnStartRound2').onclick = startRound2;
  }

  // ==========================================
  // RONDE 2: SOAL PILIHAN GANDA (NILAI BUDAYA)
  // Soal: "Apa nilai budaya yang tercantum dalam podcast jejak kopi nusantara?"
  // Opsi: Continuous learning, Excellence, Owner’s mindset, Networking
  // Kunci Jawaban: Excellence (+100 poin)
  // ==========================================
  function startRound2() {
    gameStatus = 'round2';
    round2Selected = null;
    round2Done = false;
    round2Answer = '';
    round2Correct = false;
    round2Score = 0;
    render();
    showToast('Ronde 2: Pilih 1 jawaban yang paling tepat!');
  }

  function renderRound2() {
    const screen = $('#screen');
    const currentTotal = round1Score + round2Score;

    screen.innerHTML = `
      <!-- Stats Bar Ronde 2 -->
      <div class="stats" style="margin-bottom: 10px;">
        <div class="stat-item">
          <b>🎯 RONDE 2</b>
          <small>Mode</small>
        </div>
        <div class="stat-item">
          <b id="timeDisplay">${formatTime(elapsedSeconds)}</b>
          <small>Waktu Main</small>
        </div>
        <div class="stat-item">
          <b>${round1Score}</b>
          <small>Skor Ronde 1</small>
        </div>
        <div class="stat-item">
          <b style="color: #f5b027;">${round2Done ? `+${round2Score}` : '—'}</b>
          <small>Poin Ronde 2</small>
        </div>
      </div>

      <!-- Banner Pertanyaan Ronde 2 -->
      <div class="game-question">
        <div class="round-indicator">🎯 RONDE 2 DARI 2 · SOAL PILIHAN GANDA</div>
        <h2 style="margin-top: 6px;">${QUESTION_ROUND_2}</h2>
        <small style="color: #c9e0d1; display: block; margin-top: 4px;">
          Pilih 1 nilai budaya yang paling tepat (+100 poin untuk jawaban benar)!
        </small>
      </div>

      <!-- Grid 4 Kartu Opsi Pilihan Ganda -->
      <div class="mc-options-grid">
        ${OPTIONS_ROUND_2.map(opt => {
          let extraClass = '';
          if (round2Done) {
            if (opt.text === round2Answer) {
              extraClass = opt.correct ? 'correct' : 'wrong';
            } else if (opt.correct) {
              extraClass = 'correct'; // Sorot hijau jawaban benar agar edukatif
            }
          }

          return `
            <button class="mc-option-card ${extraClass}" 
                    data-mc-option="${escapeHtml(opt.text)}" 
                    ${round2Done ? 'disabled' : ''}>
              <div class="opt-letter">${opt.key}</div>
              <div class="opt-text">${escapeHtml(opt.text)}</div>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Feedback & Penjelasan Edukatif Setelah Memilih -->
      ${round2Done ? `
        <div class="sim-feedback-box ${round2Correct ? 'correct' : 'wrong'}" style="margin: 14px 0; animation: popIn 0.3s ease;">
          <strong style="font-size: 15px;">
            ${round2Correct ? '🎉 Jawaban Kamu Tepat Sekali (+100 Poin)!' : '❌ Jawaban Kurang Tepat (+0 Poin)'}
          </strong>
          <p style="margin-top: 6px; font-size: 13.5px; line-height: 1.55;">
            ${escapeHtml(EXPLANATION_ROUND_2)}
          </p>
        </div>

        <!-- Tombol Selesai & Simpan Skor Akhir -->
        <div style="margin-top: 14px;">
          <button id="btnFinishAll" class="btn primary" style="width: 100%; font-size: 16px; font-weight: 900; padding: 15px; box-shadow: 0 4px 18px rgba(245, 176, 39, 0.5);">
            🏁 Selesai & Simpan Skor Akhir (${currentTotal} Poin) →
          </button>
        </div>
      ` : `
        <p style="text-align: center; color: #cbe0d3; font-size: 12.5px; margin-top: 12px;">
          💡 Ketuk salah satu kartu opsi di atas untuk menguji jawabanmu.
        </p>
      `}
    `;

    // Event listener opsi pilihan ganda
    if (!round2Done) {
      document.querySelectorAll('[data-mc-option]').forEach(btn => {
        btn.onclick = () => {
          const optText = btn.dataset.mcOption;
          handleRound2Select(optText);
        };
      });
    }

    if ($('#btnFinishAll')) {
      $('#btnFinishAll').onclick = () => {
        const btn = $('#btnFinishAll');
        btn.disabled = true;
        btn.textContent = '⏳ Menyimpan Skor ke Spreadsheet...';
        finishQuiz();
      };
    }
  }

  function handleRound2Select(selectedText) {
    if (round2Done) return;
    const opt = OPTIONS_ROUND_2.find(o => o.text === selectedText);
    if (!opt) return;

    round2Answer = opt.text;
    round2Correct = Boolean(opt.correct);
    round2Score = round2Correct ? 100 : 0;
    round2Done = true;

    playSound(round2Correct ? 'correct' : 'wrong');
    if (round2Correct) {
      fireConfetti();
    }

    renderRound2();
  }

  // ==========================================
  // SELESAI KUIS & SUBMIT KE SPREADSHEET (RONDE 1 + RONDE 2)
  // ==========================================
  async function finishQuiz() {
    if (timerInterval) clearInterval(timerInterval);
    
    // Total skor akhir = Ronde 1 + Ronde 2
    score = round1Score + round2Score;

    gameStatus = 'result';
    render();
    fireConfetti();

    const wrongCount = Object.values(thrownBeans).filter(t => !t.correct).length;

    try {
      await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_score',
          name: playerName,
          entity: playerEntity,
          whatsapp: playerWhatsApp,
          score: score,
          r1_score: round1Score,
          r2_score: round2Score,
          r2_answer: round2Answer,
          r2_correct: round2Correct,
          correct_count: correctCount,
          wrong_count: wrongCount,
          duration: formatTime(elapsedSeconds),
          answers: thrownBeans
        })
      });
      showToast('✅ Nilai kamu otomatis tersimpan di Google Spreadsheet!');
    } catch (err) {
      console.warn('Gagal sync ke spreadsheet:', err);
    }
  }

  // ==========================================
  // LAYAR HASIL KUIS (REVISI 2: LEADERBOARD HANYA UNTUK ADMIN)
  // Menampilkan Breakdown Ronde 1 + Ronde 2 Lengkap
  // ==========================================
  function renderResult() {
    const screen = $('#screen');
    const waText = `Halo! 🍒 Saya baru saja menyelesaikan Kata Kalcer Podcast Interactive Quiz (${playerEntity}) dengan total skor ${score} poin (R1: ${round1Score} poin + R2: ${round2Score} poin)! Coba tandingi skor saya di sini: ${window.location.origin}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;

    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 480px; margin: 0 auto; text-align: center;">
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <div style="background: #ffffff; border-radius: 16px; padding: 8px 18px; box-shadow: 0 4px 14px rgba(0,0,0,0.12); display: inline-flex; align-items: center;">
              <img src="images/logo-life-at-ptpn.png" alt="Life at PTPN" style="height: 52px; object-fit: contain;">
            </div>
          </div>
          <h2>Kuis Selesai! Kerja Luar Biasa!</h2>
          <p class="muted small" style="margin-top: 2px;">
            <b>${escapeHtml(playerName)}</b> · ${escapeHtml(playerEntity)}
          </p>

          <!-- Kartu Nilai Akhir -->
          <div style="background: linear-gradient(145deg, #fffcf0 0%, #fff7d6 100%); border: 2.5px solid #f5b027; border-radius: 18px; padding: 20px; margin: 18px 0; box-shadow: var(--shadow-pop);">
            <small style="color: #8c630f; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px;">TOTAL SKOR AKHIR KAMU (R1 + R2)</small>
            <div style="font-size: clamp(44px, 10vw, 58px); font-weight: 950; color: #16472b; margin: 4px 0;">
              ${score}
            </div>

            <!-- Breakdown Skor Kedua Ronde -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 0 10px;">
              <div style="background: #ffffff; border: 1.5px solid #d4dfce; border-radius: 12px; padding: 10px 8px; text-align: center;">
                <small style="color: #557560; font-size: 11px; font-weight: 800; display: block;">RONDE 1: PETIK KOPI</small>
                <strong style="color: #17452d; font-size: 18px; display: block; margin-top: 2px;">${round1Score} Poin</strong>
                <small style="color: #557560; font-size: 10.5px;">${correctCount}/4 Benar</small>
              </div>
              <div style="background: #ffffff; border: 1.5px solid #d4dfce; border-radius: 12px; padding: 10px 8px; text-align: center;">
                <small style="color: #557560; font-size: 11px; font-weight: 800; display: block;">RONDE 2: NILAI BUDAYA</small>
                <strong style="color: ${round2Correct ? '#15803d' : '#8c6000'}; font-size: 18px; display: block; margin-top: 2px;">+${round2Score} Poin</strong>
                <small style="color: #557560; font-size: 10.5px;">${escapeHtml(round2Answer || '—')}</small>
              </div>
            </div>

            <p style="color: #3b5f48; font-weight: 700; font-size: 13.5px; margin-top: 6px;">
              ${round2Correct && correctCount === 4 ? '🌟 Luar Biasa Sempurna! Kamu menguasai mutu kopi dan nilai budaya PTPN Group!' : 'Terima kasih atas partisipasi aktifmu dalam Kuis Kata Kalcer!'}
            </p>
            <div class="small muted" style="margin-top: 4px;">Waktu pengerjaan: <b>${formatTime(elapsedSeconds)}</b></div>
          </div>

          <!-- Keterangan Penyimpanan Google Spreadsheet -->
          <div style="background: #eef6ec; border: 1.5px solid #c8d9be; border-radius: 12px; padding: 12px; font-size: 13px; color: #19462b; margin-bottom: 20px; text-align: left; line-height: 1.5;">
            🟢 <b>Tercatat:</b> Skor kamu otomatis tersimpan di Google Spreadsheet resmi.<br>
            🔒 <b>Papan Peringkat:</b> Sesuai ketentuan, papan peringkat dan penetapan juara hanya dapat dilihat oleh Panitia/Admin.
          </div>

          <!-- Tombol Aksi Mobile -->
          <div class="stack" style="gap: 10px;">
            <a href="${waUrl}" target="_blank" class="btn wa">
              💬 Bagikan Skor ke WhatsApp
            </a>
            <button id="btnPlayAgain" class="btn primary">
              🔄 Main Lagi / Coba Ulang
            </button>
            <button id="btnOpenPodcastFromResult" class="btn green">
              🎬 Tonton Podcast Kata Kalcer
            </button>
          </div>
        </div>
      </div>
    `;

    $('#btnPlayAgain').onclick = () => {
      gameStatus = 'intro';
      render();
    };

    $('#btnOpenPodcastFromResult').onclick = () => {
      currentTab = 'podcast';
      render();
    };
  }

  // ==========================================
  // TAB 2: PODCAST KATA KALCER (REVISI 4)
  // ==========================================
  function renderPodcastTab() {
    const screen = $('#screen');
    screen.innerHTML = `
      <div class="panel">
        <div class="panel-inner" style="max-width: 520px; margin: 0 auto;">
          <span class="eyebrow">🎙️ Life at PTPN Podcast</span>
          <h2 style="margin-top: 2px;">Kata Kalcer Series</h2>
          <p class="muted small">Tonton obrolan inspiratif seputar kopi kebanggaan Nusantara dan budaya planters PTPN Group.</p>

          <div class="podcast-embed-card">
            <div class="podcast-highlight-badge">☕ EPISODE SPESIAL KOPI IJEN</div>
            <p class="podcast-title-tag">
              (Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)
            </p>

            <div class="video-container">
              <iframe 
                src="https://www.youtube-nocookie.com/embed/${PODCAST_DATA.videoId}?rel=0" 
                title="${escapeHtml(PODCAST_DATA.title)}" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            </div>

            <p class="podcast-title-tag bottom">
              (Tonton Podcast Kata Kalcer episode Rahasia di Balik Cita Rasa Kopi Ijen)
            </p>

            <a href="${PODCAST_DATA.youtubeUrl}" target="_blank" rel="noopener" class="btn-yt">
              ▶ Buka & Tonton di Aplikasi YouTube
            </a>
          </div>

          <!-- Rangkuman Singkat -->
          <div style="background: #fbfdf9; border: 1.5px solid #d4dfce; border-radius: 14px; padding: 14px; margin-top: 14px; font-size: 13px; color: #22432e; line-height: 1.6;">
            <strong style="color: #134227; display: block; margin-bottom: 6px;">💡 Poin Pembahasan Kunci:</strong>
            <ul style="padding-left: 18px;">
              <li>Terroir vulkanik Gunung Ijen-Raung yang kaya kalium & magnesium.</li>
              <li>Pematangan lambat di ketinggian > 1.000 mdpl yang mengunci rasa manis buah.</li>
              <li>SOP petik merah selektif 100% buah matang pohon.</li>
              <li>Proses double sortasi dan fermentasi alami 12–36 jam untuk *clean cup*.</li>
            </ul>
          </div>

          <div class="actions" style="margin-top: 16px;">
            <button id="btnPlayFromPodcast" class="btn primary" style="width: 100%;">
              🍒 Mainkan Kuis & Simulasi Sekarang!
            </button>
          </div>
        </div>
      </div>
    `;

    $('#btnPlayFromPodcast').onclick = () => {
      currentTab = 'quiz';
      gameStatus = 'intro';
      render();
    };
  }

  // ==========================================
  // REVISI 2: PANEL ADMIN & PAPAN PERINGKAT
  // Hanya bisa dibuka dengan password 'dsps'
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
        ? '🔴 KUIS DITUTUP (Peserta Tidak Bisa Mengirim Jawaban)'
        : '🟢 KUIS DIBUKA (Peserta Bebas Bermain)';
      text.style.color = isClosed ? '#8b1313' : '#124d31';
    }
    if (btn) {
      btn.className = isClosed ? 'btn green sm' : 'btn danger sm';
      btn.textContent = isClosed ? '▶ Buka Kuis Kembali' : '■ Tutup Kuis Sekarang';
    }
  }

  async function loadAdminLeaderboard() {
    const container = $('#adminLeaderboardContainer');
    if (!container) return;

    container.innerHTML = `<p class="muted small" style="text-align: center; padding: 20px;">Memuat data peringkat peserta dari Google Spreadsheet...</p>`;

    try {
      const res = await fetch(`${API_BASE}/scores?action=get_leaderboard&password=${encodeURIComponent(adminPassword)}`);
      const data = await res.json();

      if (!data.ok && data.error) {
        container.innerHTML = `<div style="text-align: center; padding: 20px; color: #a11e24;" class="small">${escapeHtml(data.error)}</div>`;
        return;
      }

      cachedLeaderboard = data.leaderboard || [];

      renderAdminLeaderboardTable();
    } catch {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #8c1e24;" class="small">
          Gagal mengambil data dari spreadsheet. Pastikan koneksi internet aktif.
        </div>
      `;
    }
  }

  function renderAdminLeaderboardTable() {
    const container = $('#adminLeaderboardContainer');
    if (!container) return;

    const searchTerm = ($('#inputSearchAdmin')?.value || '').toLowerCase().trim();
    let list = cachedLeaderboard;

    if (searchTerm) {
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm) ||
        (p.entity || '').toLowerCase().includes(searchTerm)
      );
    }

    if (!list.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px 10px;" class="muted small">
          ${searchTerm ? 'Tidak ada peserta yang cocok dengan kata kunci pencarian.' : 'Belum ada data peserta di Google Spreadsheet.'}
        </div>
      `;
      return;
    }

    const top1 = list[0];
    const top2 = list[1];
    const top3 = list[2];

    container.innerHTML = `
      <!-- Ringkasan Statistik Singkat -->
      <div style="display: flex; gap: 8px; margin-bottom: 12px; justify-content: space-between;">
        <div style="background: #eef6ec; border-radius: 10px; padding: 8px 12px; flex: 1; text-align: center;">
          <small class="muted" style="font-size: 10px; display: block;">TOTAL PESERTA</small>
          <strong style="color: #174229; font-size: 16px;">${cachedLeaderboard.length}</strong>
        </div>
        <div style="background: #fff8df; border-radius: 10px; padding: 8px 12px; flex: 1; text-align: center;">
          <small class="muted" style="font-size: 10px; display: block;">SKOR TERTINGGI</small>
          <strong style="color: #8c6000; font-size: 16px;">${cachedLeaderboard[0]?.score || 0}</strong>
        </div>
      </div>

      <!-- Podium Top 3 (Jika tidak dalam mode pencarian) -->
      ${!searchTerm && cachedLeaderboard.length >= 1 ? `
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
      ` : ''}

      <!-- Tabel Peringkat Lengkap Peserta -->
      <div class="rank-table-wrap">
        <table class="rank-table">
          <thead>
            <tr>
              <th style="width: 44px;">Rank</th>
              <th>Nama Peserta</th>
              <th>Entitas PTPN</th>
              <th>No. WhatsApp</th>
              <th>R1 (Petik)</th>
              <th>R2 (Budaya)</th>
              <th>Waktu</th>
              <th style="text-align: right;">Total Skor</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => `
              <tr class="${p.rank === 1 ? 'rank-1' : ''}">
                <td><b>${p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}</b></td>
                <td><b>${escapeHtml(p.name)}</b></td>
                <td><small>${escapeHtml(p.entity || '—')}</small></td>
                <td><small style="font-family: monospace; color: #166534; font-weight: 700;">${escapeHtml(p.whatsapp || '—')}</small></td>
                <td><small>${p.correctCount}/4</small></td>
                <td><small style="font-weight: 700; color: ${p.r2Score > 0 ? '#15803d' : '#854d0e'};">${escapeHtml(p.r2Answer || '—')}</small></td>
                <td><small>${escapeHtml(p.duration || '—')}</small></td>
                <td style="text-align: right; font-size: 14.5px;"><b>${p.score}</b></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function setupAdminModal() {
    const modal = $('#adminModal');
    const modalCard = $('#adminModalCard');
    const btnOpen = $('#btnAdminModal');
    const btnFooterOpen = $('#btnFooterAdmin');
    const btnClose = $('#btnCloseAdminModal');
    const btnClosePanel = $('#btnCloseAdminPanel');
    const formLogin = $('#adminLoginForm');
    const inputPass = $('#inputAdminPass');
    const loginSection = $('#adminLoginSection');
    const panelSection = $('#adminPanelSection');
    const btnToggle = $('#btnToggleQuizStatus');
    const btnRefresh = $('#btnAdminRefreshScores');
    const inputSearch = $('#inputSearchAdmin');
    const btnLogout = $('#btnLogoutAdmin');

    const openAdmin = () => {
      modal.classList.add('open');
      if (isAdminLoggedIn) {
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        if (modalCard) modalCard.classList.add('admin-wide');
        updateAdminUIStatus();
        loadAdminLeaderboard();
      } else {
        loginSection.style.display = 'block';
        panelSection.style.display = 'none';
        if (modalCard) modalCard.classList.remove('admin-wide');
        inputPass.value = '';
        setTimeout(() => inputPass.focus(), 150);
      }
    };

    btnOpen.onclick = openAdmin;
    if (btnFooterOpen) btnFooterOpen.onclick = openAdmin;

    btnClose.onclick = () => modal.classList.remove('open');
    if (btnClosePanel) btnClosePanel.onclick = () => modal.classList.remove('open');

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
      if (modalCard) modalCard.classList.add('admin-wide');
      updateAdminUIStatus();
      loadAdminLeaderboard();
      showToast('✅ Berhasil masuk sebagai Admin DSPS');
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
          showToast(data.error || 'Gagal mengubah status kuis');
        }
      } catch {
        showToast('Gagal menghubungi server');
      }
    };

    if (btnRefresh) {
      btnRefresh.onclick = () => {
        showToast('↻ Menyegarkan data spreadsheet...');
        loadAdminLeaderboard();
      };
    }

    if (inputSearch) {
      inputSearch.oninput = () => renderAdminLeaderboardTable();
    }

    btnLogout.onclick = () => {
      isAdminLoggedIn = false;
      adminPassword = '';
      cachedLeaderboard = [];
      if (modalCard) modalCard.classList.remove('admin-wide');
      modal.classList.remove('open');
      showToast('Admin berhasil keluar');
    };
  }

  // ==========================================
  // SETUP KONTROL GLOBAL & LISTENER
  // ==========================================
  function setupControls() {
    // Nav Tabs
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.onclick = () => {
        currentTab = btn.dataset.tab;
        render();
      };
    });

    // Toggle Musik Jingle PTPN
    const musicBtn = $('#btnMusicToggle');
    if (musicBtn) {
      musicBtn.onclick = () => {
        const isPlaying = jinglePlayer.toggle();
        showToast(isPlaying ? '🎵 Memutar Jingle One PTPN One Culture' : '⏸ Jingle PTPN dijeda');
      };
    }

    // Toggle Efek Suara SFX
    const audioBtn = $('#btnAudioToggle');
    if (audioBtn) {
      audioBtn.onclick = () => {
        audioMuted = !audioMuted;
        audioBtn.textContent = audioMuted ? '🔇' : '🔊';
        showToast(audioMuted ? 'Efek suara dimatikan' : 'Efek suara dinyalakan');
      };
    }

    // Toggle Layar Penuh
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

  // ==========================================
  // INISIALISASI APLIKASI
  // ==========================================
  async function init() {
    setupControls();
    await fetchQuizStatus();
    render();

    // Default: Putar musik Jingle PTPN secara otomatis
    jinglePlayer.play();
  }

  init();
})();