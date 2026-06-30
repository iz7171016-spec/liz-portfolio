/* ============================================================
   app.js — 应用入口：导航、计时界面联动、各模块装配
   ============================================================ */

(function () {
  'use strict';

  // ---------- DOM ----------
  const display     = document.getElementById('timerDisplay');
  const stateText   = document.getElementById('stateText');
  const cycleText   = document.getElementById('cycleText');
  const cycleDots   = document.getElementById('cycleDots');
  const startPause  = document.getElementById('startPauseBtn');
  const resetBtn    = document.getElementById('resetBtn');
  const skipBtn     = document.getElementById('skipBtn');
  const toast       = document.getElementById('toast');
  const goalInput   = document.getElementById('goalInput');

  // ---------- 工具 ----------
  function fmt(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function showToast(msg, glow = false) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (glow) toast.style.boxShadow = '0 0 50px rgba(230,201,163,.5)';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove('show');
      toast.style.boxShadow = '';
    }, 3200);
  }

  // ---------- 计时界面渲染 ----------
  function renderCycleDots(state) {
    cycleDots.innerHTML = '';
    for (let i = 1; i <= state.totalCycles; i++) {
      const d = document.createElement('i');
      if (i < state.cycle) d.className = 'done';
      else if (i === state.cycle) d.className = 'current';
      cycleDots.appendChild(d);
    }
  }

  function renderTimer(state) {
    display.textContent = fmt(state.remaining);
    const isBreak = state.phase === 'break';
    document.body.classList.toggle('is-break', isBreak);
    stateText.textContent = isBreak ? '休息中' : '专注中';
    cycleText.textContent = `第 ${state.cycle} / ${state.totalCycles} 轮`;
    startPause.textContent = state.running ? '暂停' : (state.remaining < phaseFull(state) ? '继续' : '开始');
    renderCycleDots(state);
    document.title = `${fmt(state.remaining)} · ${isBreak ? '休息' : '专注'} — 雨夜窗边`;
  }

  function phaseFull(state) {
    const s = Settings.get();
    return (state.phase === 'focus' ? s.focusMin : s.breakMin) * 60;
  }

  // ---------- 计时器事件 ----------
  Timer.on({
    tick: renderTimer,
    change: renderTimer,
    phaseEnd: ({ finishedPhase, cycle, totalCycles }) => {
      // 微动效：数字光晕闪烁
      display.classList.remove('flash');
      void display.offsetWidth;       // 触发重绘
      display.classList.add('flash');

      if (finishedPhase === 'focus') {
        // 记录一次专注打卡
        const minutes = Settings.get().focusMin;
        Stats.recordFocus(minutes);
        if (cycle >= totalCycles) {
          showToast('🎉 全部循环完成，今天辛苦啦', true);
        } else {
          showToast('专注完成，喝口水休息一下 ☕');
        }
      } else {
        showToast('休息结束，继续保持节奏 ✦');
      }
    },
  });

  // ---------- 控制按钮 ----------
  startPause.addEventListener('click', () => Timer.toggle());
  resetBtn.addEventListener('click', () => Timer.reset());
  skipBtn.addEventListener('click', () => Timer.skip());

  // ---------- 导航 ----------
  document.getElementById('nav').addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.view').forEach(v =>
      v.classList.toggle('active', v.id === `view-${view}`));
    if (view === 'stats') Stats.render();
    if (view === 'settings') Settings.renderForm();
  });

  // ---------- 今日目标 ----------
  function loadGoal() {
    const d = Store.load();
    const today = DateUtil.todayKey();
    goalInput.value = (d.goalDate === today) ? d.goal : '';
  }
  goalInput.addEventListener('input', () => {
    Store.update(d => { d.goal = goalInput.value; d.goalDate = DateUtil.todayKey(); });
  });

  // ---------- 语录 ----------
  function refreshQuote() {
    const q = randomQuote();
    document.getElementById('quoteText').textContent = q.t;
    document.getElementById('quoteAuthor').textContent = '— ' + q.a;
  }
  document.getElementById('quoteRefresh').addEventListener('click', refreshQuote);

  // ---------- 白噪音 ----------
  const audioGrid = document.getElementById('audioGrid');
  const volumeSlider = document.getElementById('volumeSlider');

  function syncAudioButtons() {
    document.querySelectorAll('.audio-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.sound === AudioEngine.current));
  }
  audioGrid.addEventListener('click', e => {
    const btn = e.target.closest('.audio-btn');
    if (!btn) return;
    AudioEngine.toggle(btn.dataset.sound);
    syncAudioButtons();
  });
  volumeSlider.addEventListener('input', () => {
    AudioEngine.setVolume(+volumeSlider.value);
    Store.update(d => { d.settings.volume = +volumeSlider.value; });
  });

  // ---------- 氛围 ----------
  function applyAmbient(ambient) {
    document.body.dataset.ambient = ambient;
    if (window.RainFX) RainFX.rebuild();
  }

  // ---------- 应用某角色的设置到界面 ----------
  function applySettings(s) {
    Timer.setConfig({
      focusMin: s.focusMin, breakMin: s.breakMin, cycles: s.cycles,
      autoBreak: s.autoBreak, autoFocus: s.autoFocus,
    });
    applyAmbient(s.ambient);
    volumeSlider.value = s.volume;
    AudioEngine.setVolume(s.volume);
  }

  // ---------- 切换/载入角色时，刷新整个界面 ----------
  function reloadForCharacter() {
    Timer.reset();
    const s = Settings.get();
    applySettings(s);
    Settings.renderForm();
    Tasks.render();
    Stats.render();
    loadGoal();
    refreshQuote();
    // 默认白噪音
    AudioEngine.stop();
    if (s.defaultSound && s.defaultSound !== 'none') {
      AudioEngine.play(s.defaultSound);
    }
    syncAudioButtons();
  }

  // ============================================================
  //  启动
  // ============================================================
  function boot() {
    RainFX.start();

    let initialized = false;
    const initModules = () => {
      Tasks.init();
      Stats.init(badge => showToast(`🏅 解锁徽章：${badge.name}`, true));
      Settings.init(s => applySettings(s));
      reloadForCharacter();
    };

    // 角色模块：切换/创建角色后回调
    Character.init(() => {
      if (!initialized) { initModules(); initialized = true; }
      else reloadForCharacter();
    });

    // 已存在选中角色时，Character.init 不触发回调，这里手动初始化一次
    if (Store.getActiveId() && !initialized) {
      initModules();
      initialized = true;
    }
  }

  boot();
})();
