// Input: pointer clicks and keys, mapped from window coordinates into the game's
// fixed 1280x720 logical area, then routed to the right game action by screen.

import { FIELD, PANEL, PANEL_LEFT, PANEL_RIGHT, HINT_BUTTON, PAUSE_BUTTON } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_ROUND_CLEAR, SCREEN_WIN, SCREEN_TIME_UP } from './game.js';
import { toggleMute, soundTick } from './sound.js';

function toLogical(clientX, clientY) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = Math.min(w / FIELD.width, h / FIELD.height);
  const ox = (w - FIELD.width * scale) / 2;
  const oy = (h - FIELD.height * scale) / 2;
  return { x: (clientX - ox) / scale, y: (clientY - oy) / scale };
}

function inside(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function insidePanel(point, origin) {
  return point.x >= origin.x && point.x <= origin.x + PANEL.width && point.y >= origin.y && point.y <= origin.y + PANEL.height;
}

export function createInput(canvas, game, announce) {
  function routeClick(point) {
    const screen = game.state.screen;
    if (screen === SCREEN_TITLE) {
      soundTick();
      game.startGame();
      announce(`Playing. ${game.round().diffs.length} differences to find.`);
      return;
    }
    if (screen === SCREEN_ROUND_CLEAR) {
      soundTick();
      game.nextRound();
      announce(`Playing. ${game.round().diffs.length} differences to find.`);
      return;
    }
    if (screen === SCREEN_WIN) {
      soundTick();
      game.startGame();
      announce(`Playing. ${game.round().diffs.length} differences to find.`);
      return;
    }
    if (screen === SCREEN_TIME_UP) {
      soundTick();
      game.retryRound();
      announce(`Playing. ${game.round().diffs.length} differences to find.`);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      game.togglePause();
      announce('Playing.');
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    if (inside(point, HINT_BUTTON)) {
      if (game.useHint()) announce('Hint used.');
      return;
    }
    if (inside(point, PAUSE_BUTTON)) {
      game.togglePause();
      announce('Paused.');
      return;
    }
    if (insidePanel(point, PANEL_LEFT)) {
      game.clickPanel(point.x - PANEL_LEFT.x, point.y - PANEL_LEFT.y);
      return;
    }
    if (insidePanel(point, PANEL_RIGHT)) {
      game.clickPanel(point.x - PANEL_RIGHT.x, point.y - PANEL_RIGHT.y);
    }
  }

  function onPointer(event) {
    const point = toLogical(event.clientX, event.clientY);
    routeClick(point);
  }

  function onKey(event) {
    const key = event.key.toLowerCase();
    if (key === 'h') {
      if (game.state.screen === SCREEN_PLAY && game.useHint()) announce('Hint used.');
    } else if (key === 'p' || key === 'escape') {
      game.togglePause();
      announce(game.state.screen === SCREEN_PAUSED ? 'Paused.' : 'Playing.');
    } else if (key === 'm') {
      const muted = toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    } else if (key === ' ' || key === 'enter') {
      event.preventDefault();
      const screen = game.state.screen;
      if (screen === SCREEN_TITLE || screen === SCREEN_WIN) {
        game.startGame();
        announce(`Playing. ${game.round().diffs.length} differences to find.`);
      } else if (screen === SCREEN_ROUND_CLEAR) {
        game.nextRound();
        announce(`Playing. ${game.round().diffs.length} differences to find.`);
      } else if (screen === SCREEN_TIME_UP) {
        game.retryRound();
        announce(`Playing. ${game.round().diffs.length} differences to find.`);
      }
    }
  }

  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);

  return { toLogical, routeClick };
}
