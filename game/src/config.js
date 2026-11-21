// Whisker Cafe — Spot the Difference: every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the window,
// so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

// The two picture panels, in logical coordinates. Each panel is 560x420; the scenes
// are drawn into offscreen canvases of exactly this size, so a hit zone in a scene
// is also a hit zone on screen (offset by the panel's origin).
export const PANEL = { width: 560, height: 420, gap: 16, top: 88 };
export const PANEL_LEFT = { x: 72, y: PANEL.top };
export const PANEL_RIGHT = { x: 72 + PANEL.width + PANEL.gap, y: PANEL.top };

export const HUD = { height: 72 };
export const FOOTER = { top: 528, height: 192 };

// Hint button and pause button, in logical coordinates (bottom strip).
export const HINT_BUTTON = { x: 72, y: 600, width: 170, height: 56 };
export const PAUSE_BUTTON = { x: 1038, y: 600, width: 170, height: 56 };

// Scoring and timing.
export const SCORE_FIND = 100;
export const SCORE_HINT_COST = 25;
export const SCORE_ROUND_BONUS_PER_SECOND = 10;
export const WRONG_CLICK_TIME_PENALTY = 3;
export const HINTS_PER_ROUND = 3;
export const HINT_PULSE_SECONDS = 1.4;

// The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate.
export const STEP = 1 / 60;

export const PALETTE = {
  backdrop: '#1d1420',
  backdropTop: '#2a1a2e',
  panelFrame: '#f5e6c8',
  panelFrameShadow: '#8a6d4b',
  hudText: '#fff6e0',
  hudMuted: '#c9b8a3',
  accent: '#ffb347',
  accentDark: '#e08a1e',
  good: '#7ed957',
  bad: '#ff5a5a',
  timerFull: '#7ed957',
  timerLow: '#ff5a5a',
  button: '#4a2f5a',
  buttonEdge: '#ffb347',
  overlay: 'rgba(20, 10, 24, 0.82)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'whisker-cafe.best';

/** Query params the page understands: ?seed=N fixes the scene shuffle, ?shot=... stages a scene. */
export const SHOT_NAMES = ['start', 'play', 'near', 'end'];
