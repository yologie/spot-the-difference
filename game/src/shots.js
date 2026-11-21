// The screenshot scenes behind ?shot=start|play|near|end. Each one plays the real
// game forward from a fresh start and leaves it in a frame a player would really
// see, so the same seed always gives the same frame:
//   start — the title screen over round 1, nothing found yet.
//   play  — round 2 mid-play: 3 of 7 found, markers on both panels, 4 still hidden.
//   near  — round 3 nearly done: 9 of 10 found, one difference left, clock running.
//   end   — the win screen after all three rounds, final score shown.

import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN } from './game.js';

// Click a difference's centre: hit-testing works in panel coordinates, so the
// same call marks it on both panels whichever side the player picked.
function clickDiff(game, diff) {
  game.clickPanel(diff.x, diff.y);
}

export function stageShot(name, game) {
  const round1 = game.round();
  void round1;
  if (name === 'play') {
    game.startGame();
    game.startRound(1);
    const diffs = game.round().diffs;
    clickDiff(game, diffs[0]);
    clickDiff(game, diffs[3]);
    clickDiff(game, diffs[5]);
    game.state.timeLeft = 41;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'near') {
    game.startGame();
    game.startRound(2);
    const diffs = game.round().diffs;
    for (let i = 0; i < diffs.length - 1; i += 1) clickDiff(game, diffs[i]);
    game.state.timeLeft = 23;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'end') {
    game.startGame();
    for (let r = 0; r < game.totalRounds(); r += 1) {
      const diffs = game.round().diffs;
      for (const diff of diffs) clickDiff(game, diff);
      if (game.state.screen === 'roundClear') game.nextRound();
    }
    game.state.best = game.state.score;
    return { screen: SCREEN_WIN };
  }
  // start (and anything else): title screen over round 1, panels untouched.
  game.backToTitle();
  return { screen: SCREEN_TITLE };
}
