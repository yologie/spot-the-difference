// The renderer: everything the player sees, painted on one canvas in a fixed
// 1280x720 logical area, scaled to the window. It reads the game state and draws
// the panels, the markers on found differences, the counter and timer, and the
// title, pause, round-clear, win and time-up screens.

import { FIELD, PANEL, PANEL_LEFT, PANEL_RIGHT, HUD, HINT_BUTTON, PAUSE_BUTTON, PALETTE, FONT } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_ROUND_CLEAR, SCREEN_WIN, SCREEN_TIME_UP } from './game.js';

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function drawMarker(g, x, y, r, scale, alpha) {
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = '#ffd94d';
  g.lineWidth = 5;
  g.beginPath();
  g.arc(x, y, r * scale, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = '#e08a1e';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(x, y, r * scale - 5, 0, Math.PI * 2);
  g.stroke();
  // A small check in the middle of the ring.
  g.strokeStyle = '#ffd94d';
  g.lineWidth = 4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x - r * 0.35, y);
  g.lineTo(x - r * 0.08, y + r * 0.3);
  g.lineTo(x + r * 0.4, y - r * 0.3);
  g.stroke();
  g.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const scale = Math.min(w / FIELD.width, h / FIELD.height);
    const ox = (w - FIELD.width * scale) / 2;
    const oy = (h - FIELD.height * scale) / 2;
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
  }

  function drawPanelFrame(g, origin, label) {
    g.fillStyle = PALETTE.panelFrameShadow;
    g.fillRect(origin.x - 6, origin.y - 6, PANEL.width + 12, PANEL.height + 12);
    g.fillStyle = PALETTE.panelFrame;
    g.fillRect(origin.x - 3, origin.y - 3, PANEL.width + 6, PANEL.height + 6);
    g.fillStyle = PALETTE.hudMuted;
    g.font = `600 15px ${FONT}`;
    g.textAlign = 'center';
    g.fillText(label, origin.x + PANEL.width / 2, origin.y - 12);
  }

  function drawHud(g, game) {
    const { state } = game;
    const current = game.round();
    g.fillStyle = PALETTE.hudText;
    g.textAlign = 'left';
    g.font = `700 26px ${FONT}`;
    g.fillText(current.name, 72, 34);
    g.font = `400 17px ${FONT}`;
    g.fillStyle = PALETTE.hudMuted;
    g.fillText(current.subtitle, 72, 58);
    // Found counter, big and central.
    const found = game.foundCount();
    const total = current.diffs.length;
    g.textAlign = 'right';
    g.font = `700 30px ${FONT}`;
    g.fillStyle = found === total ? PALETTE.good : PALETTE.hudText;
    g.fillText(`${found} / ${total} found`, 880, 38);
    g.font = `400 16px ${FONT}`;
    g.fillStyle = PALETTE.hudMuted;
    g.fillText(`${total - found} still hidden`, 880, 60);
    // Timer bar.
    const barX = 920;
    const barW = 220;
    const frac = Math.max(0, state.timeLeft / current.timeLimit);
    g.fillStyle = '#3a2438';
    g.beginPath();
    g.roundRect(barX, 18, barW, 20, 10);
    g.fill();
    g.fillStyle = frac < 0.25 ? PALETTE.timerLow : frac < 0.5 ? PALETTE.accent : PALETTE.timerFull;
    if (frac > 0) {
      g.beginPath();
      g.roundRect(barX, 18, barW * frac, 20, 10);
      g.fill();
    }
    g.fillStyle = PALETTE.hudText;
    g.font = `700 22px ${FONT}`;
    g.textAlign = 'left';
    g.fillText(formatTime(state.timeLeft), barX + barW + 12, 36);
    g.font = `400 15px ${FONT}`;
    g.fillStyle = PALETTE.hudMuted;
    g.fillText('time left', barX + barW + 12, 58);
  }

  function drawFooter(g, game) {
    const { state } = game;
    // Score and best.
    g.textAlign = 'left';
    g.fillStyle = PALETTE.hudText;
    g.font = `700 24px ${FONT}`;
    g.fillText(`Score  ${state.score}`, 300, 636);
    g.font = `400 17px ${FONT}`;
    g.fillStyle = PALETTE.hudMuted;
    g.fillText(`Best  ${state.best}`, 300, 662);
    // Hint button.
    g.fillStyle = PALETTE.button;
    g.beginPath();
    g.roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.width, HINT_BUTTON.height, 12);
    g.fill();
    g.strokeStyle = PALETTE.buttonEdge;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.width, HINT_BUTTON.height, 12);
    g.stroke();
    g.fillStyle = state.hintsLeft > 0 ? PALETTE.hudText : PALETTE.hudMuted;
    g.font = `700 20px ${FONT}`;
    g.textAlign = 'center';
    g.fillText(`Hint  (${state.hintsLeft} left)`, HINT_BUTTON.x + HINT_BUTTON.width / 2, HINT_BUTTON.y + 35);
    // Pause button.
    g.fillStyle = PALETTE.button;
    g.beginPath();
    g.roundRect(PAUSE_BUTTON.x, PAUSE_BUTTON.y, PAUSE_BUTTON.width, PAUSE_BUTTON.height, 12);
    g.fill();
    g.strokeStyle = PALETTE.buttonEdge;
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(PAUSE_BUTTON.x, PAUSE_BUTTON.y, PAUSE_BUTTON.width, PAUSE_BUTTON.height, 12);
    g.stroke();
    g.fillStyle = PALETTE.hudText;
    g.font = `700 20px ${FONT}`;
    g.fillText(state.screen === SCREEN_PAUSED ? 'Resume' : 'Pause', PAUSE_BUTTON.x + PAUSE_BUTTON.width / 2, PAUSE_BUTTON.y + 35);
    // Tip line.
    g.fillStyle = PALETTE.hudMuted;
    g.font = `400 15px ${FONT}`;
    g.textAlign = 'center';
    g.fillText('Click a difference on either picture  ·  H for a hint  ·  P to pause  ·  M to mute', 640, 700);
  }

  function drawMarkers(g, game) {
    const { state } = game;
    const current = game.round();
    const now = performance.now();
    for (const diff of current.diffs) {
      if (!state.found.has(diff.id)) continue;
      let scale = 1;
      let alpha = 1;
      if (state.foundPop && state.foundPop.id === diff.id) {
        const age = now - state.foundPop.born;
        scale = 1.45 - 0.45 * Math.min(1, age / 500);
        alpha = 0.65 + 0.35 * Math.min(1, age / 500);
      }
      drawMarker(g, PANEL_LEFT.x + diff.x, PANEL_LEFT.y + diff.y, diff.r, scale, alpha);
      drawMarker(g, PANEL_RIGHT.x + diff.x, PANEL_RIGHT.y + diff.y, diff.r, scale, alpha);
    }
    // Hint pulse: an expanding ring on the hinted difference, both panels.
    if (state.hintPulse) {
      const pulse = state.hintPulse;
      const age = (HINT_PULSE_SECONDS * 1000 - (pulse.until - now)) / 1000;
      const ring = pulse.r + Math.sin(age * Math.PI * 4) * 6 + age * 6;
      const alpha = Math.max(0, 1 - age / HINT_PULSE_SECONDS);
      for (const origin of [PANEL_LEFT, PANEL_RIGHT]) {
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = '#7ed9ff';
        g.lineWidth = 4;
        g.beginPath();
        g.arc(origin.x + pulse.x, origin.y + pulse.y, ring, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
    }
    // Wrong click flash.
    if (state.wrongFlash) {
      const age = now - state.wrongFlash.born;
      const alpha = Math.max(0, 1 - age / 450);
      for (const origin of [PANEL_LEFT, PANEL_RIGHT]) {
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = PALETTE.bad;
        g.lineWidth = 4;
        g.lineCap = 'round';
        const fx = origin.x + state.wrongFlash.x;
        const fy = origin.y + state.wrongFlash.y;
        g.beginPath();
        g.moveTo(fx - 10, fy - 10);
        g.lineTo(fx + 10, fy + 10);
        g.moveTo(fx + 10, fy - 10);
        g.lineTo(fx - 10, fy + 10);
        g.stroke();
        g.restore();
      }
    }
    // Score floaters, kept inside the panel so they never cover the panel labels.
    for (const floater of state.floaters) {
      const age = now - floater.born;
      const rise = (age / floater.life) * 26;
      const fy = Math.max(16, Math.min(404, floater.y));
      g.save();
      g.globalAlpha = Math.max(0, 1 - age / floater.life);
      g.fillStyle = floater.color;
      g.font = `700 22px ${FONT}`;
      g.textAlign = 'center';
      g.fillText(floater.text, PANEL_LEFT.x + floater.x, PANEL_LEFT.y + fy - rise);
      g.fillText(floater.text, PANEL_RIGHT.x + floater.x, PANEL_RIGHT.y + fy - rise);
      g.restore();
    }
  }

  function drawOverlay(g, lines, accent) {
    g.fillStyle = PALETTE.overlay;
    g.fillRect(0, 0, FIELD.width, FIELD.height);
    let y = 250;
    for (const line of lines) {
      g.textAlign = 'center';
      g.fillStyle = line.color ?? PALETTE.hudText;
      g.font = line.font;
      g.fillText(line.text, 640, y);
      y += line.gap ?? 48;
    }
    if (accent) {
      g.fillStyle = PALETTE.accent;
      g.font = `400 18px ${FONT}`;
      g.fillText(accent, 640, y + 8);
    }
  }

  function draw(game) {
    const { state } = game;
    const g = ctx;
    // Backdrop.
    const bg = g.createLinearGradient(0, 0, 0, FIELD.height);
    bg.addColorStop(0, PALETTE.backdropTop);
    bg.addColorStop(1, PALETTE.backdrop);
    g.fillStyle = bg;
    g.fillRect(0, 0, FIELD.width, FIELD.height);

    drawHud(g, game);
    drawPanelFrame(g, PANEL_LEFT, 'Picture A');
    drawPanelFrame(g, PANEL_RIGHT, 'Picture B');
    g.drawImage(state.leftCanvas, PANEL_LEFT.x, PANEL_LEFT.y);
    g.drawImage(state.rightCanvas, PANEL_RIGHT.x, PANEL_RIGHT.y);
    drawMarkers(g, game);
    drawFooter(g, game);

    if (state.screen === SCREEN_TITLE) {
      drawOverlay(g, [
        { text: 'WHISKER CAFÉ', font: `700 64px ${FONT}`, color: PALETTE.accent, gap: 76 },
        { text: 'Spot the Difference', font: `400 30px ${FONT}`, gap: 52 },
        { text: 'Two pictures, a few sneaky changes. Find them all before time runs out.', font: `400 20px ${FONT}`, color: PALETTE.hudMuted, gap: 40 },
        { text: '3 rounds  ·  5, then 7, then 10 differences  ·  hints cost 25 points', font: `400 18px ${FONT}`, color: PALETTE.hudMuted, gap: 56 },
        { text: 'Click anywhere to start', font: `700 26px ${FONT}` },
      ], state.best > 0 ? `Best score: ${state.best}` : null);
    } else if (state.screen === SCREEN_PAUSED) {
      drawOverlay(g, [
        { text: 'Paused', font: `700 52px ${FONT}`, gap: 60 },
        { text: 'Take a breath. The clock is waiting.', font: `400 20px ${FONT}`, color: PALETTE.hudMuted, gap: 52 },
        { text: 'Click or press P to resume', font: `700 24px ${FONT}` },
      ]);
    } else if (state.screen === SCREEN_ROUND_CLEAR) {
      drawOverlay(g, [
        { text: 'Round clear!', font: `700 52px ${FONT}`, color: PALETTE.good, gap: 62 },
        { text: `Time bonus  +${state.roundClearBonus}`, font: `400 24px ${FONT}`, gap: 44 },
        { text: `Score  ${state.score}`, font: `700 28px ${FONT}`, gap: 56 },
        { text: 'Click for the next round', font: `700 24px ${FONT}` },
      ]);
    } else if (state.screen === SCREEN_WIN) {
      drawOverlay(g, [
        { text: 'You found them all!', font: `700 52px ${FONT}`, color: PALETTE.accent, gap: 62 },
        { text: 'Three rounds, twenty-two differences, zero left hiding.', font: `400 20px ${FONT}`, color: PALETTE.hudMuted, gap: 46 },
        { text: `Final score  ${state.score}`, font: `700 30px ${FONT}`, gap: 44 },
        { text: `Best  ${state.best}`, font: `400 20px ${FONT}`, color: PALETTE.hudMuted, gap: 56 },
        { text: 'Click to play again', font: `700 24px ${FONT}` },
      ]);
    } else if (state.screen === SCREEN_TIME_UP) {
      const current = game.round();
      drawOverlay(g, [
        { text: "Time's up!", font: `700 52px ${FONT}`, color: PALETTE.bad, gap: 62 },
        { text: `You found ${game.foundCount()} of ${current.diffs.length} in ${current.name}.`, font: `400 20px ${FONT}`, color: PALETTE.hudMuted, gap: 52 },
        { text: 'Click to retry this round', font: `700 24px ${FONT}` },
      ]);
    }
  }

  fit();
  window.addEventListener('resize', fit);

  return { draw, fit };
}
