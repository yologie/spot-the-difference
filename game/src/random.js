// A small seeded random number generator (xorshift32 with a Weyl add): the same seed
// gives the same scene shuffle, which is what makes the screenshot scenes repeatable.

export function createRandom(seed) {
  let state = (seed | 0) || 0x9e3779b9;
  let weyl = 0;
  return function random() {
    weyl = (weyl + 0x9e3779b9) | 0;
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const mixed = (state + weyl) | 0;
    return ((mixed >>> 0) % 1000000) / 1000000;
  };
}

/** Pick one item from an array with the seeded generator. */
export function pickOne(random, items) {
  return items[Math.floor(random() * items.length)];
}

/** A fresh array with the same items in a shuffled order (Fisher-Yates, seeded). */
export function shuffled(random, items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
