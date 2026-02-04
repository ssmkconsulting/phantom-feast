const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const multEl = document.getElementById('multiplier');
const bestEl = document.getElementById('best');
const lastEl = document.getElementById('last-score');
const overlayBestEl = document.getElementById('overlay-best');
const livesEl = document.getElementById('lives');
const imessageBtn = document.getElementById('imessage');

const overlay = document.getElementById('overlay');
const playBtn = document.getElementById('play');
const restartBtn = document.getElementById('restart');
const focusBtn = document.getElementById('toggle-focus');
const tipsBtn = document.getElementById('view-tips');
const legendBtn = document.getElementById('view-legend');
const instructionsBtn = document.getElementById('view-instructions');
const tips = document.getElementById('tips');
const legendModal = document.getElementById('legend-modal');
const legendOverlay = document.getElementById('legend-overlay');
const legendClose = document.getElementById('legend-close');
const instructionsModal = document.getElementById('instructions-modal');
const instructionsOverlay = document.getElementById('instructions-overlay');
const instructionsClose = document.getElementById('instructions-close');
const scorebar = document.querySelector('.scorebar');

const baseRadius = 18;
const obstacleThreshold = 1200;
const blackoutMin = 22;
const blackoutMax = 36;

const state = {
  running: false,
  pointer: { x: 0, y: 0 },
  player: { x: 0, y: 0, r: baseRadius },
  orbs: [],
  hazards: [],
  score: 0,
  multiplier: 1,
  streakTimer: 0,
  timeLeft: 45,
  orbTimer: 0,
  goldTimer: 0,
  poisonTimer: 0,
  tripleSpawnTimer: 0,
  microTimer: 0,
  hazardTimer: 0,
  last: 0,
  sickTimer: 0,
  giantTimer: 0,
  tripleTimer: 0,
  blackout: 0,
  blackoutClock: 0,
  lastScore: 0,
  lives: 1,
  grace: 0,
  best: Number(localStorage.getItem('flux-best')) || 0,
  obstacles: [],
  obstaclesDropped: false,
  superGhost: null,
  specialObj: null,
  specialTimer: 0,
};

const colors = {
  orb: '#6cf0c2',
  orbGlow: 'rgba(108, 240, 194, 0.35)',
  gold: '#ffd166',
  goldGlow: 'rgba(255, 209, 102, 0.45)',
  poison: '#ff4d6d',
  poisonGlow: 'rgba(255, 77, 109, 0.45)',
  hazard: '#a78bfa',
  hazardGlow: 'rgba(167, 139, 250, 0.38)',
  core: '#e8eef7',
};

let popups = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (!state.running) {
    state.player.x = canvas.width / 2;
    state.player.y = canvas.height / 2;
  }
}

resize();
window.addEventListener('resize', resize);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function resetRun() {
  state.running = false;
  state.orbs = [];
  state.hazards = [];
  state.score = 0;
  state.multiplier = 1;
  state.streakTimer = 0;
  state.timeLeft = 45;
  state.orbTimer = 0;
  state.goldTimer = 0;
  state.poisonTimer = 0;
  state.tripleSpawnTimer = 0;
  state.microTimer = 0;
  state.hazardTimer = 0;
  state.last = 0;
  state.sickTimer = 0;
  state.giantTimer = 0;
  state.tripleTimer = 0;
  state.blackout = 0;
  state.blackoutClock = 0;
  state.lives = 1;
  state.grace = 0;
  state.obstacles = [];
  state.obstaclesDropped = false;
  state.superGhost = null;
  state.specialObj = null;
  state.specialTimer = 0;
  state.player.x = canvas.width / 2;
  state.player.y = canvas.height / 2;
  state.player.r = baseRadius;
  overlay.style.display = 'grid';
  tips?.classList.remove('open');
  legendModal?.classList.remove('open');
  legendOverlay?.classList.remove('open');
  instructionsModal?.classList.remove('open');
  instructionsOverlay?.classList.remove('open');
  scorebar?.classList.add('hidden');
  updateUI();
}

function startRun() {
  state.running = true;
  overlay.style.display = 'none';
  scorebar?.classList.remove('hidden');
}

