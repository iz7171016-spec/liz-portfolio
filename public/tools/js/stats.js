/* ============================================================
   stats.js — 统计打卡 / 热力图 / 成就徽章
   ============================================================ */

const Stats = (() => {

  // 徽章定义
  const BADGES = [
    { id: 'first',     icon: '🌱', name: '初次专注', desc: '完成第一次专注',
      test: s => s.stats.totalSessions >= 1 },
    { id: 'streak3',   icon: '🔥', name: '连续三天', desc: '连续学习 3 天',
      test: s => s.stats.bestStreak >= 3 },
    { id: 'streak7',   icon: '⚡', name: '连续七天', desc: '连续学习 7 天',
      test: s => s.stats.bestStreak >= 7 },
    { id: 'fourToday', icon: '🍅', name: '四轮达成', desc: '今日完成 4 轮番茄钟',
      test: s => (s.records[DateUtil.todayKey()]?.count || 0) >= 4 },
    { id: 'tenHours',  icon: '🏆', name: '十小时', desc: '累计专注满 10 小时',
      test: s => s.stats.totalMinutes >= 600 },
    { id: 'nightOwl',  icon: '🌙', name: '深夜学者', desc: '在 0–5 点完成一次专注',
      test: s => !!s.badges.nightOwl },
  ];

  let onUnlock = () => {};   // 解锁徽章时回调（用于光晕提醒）

  /* ---------- 记录一次完成的专注 ---------- */
  function recordFocus(minutes) {
    const today = DateUtil.todayKey();
    const newlyUnlocked = [];

    Store.update(d => {
      // 当日记录
      if (!d.records[today]) d.records[today] = { count: 0, minutes: 0 };
      d.records[today].count += 1;
      d.records[today].minutes += minutes;

      // 累计
      d.stats.totalSessions += 1;
      d.stats.totalMinutes += minutes;

      // 连续天数
      const last = d.stats.lastActiveDate;
      if (last && last !== today) {
        const gap = DateUtil.daysBetween(last, today);
        d.stats.streak = gap === 1 ? d.stats.streak + 1 : 1;
      } else if (!last) {
        d.stats.streak = 1;
      }
      d.stats.lastActiveDate = today;
      d.stats.bestStreak = Math.max(d.stats.bestStreak, d.stats.streak);

      // 深夜徽章
      const hr = new Date().getHours();
      if (hr >= 0 && hr < 5) d.badges.nightOwl = d.badges.nightOwl || Date.now();

      // 检查徽章解锁
      BADGES.forEach(b => {
        if (!d.badges[b.id] && b.test(d)) {
          d.badges[b.id] = Date.now();
          newlyUnlocked.push(b);
        }
      });
    });

    render();
    newlyUnlocked.forEach(b => onUnlock(b));
    return newlyUnlocked;
  }

  /* ---------- 渲染统计卡片 ---------- */
  function renderNumbers() {
    const d = Store.load();
    if (!d) return;
    const today = DateUtil.todayKey();
    const rec = d.records[today] || { count: 0, minutes: 0 };
    document.getElementById('statTodayCount').textContent = rec.count;
    document.getElementById('statTodayMin').innerHTML = `${rec.minutes}<small>分</small>`;
    document.getElementById('statStreak').innerHTML = `${d.stats.streak}<small>天</small>`;
    const hours = (d.stats.totalMinutes / 60);
    document.getElementById('statTotalHour').innerHTML =
      `${hours < 10 ? hours.toFixed(1) : Math.round(hours)}<small>小时</small>`;
  }

  /* ---------- 渲染热力图（近一年） ---------- */
  function renderHeatmap() {
    const d = Store.load();
    if (!d) return;
    const wrap = document.getElementById('heatmap');
    wrap.innerHTML = '';

    const today = new Date();
    document.getElementById('heatmapYear').textContent =
      `${today.getFullYear()} 年`;

    // 从今天往前 52 周，对齐到周日开头
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - 7 * 52 - end.getDay());

    const level = min => {
      if (min <= 0) return 0;
      if (min < 25) return 1;
      if (min < 60) return 2;
      if (min < 120) return 3;
      return 4;
    };

    for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
      const key = DateUtil.keyOf(cur);
      const rec = d.records[key];
      const min = rec ? rec.minutes : 0;
      const cell = document.createElement('div');
      const lv = level(min);
      cell.className = 'cell' + (lv ? ` lv${lv}` : '');
      cell.title = rec ? `${key}　${rec.count} 次 · ${min} 分钟` : `${key}　无记录`;
      wrap.appendChild(cell);
    }
  }

  /* ---------- 渲染徽章 ---------- */
  function renderBadges() {
    const d = Store.load();
    if (!d) return;
    const grid = document.getElementById('badgesGrid');
    grid.innerHTML = '';
    BADGES.forEach(b => {
      const unlocked = !!d.badges[b.id];
      const el = document.createElement('div');
      el.className = 'badge' + (unlocked ? ' unlocked' : '');
      el.innerHTML = `
        <div class="badge-ico">${b.icon}</div>
        <div class="badge-info"><b>${b.name}</b><span>${b.desc}</span></div>`;
      grid.appendChild(el);
    });
  }

  function render() {
    renderNumbers();
    renderHeatmap();
    renderBadges();
  }

  function init(unlockCb) {
    if (unlockCb) onUnlock = unlockCb;
    render();
  }

  return { init, render, recordFocus };
})();
