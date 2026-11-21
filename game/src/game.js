// The game itself: screens, rounds, finds, hints and the timer. It knows nothing
// about the DOM except the two offscreen canvases it paints the panels into; the
// renderer reads this state and the input module calls these methods.

import { PANEL, SCORE_FIND, SCORE_HINT_COST, SCORE_ROUND_BONUS_PER_SECOND, WRONG_CLICK_TIME_PENALTY, HINTS_PER_ROUND, HINT_PULSE_SECONDS } from './config.js';
import { ROUNDS, paintPanel } from './scenes.js';
import { soundFound, soundHint, soundRoundClear, soundTimeout, soundWin, soundWrong } from './sound.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_CLEAR = 'roundClear';
export const SCREEN_WIN = 'win';
export const SCREEN_TIME_UP = 'timeUp';

function makePanelCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = PANEL.width;
  canvas.height = PANEL.height;
  return canvas;
}

export function createGame() {
  const state = {
    screen: SCREEN_TITLE,
    roundIndex: 0,
    found: new Set(),
    hintsLeft: HINTS_PER_ROUND,
    timeLeft: ROUNDS[0].timeLimit,
    score: 0,
    best: 0,
    floaters: [],
    wrongFlash: null,
    hintPulse: null,
    foundPop: null,
    roundClearBonus: 0,
    leftCanvas: makePanelCanvas(),
    rightCanvas: makePanelCanvas(),
  };

  function round() {
    return ROUNDS[state.roundIndex];
  }

  function paintPanels() {
    const current = round();
    const all = new Set(current.diffs.map((d) => d.id));
    paintPanel(state.leftCanvas.getContext('2d'), current, new Set());
    paintPanel(state.rightCanvas.getContext('2d'), current, all);
  }

  function addFloater(x, y, text, color) {
    state.floaters.push({ x, y, text, color, born: performance.now(), life: 1100 });
  }

  function startRound(index) {
    state.roundIndex = index;
    state.found = new Set();
    state.hintsLeft = HINTS_PER_ROUND;
    state.timeLeft = round().timeLimit;
    state.floaters = [];
    state.wrongFlash = null;
    state.hintPulse = null;
    state.foundPop = null;
    paintPanels();
    state.screen = SCREEN_PLAY;
  }

  function startGame() {
    state.score = 0;
    startRound(0);
  }

  function clearRound() {
    const bonus = Math.ceil(state.timeLeft) * SCORE_ROUND_BONUS_PER_SECOND;
    state.score += bonus;
    state.roundClearBonus = bonus;
    soundRoundClear();
    if (state.roundIndex >= ROUNDS.length - 1) {
      state.screen = SCREEN_WIN;
      soundWin();
      if (state.score > state.best) state.best = state.score;
    } else {
      state.screen = SCREEN_ROUND_CLEAR;
    }
  }

  function timeUp() {
    state.screen = SCREEN_TIME_UP;
    soundTimeout();
  }

  /** A click inside a picture panel, in that panel's own 560x420 coordinates. */
  function clickPanel(x, y) {
    if (state.screen !== SCREEN_PLAY) return;
    const current = round();
    for (const diff of current.diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        state.found.add(diff.id);
        state.score += SCORE_FIND;
        state.foundPop = { id: diff.id, born: performance.now() };
        addFloater(diff.x, diff.y + diff.r + 26, `+${SCORE_FIND}`, '#ffd94d');
        soundFound();
        if (state.found.size === current.diffs.length) clearRound();
        return;
      }
    }
    // Nothing there: a red flash where the click landed, and the clock loses time.
    state.wrongFlash = { x, y, born: performance.now() };
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_PENALTY);
    addFloater(x, y - 18, `-${WRONG_CLICK_TIME_PENALTY}s`, '#ff5a5a');
    soundWrong();
  }

  /** Spend one hint: pulse an unfound difference on both panels. */
  function useHint() {
    if (state.screen !== SCREEN_PLAY) return false;
    if (state.hintsLeft <= 0) return false;
    const current = round();
    const remaining = current.diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return false;
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - SCORE_HINT_COST);
    state.hintPulse = { id: target.id, x: target.x, y: target.y, r: target.r, until: performance.now() + HINT_PULSE_SECONDS * 1000 };
    soundHint();
    return true;
  }

  function nextRound() {
    if (state.screen === SCREEN_ROUND_CLEAR) startRound(state.roundIndex + 1);
  }

  function retryRound() {
    if (state.screen === SCREEN_TIME_UP) startRound(state.roundIndex);
  }

  function togglePause() {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
    else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
  }

  function backToTitle() {
    state.screen = SCREEN_TITLE;
    state.roundIndex = 0;
    state.found = new Set();
    state.timeLeft = ROUNDS[0].timeLimit;
    paintPanels();
  }

  /** Advance the timer and expire transient effects. Called with fixed steps. */
  function tick(dt) {
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        timeUp();
      }
    }
    const now = performance.now();
    state.floaters = state.floaters.filter((f) => now - f.born < f.life);
    if (state.wrongFlash && now - state.wrongFlash.born > 450) state.wrongFlash = null;
    if (state.foundPop && now - state.foundPop.born > 500) state.foundPop = null;
    if (state.hintPulse && now > state.hintPulse.until) state.hintPulse = null;
  }

  /** The difference at a panel point, if any is still unfound there (for tests). */
  function diffAt(x, y) {
    const current = round();
    for (const diff of current.diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) return diff;
    }
    return null;
  }

  paintPanels();

  return {
    state,
    round,
    startGame,
    startRound,
    clickPanel,
    useHint,
    nextRound,
    retryRound,
    togglePause,
    backToTitle,
    tick,
    diffAt,
    foundCount() {
      return state.found.size;
    },
    remainingCount() {
      return round().diffs.length - state.found.size;
    },
    totalRounds() {
      return ROUNDS.length;
    },
  };
}