function updateUI() {
  scoreEl.textContent = Math.round(state.score);
  timeEl.textContent = state.timeLeft.toFixed(1);
  multEl.textContent = `${state.multiplier.toFixed(1)}x`;
  bestEl.textContent = Math.round(state.best);
  lastEl && (lastEl.textContent = Math.round(state.lastScore));
  overlayBestEl && (overlayBestEl.textContent = Math.round(state.best));
  livesEl && (livesEl.textContent = state.lives);
  if (imessageBtn) {
    const msg = encodeURIComponent(`I just scored ${Math.round(state.best)} in Phantom Feast! Can you beat it?`);
    imessageBtn.href = `sms:&body=${msg}`;
  }
}

function spawnOrb() {
  const r = rand(10, 16);
  state.orbs.push({
    x: rand(r, canvas.width - r),
    y: rand(r, canvas.height - r),
    r,
    life: 8,
    kind: 'orb',
  });
}

function spawnGold() {
  const r = rand(12, 16);
  state.orbs.push({
    x: rand(r, canvas.width - r),
    y: rand(r, canvas.height - r),
    r,
    life: 5.5,
    kind: 'gold',
    vx: rand(-140, 140),
    vy: rand(-140, 140),
  });
}

function spawnPoison() {
  const r = rand(11, 15);
  state.orbs.push({
    x: rand(r, canvas.width - r),
    y: rand(r, canvas.height - r),
    r,
    life: 7,
    kind: 'poison',
  });
}

function spawnMicroGiant() {
  const r = rand(4, 6);
  state.orbs.push({
    x: rand(r, canvas.width - r),
    y: rand(r, canvas.height - r),
    r,
    life: 6,
    kind: 'micro',
  });
}

function spawnTripleOrb() {
  const r = rand(10, 13);
  state.orbs.push({
    x: rand(r, canvas.width - r),
    y: rand(r, canvas.height - r),
    r,
    life: 4,
    kind: 'triple',
    vx: rand(-220, 220),
    vy: rand(-220, 220),
  });
}

function spawnSuperGhost() {
  state.superGhost = {
    x: -80,
    y: rand(0, canvas.height),
    r: 20,
    speed: 220,
    active: true,
  };
}

function dropObstacles() {
  const w = canvas.width;
  const h = canvas.height;
  state.obstacles = [
    { x: w * 0.25, y: h * 0.3, w: 120, h: 18 },
    { x: w * 0.6, y: h * 0.6, w: 140, h: 18 },
    { x: w * 0.45, y: h * 0.45, w: 18, h: 140 },
  ];
  state.obstaclesDropped = true;
}

function spawnHazard() {
  const r = rand(14, 18);
  const edge = Math.random() < 0.5 ? 0 : 1;
  const x = edge ? rand(0, canvas.width) : Math.random() < 0.5 ? -40 : canvas.width + 40;
  const y = edge ? (Math.random() < 0.5 ? -40 : canvas.height + 40) : rand(0, canvas.height);
  const speed = rand(110, 180);
  const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
  state.hazards.push({
    x,
    y,
    r,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    turn: rand(1.2, 2.4),
  });
}

