// Boot and the one loop: the world advances in fixed 1/60 s steps (several in a
// slow frame, none in a fast one), and the renderer paints what is there. The game
// moves between six screens: title, play, paused, round clear, win and time up.
//
// ?seed=N fixes the scene shuffle. ?shot=start|play|near|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot. ?selftest=1 plays the real input path once
// (a click on a difference, a click on empty space, a hint, a pause) and writes
// the results into window.__selftest for the runner to read.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createGame, SCREEN_TITLE } from './game.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const selftest = params.get('selftest') === '1';
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const random = createRandom(seed);
void random;

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

// Screen readers (and anyone watching the page's text) hear the screen changes and each find.
function announce(message) {
  status.textContent = message;
}

game.state.best = readBest();
const input = createInput(canvas, game, announce);

function runShot(name) {
  const scene = stageShot(name, game);
  void scene;
  let painted = 0;
  function paint() {
    renderer.draw(game);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runSelftest() {
  const results = [];
  function check(label, ok) {
    results.push(`${label}:${ok ? 'PASS' : 'FAIL'}`);
  }
  game.startGame();
  const round = game.round();
  const first = round.diffs[0];
  const before = game.state.score;
  // A real pointer event on the canvas, through the same input path a player uses.
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  const ox = (window.innerWidth - 1280 * scale) / 2;
  const oy = (window.innerHeight - 720 * scale) / 2;
  function pointerAt(logicalX, logicalY) {
    canvas.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: ox + logicalX * scale,
      clientY: oy + logicalY * scale,
      bubbles: true,
    }));
  }
  pointerAt(72 + first.x, 88 + first.y);
  check('click-finds-difference', game.state.found.has(first.id) && game.state.score === before + 100);
  const timeBefore = game.state.timeLeft;
  pointerAt(72 + 300, 88 + 210);
  check('click-empty-costs-time', game.state.timeLeft < timeBefore);
  const hintsBefore = game.state.hintsLeft;
  pointerAt(72 + 85, 600 + 28);
  check('hint-button-spends-hint', game.state.hintsLeft === hintsBefore - 1 && game.state.hintPulse !== null);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
  check('p-pauses', game.state.screen === 'paused');
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
  check('p-resumes', game.state.screen === 'play');
  game.state.timeLeft = 0.01;
  game.tick(0.05);
  check('timeout-ends-round', game.state.screen === 'timeUp');
  window.__selftest = results.join(' ');
  // Also into the DOM, so a headless dump can read it.
  status.textContent = `SELFTEST ${results.join(' ')}`;
  window.__shotReady = true;
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    while (accumulator >= STEP) {
      game.tick(STEP);
      accumulator -= STEP;
    }
    renderer.draw(game);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state.screen === 'play') {
      game.togglePause();
      announce('Paused.');
    }
  });

  // The best score is saved when a win screen is reached.
  const saveOnWin = setInterval(() => {
    if (game.state.screen === 'win' && game.state.best < game.state.score) {
      game.state.best = game.state.score;
      saveBest(game.state.best);
    }
  }, 500);
  void saveOnWin;

  announce('Whisker Cafe. Find the differences. Click anywhere to start.');
  requestAnimationFrame(frame);
}

if (selftest) runSelftest();
else if (shot) runShot(shot);
else runGame();
