/* ============================================================
   timer.js — 番茄钟计时引擎
   状态：focus(专注) / break(休息)
   功能：开始 / 暂停 / 继续 / 重置 / 跳过阶段 / 循环
   通过回调把变化交给 app.js，逻辑与界面分离
   ============================================================ */

const Timer = (() => {
  let cfg = { focusMin: 25, breakMin: 5, cycles: 4, autoBreak: true, autoFocus: false };

  let phase = 'focus';     // focus | break
  let remaining = cfg.focusMin * 60;
  let running = false;
  let cycle = 1;           // 当前第几轮（1-based）
  let tickHandle = null;

  // 外部回调
  let handlers = { tick: () => {}, phaseEnd: () => {}, change: () => {} };

  function on(map) { handlers = { ...handlers, ...map }; }

  function phaseDuration(p) {
    return (p === 'focus' ? cfg.focusMin : cfg.breakMin) * 60;
  }

  function setConfig(newCfg) {
    cfg = { ...cfg, ...newCfg };
    if (!running) {
      remaining = phaseDuration(phase);
      emitChange();
    }
  }

  function emitChange() {
    handlers.change({ phase, remaining, running, cycle, totalCycles: cfg.cycles });
  }
  function emitTick() {
    handlers.tick({ phase, remaining, running, cycle, totalCycles: cfg.cycles });
  }

  function start() {
    if (running) return;
    running = true;
    emitChange();
    tickHandle = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        remaining = 0;
        emitTick();
        finishPhase();
      } else {
        emitTick();
      }
    }, 1000);
  }

  function pause() {
    if (!running) return;
    running = false;
    clearInterval(tickHandle);
    emitChange();
  }

  function toggle() { running ? pause() : start(); }

  function reset() {
    running = false;
    clearInterval(tickHandle);
    phase = 'focus';
    cycle = 1;
    remaining = phaseDuration('focus');
    emitChange();
  }

  // 阶段自然结束
  function finishPhase() {
    running = false;
    clearInterval(tickHandle);
    const finished = phase;
    // 通知外部（统计 + 提醒）
    handlers.phaseEnd({ finishedPhase: finished, cycle, totalCycles: cfg.cycles });

    if (finished === 'focus') {
      // 专注结束 → 进入休息
      if (cycle >= cfg.cycles) {
        // 全部循环完成：停在最后，等待用户
        phase = 'break';
        remaining = phaseDuration('break');
        emitChange();
        handlers.change({ phase, remaining, running, cycle, totalCycles: cfg.cycles, allDone: true });
        return;
      }
      phase = 'break';
      remaining = phaseDuration('break');
      emitChange();
      if (cfg.autoBreak) start();
    } else {
      // 休息结束 → 下一轮专注
      cycle = Math.min(cycle + 1, cfg.cycles);
      phase = 'focus';
      remaining = phaseDuration('focus');
      emitChange();
      if (cfg.autoFocus) start();
    }
  }

  // 手动切换阶段（跳过）
  function skip() {
    running = false;
    clearInterval(tickHandle);
    if (phase === 'focus') {
      phase = 'break';
    } else {
      cycle = cycle < cfg.cycles ? cycle + 1 : 1;
      phase = 'focus';
    }
    remaining = phaseDuration(phase);
    emitChange();
  }

  function getState() {
    return { phase, remaining, running, cycle, totalCycles: cfg.cycles };
  }

  return { on, setConfig, start, pause, toggle, reset, skip, getState };
})();