function handleCollisions(dt) {
  // Orbs
  for (let i = state.orbs.length - 1; i >= 0; i--) {
    const o = state.orbs[i];
    const dx = o.x - state.player.x;
    const dy = o.y - state.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < o.r + state.player.r) {
      const scoreFactor = state.multiplier * (state.tripleTimer > 0 ? 3 : 1);
      if (o.kind === 'orb') {
        state.score += 25 * scoreFactor;
        state.multiplier = clamp(state.multiplier + 0.2, 1, 5);
        state.streakTimer = 2.4;
        state.timeLeft = clamp(state.timeLeft + 1.2, 0, 75);
        addPopup(`+${Math.round(25 * scoreFactor)}`, o.x, o.y, colors.orb);
      } else if (o.kind === 'gold') {
        state.score += 160 * scoreFactor;
        state.multiplier = clamp(state.multiplier + 0.4, 1, 6);
        state.streakTimer = 3.2;
        state.timeLeft = clamp(state.timeLeft + 2.5, 0, 80);
        addPopup(`Gold ${state.multiplier.toFixed(1)}x`, o.x, o.y, colors.gold);
      } else if (o.kind === 'poison') {
        state.score = Math.max(0, state.score - 80);
        state.multiplier = Math.max(1, state.multiplier - 0.6);
        state.timeLeft = Math.max(0, state.timeLeft - 3);
        spawnHazard();
        spawnHazard();
        state.sickTimer = 4;
        addPopup('−80 & ghosts!', o.x, o.y, colors.poison);
      } else if (o.kind === 'micro') {
        state.player.r = baseRadius * 3;
        state.giantTimer = 8;
        addPopup('Mega size!', o.x, o.y, '#fff5c7');
      } else if (o.kind === 'triple') {
        state.tripleTimer = 10;
        addPopup('Triple points!', o.x, o.y, '#7cc8ff');
      } else if (o.kind === 'special-stop') {
        if (state.superGhost) state.superGhost.active = false;
        addPopup('Super ghost stunned', o.x, o.y, colors.gold);
      }
      state.orbs.splice(i, 1);
      continue;
    }
    o.life -= dt;
    if (o.life <= 0) state.orbs.splice(i, 1);
  }

  // Special stop object
  if (state.specialObj) {
    const s = state.specialObj;
    const dx = s.x - state.player.x;
    const dy = s.y - state.player.y;
    if (Math.hypot(dx, dy) < s.r + state.player.r) {
      if (state.superGhost) state.superGhost.active = false;
      addPopup('Super ghost stunned', s.x, s.y, colors.gold);
      state.specialObj = null;
    } else {
      s.life -= dt;
      if (s.life <= 0) state.specialObj = null;
    }
  }

  // Blackout timer tick
  if (state.blackout > 0) {
    state.blackout -= dt;
    if (state.blackout < 0) state.blackout = 0;
  }

  // Hazards
  for (let i = state.hazards.length - 1; i >= 0; i--) {
    const h = state.hazards[i];
    const dx = h.x - state.player.x;
    const dy = h.y - state.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < h.r + state.player.r) {
      if (state.grace > 0) continue;
      if (state.lives > 1) {
        state.lives -= 1;
        state.grace = 1.2;
        addPopup('Life saved!', state.player.x, state.player.y, '#9dfcb5');
        state.player.x = canvas.width / 2;
        state.player.y = canvas.height / 2;
        continue;
      }
      gameOver();
      return;
    }
  }
}

function gameOver() {
  state.running = false;
  state.lastScore = state.score;
  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem('flux-best', String(Math.round(state.best)));
  }
  updateUI();
  overlay.style.display = 'grid';
}

