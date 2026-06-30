/* ============================================================
   audio.js — 白噪音 / 背景音
   使用 Web Audio API 实时合成，无需外部音频文件，离线即可运行：
     rain    雨声    —  滤波噪声 + 随机雨滴
     cafe    咖啡馆  —  低频褐噪 + 起伏人声嗡鸣
     library 图书馆  —  极轻的粉噪
     music   轻音乐  —  柔和琶音 pad
   ============================================================ */

const AudioEngine = (() => {
  let ctx = null;
  let master = null;
  let current = null;     // 当前声音类型
  let nodes = [];         // 当前活动节点，便于停止
  let volume = 0.5;
  let dropTimer = null;
  let arpTimer = null;

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  // 生成一段循环噪声 buffer
  function noiseBuffer(type = 'white') {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.5;
      } else if (type === 'pink') {
        last = 0.96 * last + 0.04 * white;
        d[i] = last * 2.2;
      } else {
        d[i] = white;
      }
    }
    return buf;
  }

  function makeNoise(type, filterType, freq, gain) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(type);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter); filter.connect(g); g.connect(master);
    src.start();
    nodes.push(src, filter, g);
    return { src, filter, g };
  }

  // 单个雨滴 / 音符的瞬态
  function ping(freq, dur, vol, type = 'sine') {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
  }

  function buildRain() {
    makeNoise('brown', 'lowpass', 1100, 0.55);   // 持续雨幕
    makeNoise('white', 'highpass', 5000, 0.06);  // 细密雨丝
    const tick = () => {
      // 随机滴答声
      ping(180 + Math.random() * 400, 0.12, 0.04 + Math.random() * 0.05, 'triangle');
      dropTimer = setTimeout(tick, 80 + Math.random() * 220);
    };
    tick();
  }

  function buildCafe() {
    makeNoise('brown', 'lowpass', 700, 0.4);     // 低沉环境
    const murmur = makeNoise('pink', 'bandpass', 500, 0.12); // 人声嗡鸣
    // 让人声起伏
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.15; lfoG.gain.value = 0.06;
    lfo.connect(lfoG); lfoG.connect(murmur.g.gain);
    lfo.start(); nodes.push(lfo, lfoG);
    // 偶尔的杯碟轻响
    const tick = () => {
      if (Math.random() < 0.3) ping(900 + Math.random() * 600, 0.18, 0.02, 'sine');
      dropTimer = setTimeout(tick, 1200 + Math.random() * 2500);
    };
    tick();
  }

  function buildLibrary() {
    makeNoise('pink', 'lowpass', 600, 0.18);     // 极轻底噪
    makeNoise('brown', 'lowpass', 300, 0.12);    // 空间感
  }

  function buildMusic() {
    makeNoise('pink', 'lowpass', 800, 0.05);     // 一点空气声
    // 柔和琶音（五声音阶，避免不和谐）
    const scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3];
    let i = 0;
    const tick = () => {
      const f = scale[Math.floor(Math.random() * scale.length)];
      ping(f, 1.8, 0.05, 'sine');
      if (Math.random() < 0.4) ping(f / 2, 2.2, 0.03, 'sine'); // 低八度铺底
      i++;
      arpTimer = setTimeout(tick, 900 + Math.random() * 700);
    };
    tick();
  }

  function stopAll() {
    nodes.forEach(n => { try { n.stop && n.stop(); n.disconnect && n.disconnect(); } catch (e) {} });
    nodes = [];
    clearTimeout(dropTimer); clearTimeout(arpTimer);
    current = null;
  }

  // 公共：切换/播放某声音，再次点击同一个则停止
  function toggle(sound) {
    ensureCtx();
    if (current === sound) { stopAll(); return null; }
    stopAll();
    if (sound === 'none' || !sound) return null;
    current = sound;
    if (sound === 'rain') buildRain();
    else if (sound === 'cafe') buildCafe();
    else if (sound === 'library') buildLibrary();
    else if (sound === 'music') buildMusic();
    return current;
  }

  function play(sound) {
    if (current === sound) return current;
    stopAll();
    return toggle(sound);
  }

  function setVolume(v) {
    volume = v / 100;
    if (master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
  }

  return { toggle, play, stop: stopAll, setVolume, get current() { return current; } };
})();
