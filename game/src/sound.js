// Sounds, synthesized with WebAudio: no audio files, no network. Every sound is a
// short oscillator blip (or a tiny run of them), started on a user gesture so the
// browser's autoplay rules never block it.

let context = null;
let muted = false;

function audio() {
  if (context === null) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

/** One blip: a sine/triangle note that fades out. */
function blip(freq, seconds, type, when, loud) {
  const ctx = audio();
  if (ctx === null || muted) return;
  const start = ctx.currentTime + (when ?? 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type ?? 'sine';
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(loud ?? 0.22, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + seconds + 0.05);
}

/** The satisfying two-note chime when a difference is found. */
export function soundFound() {
  blip(659.25, 0.16, 'sine', 0, 0.26);
  blip(987.77, 0.28, 'sine', 0.09, 0.26);
}

/** A soft low buzz when a click lands on nothing. */
export function soundWrong() {
  blip(110, 0.18, 'square', 0, 0.1);
  blip(98, 0.2, 'square', 0.05, 0.08);
}

/** The gentle ping when a hint is spent. */
export function soundHint() {
  blip(1174.66, 0.14, 'triangle', 0, 0.16);
  blip(1567.98, 0.2, 'triangle', 0.07, 0.14);
}

/** A bright triad when a round is cleared. */
export function soundRoundClear() {
  blip(523.25, 0.18, 'sine', 0, 0.24);
  blip(659.25, 0.18, 'sine', 0.1, 0.24);
  blip(783.99, 0.3, 'sine', 0.2, 0.24);
}

/** A little arpeggio when the whole game is won. */
export function soundWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, index) => blip(freq, 0.32, 'sine', index * 0.11, 0.22));
}

/** The dull tick when the timer runs out. */
export function soundTimeout() {
  blip(220, 0.3, 'sawtooth', 0, 0.12);
  blip(174.61, 0.45, 'sawtooth', 0.18, 0.12);
}

/** A single tick when a button is pressed. */
export function soundTick() {
  blip(880, 0.06, 'triangle', 0, 0.12);
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
