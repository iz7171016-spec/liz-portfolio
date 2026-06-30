/* ============================================================
   settings.js — 自定义设置页
   时长 / 休息 / 循环 / 自动切换 / 白噪音 / 氛围 / 角色与数据
   ============================================================ */

const Settings = (() => {
  const LIMITS = {
    focusMin: [1, 120],
    breakMin: [1, 60],
    cycles:   [1, 12],
  };

  let onApply = () => {};   // 设置变更回调（同步给计时器/界面）

  function get() { return Store.load().settings; }

  function save(patch) {
    Store.update(d => { d.settings = { ...d.settings, ...patch }; });
    onApply(get());
  }

  /* ---------- 渲染表单当前值 ---------- */
  function renderForm() {
    const s = get();
    document.getElementById('set-focusMin').textContent = s.focusMin;
    document.getElementById('set-breakMin').textContent = s.breakMin;
    document.getElementById('set-cycles').textContent   = s.cycles;
    document.getElementById('set-autoBreak').checked = s.autoBreak;
    document.getElementById('set-autoFocus').checked = s.autoFocus;
    document.getElementById('set-defaultSound').value = s.defaultSound;

    document.querySelectorAll('#ambientSeg button').forEach(b =>
      b.classList.toggle('active', b.dataset.ambient === s.ambient));
  }

  /* ---------- 事件绑定 ---------- */
  function init(applyCb) {
    if (applyCb) onApply = applyCb;

    // 步进器
    document.querySelectorAll('.stepper button').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const [min, max] = LIMITS[key];
        const s = get();
        let v = s[key] + (btn.dataset.act === 'inc' ? 1 : -1);
        v = Math.max(min, Math.min(max, v));
        save({ [key]: v });
        renderForm();
      });
    });

    // 开关
    document.getElementById('set-autoBreak').addEventListener('change', e =>
      save({ autoBreak: e.target.checked }));
    document.getElementById('set-autoFocus').addEventListener('change', e =>
      save({ autoFocus: e.target.checked }));

    // 默认白噪音
    document.getElementById('set-defaultSound').addEventListener('change', e =>
      save({ defaultSound: e.target.value }));

    // 氛围强度
    document.querySelectorAll('#ambientSeg button').forEach(b => {
      b.addEventListener('click', () => {
        save({ ambient: b.dataset.ambient });
        renderForm();
      });
    });

    // 切换 / 新建角色
    document.getElementById('switchCharBtn').addEventListener('click', () => Character.show());

    // 清空当前角色数据
    document.getElementById('clearDataBtn').addEventListener('click', () => {
      const c = Store.getActiveCharacter();
      if (confirm(`清空「${c ? c.name : '当前角色'}」的全部任务、打卡与统计？设置将重置为默认。`)) {
        Store.clearActiveData();
        onApply(get());
      }
    });

    renderForm();
  }

  return { init, renderForm, get };
})();