function update(dt) {
  // Player easing toward pointer
  const ease = 1 - Math.pow(0.85, dt * 60);
  state.player.x += (state.pointer.x - state.player.x) * ease;
  state.player.y += (state.pointer.y - state.player.y) * ease;

  if (state.sickTimer > 0) state.sickTimer -= dt;
  if (state.grace > 0) state.grace -= dt;
  if (state.giantTimer > 0) {
    state.giantTimer -= dt;
    if (state.giantTimer <= 0) state.player.r = baseRadius;
  }
  if (state.tripleTimer > 0) state.tripleTimer -= dt;

  // Timers
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    gameOver();
    return;
  }

  if (state.streakTimer > 0) {
    state.streakTimer -= dt;
    if (state.streakTimer <= 0) state.multiplier = Math.max(1, state.multiplier - 0.4);
  }

  // Unlock obstacles and super ghost at high score
  if (!state.obstaclesDropped && state.score >= obstacleThreshold) {
    dropObstacles();
  }
  if (!state.superGhost && state.score >= obstacleThreshold) {
    spawnSuperGhost();
  }

  // Spawning
  state.orbTimer += dt;
  if (state.orbTimer >= rand(0.6, 1)) {
    state.orbTimer = 0;
    spawnOrb();
  }

  state.goldTimer += dt;
  if (state.goldTimer >= rand(8, 12)) {
    state.goldTimer = 0;
    spawnGold();
  }

  state.poisonTimer += dt;
  if (state.poisonTimer >= rand(7, 11)) {
    state.poisonTimer = 0;
    spawnPoison();
  }

  state.microTimer += dt;
  if (state.microTimer >= rand(22, 32)) {
    state.microTimer = 0;
    spawnMicroGiant();
  }

  state.tripleSpawnTimer += dt;
  if (state.tripleSpawnTimer >= rand(18, 28)) {
    state.tripleSpawnTimer = 0;
    spawnTripleOrb();
  }

  // Special stop object if super ghost is active
  if (state.superGhost && state.superGhost.active) {
    state.specialTimer += dt;
    if (state.specialTimer >= rand(9, 14)) {
      state.specialTimer = 0;
      const r = 9;
      state.specialObj = {
        x: rand(r, canvas.width - r),
        y: rand(r, canvas.height - r),
        r,
        life: 6,
        kind: 'special-stop',
      };
    }
  }

  // Blackout trigger
  state.blackoutClock += dt;
  if (state.blackoutClock >= rand(blackoutMin, blackoutMax)) {
    state.blackoutClock = 0;
    state.blackout = 1.2;
  }

  state.hazardTimer += dt;
  if (state.hazardTimer >= rand(1.6, 2.4)) {
    state.hazardTimer = 0;
    spawnHazard();
  }

  // Hazard movement
  state.hazards.forEach((h) => {
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.turn -= dt;
    if (h.turn <= 0) {
      h.turn = rand(1.2, 2.2);
      const angle = Math.atan2(state.player.y - h.y, state.player.x - h.x);
      const speed = Math.hypot(h.vx, h.vy);
      h.vx = Math.cos(angle) * speed;
      h.vy = Math.sin(angle) * speed;
    }
    // Wrap softly
    if (h.x < -60) h.x = canvas.width + 60;
    if (h.x > canvas.width + 60) h.x = -60;
    if (h.y < -60) h.y = canvas.height + 60;
    if (h.y > canvas.height + 60) h.y = -60;
  });

  // Super ghost chase
  if (state.superGhost && state.superGhost.active) {
    const sg = state.superGhost;
    const angle = Math.atan2(state.player.y - sg.y, state.player.x - sg.x);
    sg.x += Math.cos(angle) * sg.speed * dt;
    sg.y += Math.sin(angle) * sg.speed * dt;
    // collision
    const dist = Math.hypot(sg.x - state.player.x, sg.y - state.player.y);
    if (dist < sg.r + state.player.r) {
      if (state.grace <= 0) {
        if (state.lives > 1) {
          state.lives -= 1;
          state.grace = 1.2;
          addPopup('Life saved!', state.player.x, state.player.y, '#9dfcb5');
          state.player.x = canvas.width / 2;
          state.player.y = canvas.height / 2;
        } else {
          gameOver();
          return;
        }
      }
    }
  } else if (state.superGhost && !state.superGhost.active) {
    state.superGhost = null;
  }

  // Obstacles collision (spikes - instant KO)
  if (state.obstacles.length) {
    for (const ob of state.obstacles) {
      if (
        state.player.x + state.player.r > ob.x &&
        state.player.x - state.player.r < ob.x + ob.w &&
        state.player.y + state.player.r > ob.y &&
        state.player.y - state.player.r < ob.y + ob.h
      ) {
        gameOver();
        return;
      }
    }
  }

  handleCollisions(dt);
  updateUI();
}

