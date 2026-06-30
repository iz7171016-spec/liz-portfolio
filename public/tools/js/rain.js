/* ============================================================
   rain.js — 窗上雨滴 / 落雨 canvas 动效
   根据 body[data-ambient] 调整雨量
   ============================================================ */

const RainFX = (() => {
  const canvas = document.getElementById('rainCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, drops = [], trails = [], raf;

  const density = { quiet: 60, rainy: 140, midnight: 220 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function build() {
    const ambient = document.body.dataset.ambient || 'rainy';
    const n = density[ambient] || 140;
    // 斜落的雨线
    drops = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 16,
      speed: 4 + Math.random() * 7,
      op: 0.08 + Math.random() * 0.22,
    }));
    // 玻璃上缓慢滑落的水痕
    trails = Array.from({ length: Math.round(n / 6) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 2.2,
      speed: 0.3 + Math.random() * 0.8,
    }));
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    // 雨线
    ctx.strokeStyle = 'rgba(180,210,235,0.5)';
    ctx.lineWidth = 1;
    drops.forEach(d => {
      ctx.globalAlpha = d.op;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 1.5, d.y + d.len);
      ctx.stroke();
      d.y += d.speed;
      d.x -= 0.4;
      if (d.y > h) { d.y = -d.len; d.x = Math.random() * w; }
    });

    // 玻璃水珠滑痕
    ctx.globalAlpha = 1;
    trails.forEach(t => {
      const grad = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.r * 3);
      grad.addColorStop(0, 'rgba(200,225,245,0.35)');
      grad.addColorStop(1, 'rgba(200,225,245,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.r * 3, 0, Math.PI * 2);
      ctx.fill();
      t.y += t.speed;
      if (t.y > h) { t.y = -10; t.x = Math.random() * w; }
    });

    raf = requestAnimationFrame(frame);
  }

  function start() {
    resize(); build();
    cancelAnimationFrame(raf);
    frame();
  }

  window.addEventListener('resize', () => { resize(); build(); });

  return { start, rebuild: build };
})();
