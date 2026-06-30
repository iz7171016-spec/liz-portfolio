/* ============================================================
   character.js — 本地角色选择 / 创建（无需登录）
   每个角色的数据独立存储
   ============================================================ */

const Character = (() => {
  const modal   = document.getElementById('characterModal');
  const grid    = document.getElementById('characterGrid');
  const nameIn  = document.getElementById('newCharName');
  const iconSel = document.getElementById('newCharIcon');
  const createBtn = document.getElementById('createCharBtn');
  const chip    = document.getElementById('charChip');
  const chipIcon = document.getElementById('charChipIcon');
  const chipName = document.getElementById('charChipName');

  // 预设角色（首次使用时生成）
  const PRESETS = [
    { name: '学生',   icon: '🎓', sub: '上课与作业' },
    { name: '备考人', icon: '📚', sub: '冲刺考试' },
    { name: '创作者', icon: '✍️', sub: '写作与创作' },
    { name: '打工人', icon: '💼', sub: '工作与提升' },
  ];

  let onChange = () => {};   // 切换角色后回调

  function ensurePresets() {
    if (Store.getCharacters().length === 0) {
      PRESETS.forEach(p => Store.addCharacter(p.name, p.icon));
    }
  }

  function renderGrid() {
    const chars = Store.getCharacters();
    const activeId = Store.getActiveId();
    grid.innerHTML = '';
    chars.forEach(c => {
      const el = document.createElement('div');
      el.className = 'char-card' + (c.id === activeId ? ' active' : '');
      el.innerHTML = `
        <span class="ci">${c.icon}</span>
        <span class="cn"><b></b><span>本地存档</span></span>
        <button class="cdel" title="删除">✕</button>`;
      el.querySelector('.cn b').textContent = c.name;
      el.addEventListener('click', e => {
        if (e.target.classList.contains('cdel')) return;
        select(c.id);
      });
      el.querySelector('.cdel').addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`删除角色「${c.name}」及其全部数据？`)) {
          Store.removeCharacter(c.id);
          if (Store.getActiveId() === c.id) {
            const left = Store.getCharacters();
            if (left.length) select(left[0].id);
            else { Store.setActiveId(''); renderGrid(); }
          } else renderGrid();
        }
      });
      grid.appendChild(el);
    });
  }

  function updateChip() {
    const c = Store.getActiveCharacter();
    if (c) { chipIcon.textContent = c.icon; chipName.textContent = c.name; }
  }

  function select(id) {
    Store.setActiveId(id);
    updateChip();
    renderGrid();
    hide();
    onChange();
  }

  function create() {
    const name = nameIn.value.trim() || iconSel.options[iconSel.selectedIndex].text.slice(2);
    const icon = iconSel.value;
    const c = Store.addCharacter(name, icon);
    nameIn.value = '';
    select(c.id);
  }

  function show() { renderGrid(); modal.classList.add('show'); }
  function hide() { modal.classList.remove('show'); }

  function init(changeCb) {
    if (changeCb) onChange = changeCb;
    ensurePresets();
    createBtn.addEventListener('click', create);
    nameIn.addEventListener('keydown', e => { if (e.key === 'Enter') create(); });
    chip.addEventListener('click', show);

    // 没有选中角色 → 弹出选择
    if (!Store.getActiveId()) {
      show();
    } else {
      updateChip();
    }
  }

  return { init, show, hide };
})();