function drawGrid() {
  const spacing = 48;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function draw() {
  const t = performance.now();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, 'rgba(12, 35, 62, 0.8)');
  gradient.addColorStop(1, 'rgba(4, 11, 22, 0.9)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  // Obstacles
  if (state.obstacles.length) {
    ctx.save();
    state.obstacles.forEach((ob) => {
      const horizontal = ob.w >= ob.h;
      const grad = ctx.createLinearGradient(ob.x, ob.y, ob.x + (horizontal ? ob.w : 0), ob.y + (horizontal ? 0 : ob.h));
      grad.addColorStop(0, 'rgba(255,104,104,0.25)');
      grad.addColorStop(1, 'rgba(255,60,60,0.4)');
      ctx.fillStyle = grad;
      ctx.strokeStyle = 'rgba(255,120,120,0.8)';
      ctx.lineWidth = 2.5;

      // base bar
      ctx.beginPath();
      ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 6);
      ctx.fill();
      ctx.stroke();

      // spike teeth along the long edge
      const spikes = Math.max(4, Math.floor((horizontal ? ob.w : ob.h) / 24));
      ctx.beginPath();
      for (let i = 0; i <= spikes; i++) {
        const t = i / spikes;
        const px = ob.x + (horizontal ? t * ob.w : 0);
        const py = ob.y + (horizontal ? 0 : t * ob.h);
        if (horizontal) {
          const dir = i % 2 === 0 ? -1 : 1;
          ctx.moveTo(px, ob.y + (dir === 1 ? ob.h : 0));
          ctx.lineTo(px + ob.w / spikes, ob.y + (dir === 1 ? 0 : ob.h));
        } else {
          const dir = i % 2 === 0 ? -1 : 1;
          ctx.moveTo(ob.x + (dir === 1 ? ob.w : 0), py);
          ctx.lineTo(ob.x + (dir === 1 ? 0 : ob.w), py + ob.h / spikes);
        }
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  // Orbs
  state.orbs.forEach((o) => {
    drawOrb(o);
  });

  // Special stop object
  if (state.specialObj) {
    const s = state.specialObj;
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.02);
    ctx.save();
    ctx.shadowBlur = 26;
    ctx.shadowColor = `rgba(255, 255, 255, ${0.35 * pulse})`;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Lights out overlay
  if (state.blackout > 0) {
    const alpha = Math.min(0.88, state.blackout / 1.2);
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Hazards (ghosts)
  state.hazards.forEach((h) => {
    drawGhost(h);
  });

  if (state.superGhost) {
    drawSuperGhost(state.superGhost);
  }

  // Player core
  drawPacman(state.player, t);

  // Popups
  drawPopups();
}

function loop(ts) {
  if (!state.last) state.last = ts;
  const dt = clamp((ts - state.last) / 1000, 0, 0.05);
  state.last = ts;

  if (state.running) update(dt);
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener('pointermove', (e) => {
  state.pointer.x = e.clientX;
  state.pointer.y = e.clientY;
});

canvas.addEventListener('pointerdown', (e) => {
  state.pointer.x = e.clientX;
  state.pointer.y = e.clientY;
});

playBtn?.addEventListener('click', () => {
  resetRun();
  startRun();
});

restartBtn?.addEventListener('click', () => {
  resetRun();
  startRun();
});

focusBtn?.addEventListener('click', () => {
  document.body.classList.toggle('focus-mode');
  focusBtn.textContent = document.body.classList.contains('focus-mode') ? 'Focus off' : 'Focus mode';
});

tipsBtn?.addEventListener('click', () => {
  tips.classList.toggle('open');
});

legendBtn?.addEventListener('click', () => {
  legendModal?.classList.toggle('open');
  legendOverlay?.classList.toggle('open');
});

legendClose?.addEventListener('click', () => {
  legendModal?.classList.remove('open');
  legendOverlay?.classList.remove('open');
});

legendOverlay?.addEventListener('click', (e) => {
  if (e.target === legendOverlay) {
    legendModal?.classList.remove('open');
    legendOverlay?.classList.remove('open');
  }
});

instructionsBtn?.addEventListener('click', () => {
  instructionsModal?.classList.toggle('open');
  instructionsOverlay?.classList.toggle('open');
});

instructionsClose?.addEventListener('click', () => {
  instructionsModal?.classList.remove('open');
  instructionsOverlay?.classList.remove('open');
});

instructionsOverlay?.addEventListener('click', (e) => {
  if (e.target === instructionsOverlay) {
    instructionsModal?.classList.remove('open');
    instructionsOverlay?.classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    if (!state.running) {
      resetRun();
      startRun();
    }
  }
  if (e.key === 'Escape' && state.running) gameOver();
});

resetRun();
updateUI();
requestAnimationFrame(loop);

function drawPopups() {
  const now = performance.now() / 1000;
  popups = popups.filter((p) => {
    const life = 1.2;
    const t = (now - p.start) / life;
    if (t >= 1) return false;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = p.color;
    ctx.font = '700 18px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y - 30 * t);
    ctx.restore();
    return true;
  });
}

function addPopup(text, x, y, color) {
  popups.push({ text, x, y, color, start: performance.now() / 1000 });
}

function drawOrb(o) {
  if (o.kind === 'gold') {
    // drift
    o.x += o.vx * (1 / 60);
    o.y += o.vy * (1 / 60);
    if (o.x < o.r || o.x > canvas.width - o.r) o.vx *= -1;
    if (o.y < o.r || o.y > canvas.height - o.r) o.vy *= -1;
    ctx.save();
    ctx.shadowBlur = 26;
    ctx.shadowColor = colors.goldGlow;
    const grad = ctx.createRadialGradient(o.x - o.r * 0.4, o.y - o.r * 0.4, o.r * 0.2, o.x, o.y, o.r);
    grad.addColorStop(0, '#fff5c7');
    grad.addColorStop(1, colors.gold);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (o.kind === 'poison') {
    ctx.save();
    ctx.shadowBlur = 22;
    ctx.shadowColor = colors.poisonGlow;
    ctx.fillStyle = colors.poison;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (o.kind === 'micro') {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255,255,255,0.15)';
    ctx.fillStyle = 'rgba(200, 210, 230, 0.5)';
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (o.kind === 'triple') {
    o.x += o.vx * (1 / 60);
    o.y += o.vy * (1 / 60);
    if (o.x < o.r || o.x > canvas.width - o.r) o.vx *= -1;
    if (o.y < o.r || o.y > canvas.height - o.r) o.vy *= -1;
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.02);
    ctx.save();
    ctx.shadowBlur = 30;
    ctx.shadowColor = `rgba(124, 200, 255, ${0.6 * pulse})`;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * pulse})`;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(124, 200, 255, 0.9)`;
    ctx.stroke();
    ctx.restore();
    return;
  }
  // default orb
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = colors.orbGlow;
  ctx.fillStyle = colors.orb;
  ctx.beginPath();
  ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGhost(h) {
  const r = h.r;
  ctx.save();
  ctx.shadowBlur = 26;
  ctx.shadowColor = colors.hazardGlow;
  ctx.fillStyle = colors.hazard;
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(h.x - r, h.y);
  ctx.arc(h.x, h.y - r * 0.35, r, Math.PI, 0, false); // domed head
  ctx.lineTo(h.x + r, h.y + r);
  ctx.quadraticCurveTo(h.x + r * 0.6, h.y + r * 1.2, h.x + r * 0.3, h.y + r);
  ctx.quadraticCurveTo(h.x, h.y + r * 1.2, h.x - r * 0.3, h.y + r);
  ctx.quadraticCurveTo(h.x - r * 0.6, h.y + r * 1.2, h.x - r, h.y + r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // eyes
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0b132b';
  const eyeY = h.y - r * 0.2;
  ctx.beginPath();
  ctx.arc(h.x - r * 0.35, eyeY, r * 0.18, 0, Math.PI * 2);
  ctx.arc(h.x + r * 0.35, eyeY, r * 0.18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#e8eef7';
  ctx.beginPath();
  ctx.arc(h.x - r * 0.35, eyeY - r * 0.05, r * 0.08, 0, Math.PI * 2);
  ctx.arc(h.x + r * 0.35, eyeY - r * 0.05, r * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawSuperGhost(sg) {
  const r = sg.r;
  ctx.save();
  ctx.shadowBlur = 32;
  ctx.shadowColor = 'rgba(255, 111, 97, 0.5)';
  ctx.fillStyle = '#ff6f61';
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(sg.x - r, sg.y);
  ctx.arc(sg.x, sg.y - r * 0.35, r, Math.PI, 0, false);
  ctx.lineTo(sg.x + r, sg.y + r);
  ctx.quadraticCurveTo(sg.x + r * 0.6, sg.y + r * 1.2, sg.x + r * 0.3, sg.y + r);
  ctx.quadraticCurveTo(sg.x, sg.y + r * 1.2, sg.x - r * 0.3, sg.y + r);
  ctx.quadraticCurveTo(sg.x - r * 0.6, sg.y + r * 1.2, sg.x - r, sg.y + r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const eyeY = sg.y - r * 0.2;
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0b132b';
  ctx.beginPath();
  ctx.arc(sg.x - r * 0.35, eyeY, r * 0.18, 0, Math.PI * 2);
  ctx.arc(sg.x + r * 0.35, eyeY, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(sg.x - r * 0.35, eyeY - r * 0.05, r * 0.08, 0, Math.PI * 2);
  ctx.arc(sg.x + r * 0.35, eyeY - r * 0.05, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPacman(player, t) {
  const r = player.r;
  const mouth = 0.3 + 0.15 * Math.sin(t * 0.008);
  ctx.save();
  ctx.shadowBlur = 26;
  const sick = state.sickTimer > 0;
  const fill = sick ? '#7cf2d4' : '#fce062';
  const glow = sick ? 'rgba(124, 242, 212, 0.35)' : 'rgba(252, 224, 98, 0.4)';
  ctx.shadowColor = glow;
  ctx.fillStyle = fill;
  const angle = Math.atan2(state.pointer.y - player.y, state.pointer.x - player.x);
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.arc(player.x, player.y, r, angle + mouth, angle + Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0b132b';
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(angle - Math.PI / 2) * r * 0.35, player.y + Math.sin(angle - Math.PI / 2) * r * 0.35, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  // Halo
  ctx.strokeStyle = `rgba(252, 224, 98, ${0.14 * state.multiplier})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(player.x, player.y, r + 9, 0, Math.PI * 2);
  ctx.stroke();
  if (state.sickTimer > 0) {
    ctx.strokeStyle = `rgba(255, 77, 109, 0.18)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(player.x, player.y, r + 14, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
