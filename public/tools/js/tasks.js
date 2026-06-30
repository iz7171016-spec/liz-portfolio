/* ============================================================
   tasks.js — 任务清单（新增 / 完成 / 删除）
   数据存于当前角色 data.tasks
   ============================================================ */

const Tasks = (() => {
  const listEl  = document.getElementById('taskList');
  const inputEl = document.getElementById('taskInput');
  const addBtn  = document.getElementById('addTaskBtn');
  const countEl = document.getElementById('taskCount');

  function getAll() {
    const data = Store.load();
    return data ? data.tasks : [];
  }

  function render() {
    const tasks = getAll();
    listEl.innerHTML = '';
    if (!tasks.length) {
      listEl.innerHTML = '<li class="task-empty">还没有任务，添加一个开始吧</li>';
    }
    tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = 'task-item' + (t.done ? ' done' : '');
      li.innerHTML = `
        <span class="task-check">${t.done ? '✓' : ''}</span>
        <span class="task-text"></span>
        <button class="task-del" title="删除">✕</button>`;
      li.querySelector('.task-text').textContent = t.text;
      li.querySelector('.task-check').addEventListener('click', () => toggle(t.id));
      li.querySelector('.task-del').addEventListener('click', () => remove(t.id));
      listEl.appendChild(li);
    });
    const done = tasks.filter(t => t.done).length;
    countEl.textContent = `${done} / ${tasks.length}`;
  }

  function add(text) {
    text = text.trim();
    if (!text) return;
    Store.update(d => {
      d.tasks.push({ id: 't_' + Date.now().toString(36), text, done: false });
    });
    render();
  }

  function toggle(id) {
    Store.update(d => {
      const t = d.tasks.find(x => x.id === id);
      if (t) t.done = !t.done;
    });
    render();
  }

  function remove(id) {
    Store.update(d => { d.tasks = d.tasks.filter(x => x.id !== id); });
    render();
  }

  function init() {
    addBtn.addEventListener('click', () => { add(inputEl.value); inputEl.value = ''; });
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') { add(inputEl.value); inputEl.value = ''; }
    });
    render();
  }

  return { init, render };
})();
