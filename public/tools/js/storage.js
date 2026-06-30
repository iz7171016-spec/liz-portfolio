/* ============================================================
   storage.js — localStorage 数据层
   按「角色」分别存储：任务 / 打卡 / 统计 / 设置
   ============================================================ */

const Store = (() => {
  const K_CHARS  = 'rainynight_characters';   // 角色列表
  const K_ACTIVE = 'rainynight_active';       // 当前角色 id
  const K_DATA   = id => `rainynight_data_${id}`; // 某角色的全部数据

  // 默认设置
  const DEFAULT_SETTINGS = {
    focusMin: 25,
    breakMin: 5,
    cycles: 4,
    autoBreak: true,    // 专注结束后自动进入休息
    autoFocus: false,   // 休息结束后自动进入专注
    defaultSound: 'none',
    ambient: 'rainy',   // quiet | rainy | midnight
    volume: 50,
  };

  // 某角色的默认数据结构
  const defaultData = () => ({
    settings: { ...DEFAULT_SETTINGS },
    goal: '',
    goalDate: '',
    tasks: [],          // [{id, text, done}]
    records: {},        // { 'YYYY-MM-DD': {count, minutes} }
    stats: {
      totalMinutes: 0,
      totalSessions: 0,
      lastActiveDate: '',
      streak: 0,
      bestStreak: 0,
    },
    badges: {},         // { badgeId: unlockTimestamp }
  });

  // ---------- 角色管理 ----------
  function getCharacters() {
    return JSON.parse(localStorage.getItem(K_CHARS) || '[]');
  }
  function saveCharacters(list) {
    localStorage.setItem(K_CHARS, JSON.stringify(list));
  }
  function addCharacter(name, icon) {
    const list = getCharacters();
    const char = { id: 'c_' + Date.now().toString(36), name, icon };
    list.push(char);
    saveCharacters(list);
    // 初始化该角色数据
    localStorage.setItem(K_DATA(char.id), JSON.stringify(defaultData()));
    return char;
  }
  function removeCharacter(id) {
    saveCharacters(getCharacters().filter(c => c.id !== id));
    localStorage.removeItem(K_DATA(id));
    if (getActiveId() === id) localStorage.removeItem(K_ACTIVE);
  }
  function getActiveId() { return localStorage.getItem(K_ACTIVE); }
  function setActiveId(id) { localStorage.setItem(K_ACTIVE, id); }
  function getActiveCharacter() {
    const id = getActiveId();
    return getCharacters().find(c => c.id === id) || null;
  }

  // ---------- 当前角色数据读写 ----------
  function load() {
    const id = getActiveId();
    if (!id) return null;
    const raw = localStorage.getItem(K_DATA(id));
    if (!raw) return defaultData();
    // 兼容旧结构：合并默认值
    const data = JSON.parse(raw);
    data.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    return { ...defaultData(), ...data };
  }
  function save(data) {
    const id = getActiveId();
    if (!id) return;
    localStorage.setItem(K_DATA(id), JSON.stringify(data));
  }
  // 局部更新：传入修改函数
  function update(fn) {
    const data = load();
    if (!data) return null;
    fn(data);
    save(data);
    return data;
  }
  function clearActiveData() {
    const id = getActiveId();
    if (id) localStorage.setItem(K_DATA(id), JSON.stringify(defaultData()));
  }

  return {
    DEFAULT_SETTINGS,
    getCharacters, addCharacter, removeCharacter,
    getActiveId, setActiveId, getActiveCharacter,
    load, save, update, clearActiveData,
  };
})();

// ---------- 公共日期工具 ----------
const DateUtil = {
  todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },
  keyOf(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  },
  // 两个 YYYY-MM-DD 间隔天数
  daysBetween(aKey, bKey) {
    const a = new Date(aKey + 'T00:00:00');
    const b = new Date(bKey + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  },
};
