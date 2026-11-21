// The three scenes, drawn entirely in code: no images, no downloads. Each scene is a
// function that paints one 560x420 panel; it takes the set of difference ids to apply,
// so the left panel is drawn with an empty set and the right panel with all of them.
// A difference is always one small, fair change: a colour, a missing item, a flipped
// direction, a hand on a clock. Every difference also names its hit zone (x, y, r) in
// panel coordinates, which the game uses for clicks, hints and markers.

function circle(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function ellipse(g, x, y, rx, ry, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function rect(g, x, y, w, h, fill) {
  g.fillStyle = fill;
  g.fillRect(x, y, w, h);
}

function rr(g, x, y, w, h, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}

function line(g, x1, y1, x2, y2, width, stroke) {
  g.strokeStyle = stroke;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
}

function poly(g, points, fill) {
  g.fillStyle = fill;
  g.beginPath();
  g.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) g.lineTo(points[i][0], points[i][1]);
  g.closePath();
  g.fill();
}

function star(g, x, y, r, fill) {
  g.fillStyle = fill;
  g.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(ang) * rad;
    const py = y + Math.sin(ang) * rad;
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
}

/* ------------------------------------------------------------------ */
/* Round 1 — Cat Café Morning: 5 differences, 90 seconds.             */
/* ------------------------------------------------------------------ */

function drawCafe(g, applied) {
  const has = (id) => applied.has(id);
  // Wall, floor and bunting.
  rect(g, 0, 0, 560, 300, '#f7e8c9');
  rect(g, 0, 300, 560, 120, '#c89b6a');
  rect(g, 0, 292, 560, 8, '#a87c4f');
  for (let i = 0; i < 8; i += 1) {
    const x = 20 + i * 68;
    poly(g, [[x, 14], [x + 26, 14], [x + 13, 36]], ['#e86a6a', '#f2c94c', '#7ed957', '#6ab7ff'][i % 4]);
  }
  // Window with the sun.
  rr(g, 36, 36, 148, 164, 8, '#8a5a2b');
  rect(g, 46, 46, 128, 144, '#aee2ff');
  line(g, 110, 46, 110, 190, 4, '#8a5a2b');
  line(g, 46, 118, 174, 118, 4, '#8a5a2b');
  if (has('sunrays')) {
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI / 4) * i;
      line(g, 148 + Math.cos(a) * 24, 76 + Math.sin(a) * 24, 148 + Math.cos(a) * 34, 76 + Math.sin(a) * 34, 3, '#f2a541');
    }
  }
  circle(g, 148, 76, 20, '#ffd94d');
  ellipse(g, 76, 70, 18, 9, '#ffffff');
  ellipse(g, 140, 160, 20, 10, '#ffffff');
  // Framed fish painting.
  rr(g, 216, 40, 108, 104, 6, '#b8862e');
  rect(g, 224, 48, 92, 88, '#dfeef5');
  ellipse(g, 270, 92, 30, 18, '#ff8c42');
  poly(g, has('fish') ? [[298, 92], [314, 80], [314, 104]] : [[242, 92], [226, 80], [226, 104]], '#ff8c42');
  circle(g, has('fish') ? 282 : 258, 88, 3, '#222222');
  line(g, 270, 60, 270, 76, 3, '#5b8c5a');
  line(g, 252, 62, 262, 74, 3, '#5b8c5a');
  line(g, 288, 62, 278, 74, 3, '#5b8c5a');
  // Shelf with three cups.
  rect(g, 356, 92, 188, 10, '#8a5a2b');
  const cups = ['#e86a6a', has('cup') ? '#e8c832' : '#4a7ec2', '#4caf7d'];
  cups.forEach((color, i) => {
    const cx = 386 + i * 56;
    rr(g, cx, 62, 34, 30, 5, color);
    g.strokeStyle = color;
    g.lineWidth = 4;
    g.beginPath();
    g.arc(cx + 36, 76, 8, -Math.PI / 2, Math.PI / 2);
    g.stroke();
  });
  // Wall clock: 9:00 or 3:00.
  circle(g, 500, 196, 28, '#ffffff');
  g.strokeStyle = '#333333';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(500, 196, 28, 0, Math.PI * 2);
  g.stroke();
  line(g, 500, 196, 500, 176, 3, '#333333');
  line(g, 500, 196, has('clock') ? 518 : 482, 196, 3, '#333333');
  circle(g, 500, 196, 3, '#333333');
  // Rug and the cat.
  ellipse(g, 280, 386, 150, 26, '#e8a0b4');
  ellipse(g, 280, 386, 110, 18, '#f2c4d0');
  // Tail.
  g.strokeStyle = '#f59e42';
  g.lineWidth = 14;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(330, 372);
  g.quadraticCurveTo(380, 360, 372, 320);
  g.stroke();
  // Body and head.
  ellipse(g, 280, 340, 62, 52, '#f59e42');
  circle(g, 280, 262, 44, '#f59e42');
  poly(g, [[244, 232], [254, 196], [272, 226]], '#f59e42');
  poly(g, [[316, 232], [306, 196], [288, 226]], '#f59e42');
  poly(g, [[250, 226], [256, 204], [266, 222]], '#f7c489');
  poly(g, [[310, 226], [304, 204], [294, 222]], '#f7c489');
  circle(g, 264, 256, 5, '#222222');
  circle(g, 296, 256, 5, '#222222');
  poly(g, [[276, 272], [284, 272], [280, 278]], '#d95f6e');
  line(g, 244, 272, 266, 274, 2, '#8a5a2b');
  line(g, 316, 272, 294, 274, 2, '#8a5a2b');
  // Bow: red or teal.
  const bowColor = has('bow') ? '#2aa8a0' : '#d94f4f';
  poly(g, [[280, 302], [258, 290], [258, 314]], bowColor);
  poly(g, [[280, 302], [302, 290], [302, 314]], bowColor);
  circle(g, 280, 302, 7, bowColor);
  // Potted plant.
  poly(g, [[470, 340], [530, 340], [522, 392], [478, 392]], '#c96f4a');
  line(g, 500, 340, 500, 286, 5, '#3e7d3a');
  line(g, 500, 312, 470, 282, 5, '#3e7d3a');
  line(g, 500, 312, 530, 282, 5, '#3e7d3a');
  ellipse(g, 468, 278, 16, 9, '#4caf7d');
  ellipse(g, 532, 278, 16, 9, '#4caf7d');
  ellipse(g, 500, 272, 17, 10, '#57b96a');
  // Coffee cup on the floor.
  ellipse(g, 150, 372, 34, 10, '#ffffff');
  rr(g, 132, 338, 36, 32, 6, '#ffffff');
  g.strokeStyle = '#ffffff';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(170, 352, 9, -Math.PI / 2, Math.PI / 2);
  g.stroke();
  line(g, 146, 334, 142, 322, 3, '#bbbbbb');
  line(g, 156, 334, 156, 320, 3, '#bbbbbb');
}

/* ------------------------------------------------------------------ */
/* Round 2 — Night Museum: 7 differences, 75 seconds.                 */
/* ------------------------------------------------------------------ */

function drawMuseum(g, applied) {
  const has = (id) => applied.has(id);
  // Wall and checkered floor.
  rect(g, 0, 0, 560, 320, '#1c2440');
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const odd = (row + col) % 2 === 0;
      let fill = odd ? '#2c3454' : '#232a45';
      if (row === 1 && col === 5 && has('tile')) fill = '#7a3b4f';
      rect(g, col * 70, 320 + row * 50, 70, 50, fill);
    }
  }
  // Window with moon and stars.
  rr(g, 46, 36, 140, 140, 8, '#0e1330');
  rect(g, 56, 46, 120, 120, '#101838');
  star(g, 80, 70, 7, '#ffe9a8');
  if (!has('star')) star(g, 150, 62, 6, '#ffe9a8');
  star(g, 168, 110, 5, '#ffe9a8');
  star(g, 96, 140, 5, '#ffe9a8');
  if (has('moon')) {
    circle(g, 126, 108, 24, '#f5f0dc');
    circle(g, 134, 102, 20, '#101838');
  } else {
    circle(g, 126, 108, 24, '#f5f0dc');
    circle(g, 118, 100, 4, '#d8d2b8');
    circle(g, 134, 114, 3, '#d8d2b8');
  }
  // Chandelier: five candles, or four flames.
  line(g, 285, 0, 285, 26, 4, '#8a6d4b');
  ellipse(g, 285, 66, 52, 10, '#b8862e');
  for (let i = 0; i < 5; i += 1) {
    const cx = 247 + i * 19;
    rect(g, cx - 3, 34, 6, 26, '#f5f0dc');
    if (!(has('chandelier') && i === 4)) {
      ellipse(g, cx, 28, 4, 7, '#ffb347');
    }
  }
  // Dinosaur skeleton.
  const bone = '#e8e0c8';
  circle(g, 216, 208, 20, bone);
  poly(g, [[232, 200], [252, 206], [232, 218]], bone);
  circle(g, 210, 202, 3, '#222222');
  for (let i = 0; i < 7; i += 1) circle(g, 240 + i * 20, 210, 8, bone);
  for (let i = 0; i < 5; i += 1) line(g, 252 + i * 20, 216, 252 + i * 20, 246, 4, bone);
  line(g, 258, 214, 250, 316, 7, bone);
  line(g, 316, 214, 326, 316, 7, bone);
  line(g, 250, 316, 268, 316, 6, bone);
  line(g, 326, 316, 308, 316, 6, bone);
  // Tail: full or missing its tip.
  poly(g, [[372, 206], [408, 196], [404, 216]], bone);
  if (!has('tail')) poly(g, [[404, 198], [428, 192], [424, 212]], bone);
  // Portrait with a moustache (or without).
  rr(g, 428, 44, 104, 128, 6, '#b8862e');
  rect(g, 436, 52, 88, 112, '#3d5a80');
  circle(g, 480, 100, 24, '#e8b88a');
  ellipse(g, 480, 152, 34, 16, '#2c3454');
  circle(g, 470, 96, 3, '#222222');
  circle(g, 490, 96, 3, '#222222');
  if (!has('moustache')) {
    ellipse(g, 480, 112, 14, 4, '#3a2a1a');
  }
  // Pedestal and vase.
  rr(g, 82, 300, 84, 92, 4, '#3a4266');
  rr(g, 74, 292, 100, 10, 4, '#4a5480');
  const vaseColor = has('vase') ? '#57b96a' : '#4a7ec2';
  ellipse(g, 124, 262, 26, 34, vaseColor);
  rr(g, 112, 218, 24, 14, vaseColor);
  line(g, 124, 218, 124, 196, 3, '#3e7d3a');
  ellipse(g, 124, 192, 12, 7, '#4caf7d');
  // Rope barrier in front of the skeleton.
  line(g, 210, 330, 210, 360, 5, '#8a6d4b');
  line(g, 372, 330, 372, 360, 5, '#8a6d4b');
  g.strokeStyle = '#c94f4f';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(210, 336);
  g.quadraticCurveTo(291, 356, 372, 336);
  g.stroke();
}

/* ------------------------------------------------------------------ */
/* Round 3 — Beach Sunset: 10 differences, 60 seconds.                */
/* ------------------------------------------------------------------ */

function drawBeach(g, applied) {
  const has = (id) => applied.has(id);
  // Sunset sky, sea and sand.
  const sky = g.createLinearGradient(0, 0, 0, 200);
  sky.addColorStop(0, '#ff9a56');
  sky.addColorStop(1, '#ff6b9d');
  rect(g, 0, 0, 560, 200, '#ff9a56');
  g.fillStyle = sky;
  g.fillRect(0, 0, 560, 200);
  rect(g, 0, 200, 560, 90, '#3d7ea6');
  rect(g, 0, 290, 560, 130, '#f2d8a0');
  // Sun, with or without rays.
  if (has('sunrays')) {
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI / 4) * i;
      line(g, 420 + Math.cos(a) * 42, 120 + Math.sin(a) * 42, 420 + Math.cos(a) * 54, 120 + Math.sin(a) * 54, 4, '#ffd94d');
    }
  }
  circle(g, 420, 120, 34, '#ffd94d');
  // Clouds: the middle one may be gone.
  ellipse(g, 90, 60, 34, 14, '#ffffff');
  ellipse(g, 112, 52, 26, 12, '#ffffff');
  if (!has('cloud')) {
    ellipse(g, 200, 74, 32, 13, '#ffffff');
    ellipse(g, 220, 66, 24, 11, '#ffffff');
  }
  ellipse(g, 500, 52, 30, 12, '#ffffff');
  // Seagulls: one may be gone.
  line(g, 268, 50, 280, 42, 3, '#333333');
  line(g, 280, 42, 292, 50, 3, '#333333');
  if (!has('gull')) {
    line(g, 308, 62, 320, 54, 3, '#333333');
    line(g, 320, 54, 332, 62, 3, '#333333');
  }
  line(g, 348, 40, 360, 32, 3, '#333333');
  line(g, 360, 32, 372, 40, 3, '#333333');
  // Waves.
  line(g, 40, 226, 120, 226, 3, '#bfe3f2');
  line(g, 180, 252, 260, 252, 3, '#bfe3f2');
  line(g, 400, 238, 500, 238, 3, '#bfe3f2');
  // Boat: sail or no sail.
  poly(g, [[306, 196], [384, 196], [372, 216], [318, 216]], '#8a5a2b');
  line(g, 345, 196, 345, 150, 4, '#5a3a1a');
  if (!has('sail')) poly(g, [[345, 152], [345, 194], [378, 194]], '#ffffff');
  // Palm tree with coconuts: three or two.
  g.strokeStyle = '#8a5a2b';
  g.lineWidth = 16;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(84, 330);
  g.quadraticCurveTo(70, 220, 96, 130);
  g.stroke();
  g.strokeStyle = '#2f9e44';
  g.lineWidth = 8;
  const fronds = [[96, 130, 40, 96], [96, 130, 150, 96], [96, 130, 60, 170], [96, 130, 150, 160], [96, 130, 100, 84]];
  fronds.forEach(([x1, y1, x2, y2]) => {
    g.beginPath();
    g.moveTo(x1, y1);
    g.quadraticCurveTo((x1 + x2) / 2, y1 - 18, x2, y2);
    g.stroke();
  });
  circle(g, 88, 138, 8, '#6b4226');
  circle(g, 104, 142, 8, '#6b4226');
  if (!has('coconuts')) circle(g, 96, 152, 8, '#6b4226');
  // Umbrella: red stripes or blue stripes.
  const stripe = has('umbrella') ? '#4a7ec2' : '#e86a6a';
  line(g, 470, 240, 470, 330, 5, '#8a5a2b');
  for (let i = 0; i < 6; i += 1) {
    poly(g, [[470, 240], [410 + i * 20, 268], [430 + i * 20, 268]], i % 2 === 0 ? stripe : '#ffffff');
  }
  // Bucket: red or yellow.
  const bucketColor = has('bucket') ? '#e8c832' : '#e86a6a';
  poly(g, [[232, 322], [268, 322], [262, 356], [238, 356]], bucketColor);
  rr(g, 228, 316, 44, 8, bucketColor);
  // Crab: three legs a side, or two.
  ellipse(g, 150, 352, 24, 16, '#ff6b4a');
  circle(g, 132, 340, 8, '#ff6b4a');
  circle(g, 168, 340, 8, '#ff6b4a');
  circle(g, 140, 344, 3, '#222222');
  circle(g, 160, 344, 3, '#222222');
  const legs = has('crablegs') ? [0, 1] : [0, 1, 2];
  legs.forEach((i) => {
    line(g, 130, 356 + i * 5, 112, 360 + i * 6, 3, '#ff6b4a');
    line(g, 170, 356 + i * 5, 188, 360 + i * 6, 3, '#ff6b4a');
  });
  // Shells: one may be missing.
  ellipse(g, 320, 372, 12, 8, '#ffb3c1');
  ellipse(g, 388, 388, 12, 8, '#c1a3ff');
  if (!has('shell')) ellipse(g, 350, 372, 12, 8, '#ffffff');
  // Starfish: present or gone.
  if (!has('starfish')) star(g, 480, 362, 16, '#ff8c42');
  // Footprints in the sand.
  ellipse(g, 210, 396, 8, 5, '#d9b878');
  ellipse(g, 232, 404, 8, 5, '#d9b878');
  ellipse(g, 254, 396, 8, 5, '#d9b878');
}

/* ------------------------------------------------------------------ */
/* The rounds table.                                                   */
/* ------------------------------------------------------------------ */

export const ROUNDS = [
  {
    id: 'cafe',
    name: 'Round 1 — Cat Café Morning',
    subtitle: 'Five things changed while the cat blinked.',
    timeLimit: 90,
    draw: drawCafe,
    diffs: [
      { id: 'sunrays', name: 'Sun rays', x: 148, y: 76, r: 30 },
      { id: 'cup', name: 'Middle cup', x: 414, y: 76, r: 22 },
      { id: 'fish', name: 'Fish direction', x: 270, y: 92, r: 32 },
      { id: 'clock', name: 'Clock hands', x: 500, y: 196, r: 32 },
      { id: 'bow', name: 'Cat bow', x: 280, y: 302, r: 26 },
    ],
  },
  {
    id: 'museum',
    name: 'Round 2 — Night Museum',
    subtitle: 'Seven things moved after closing time.',
    timeLimit: 75,
    draw: drawMuseum,
    diffs: [
      { id: 'moon', name: 'Moon phase', x: 126, y: 108, r: 30 },
      { id: 'star', name: 'Missing star', x: 150, y: 62, r: 18 },
      { id: 'tail', name: 'Dino tail tip', x: 410, y: 202, r: 26 },
      { id: 'moustache', name: 'Moustache', x: 480, y: 112, r: 24 },
      { id: 'vase', name: 'Vase colour', x: 124, y: 262, r: 26 },
      { id: 'chandelier', name: 'Chandelier flame', x: 285, y: 55, r: 36 },
      { id: 'tile', name: 'Floor tile', x: 385, y: 370, r: 32 },
    ],
  },
  {
    id: 'beach',
    name: 'Round 3 — Beach Sunset',
    subtitle: 'Ten things drifted with the tide.',
    timeLimit: 60,
    draw: drawBeach,
    diffs: [
      { id: 'sunrays', name: 'Sun rays', x: 420, y: 120, r: 38 },
      { id: 'cloud', name: 'Missing cloud', x: 206, y: 70, r: 28 },
      { id: 'coconuts', name: 'Coconuts', x: 96, y: 144, r: 24 },
      { id: 'umbrella', name: 'Umbrella stripes', x: 470, y: 252, r: 34 },
      { id: 'bucket', name: 'Bucket colour', x: 250, y: 338, r: 26 },
      { id: 'crablegs', name: 'Crab legs', x: 150, y: 360, r: 28 },
      { id: 'sail', name: 'Boat sail', x: 356, y: 172, r: 28 },
      { id: 'shell', name: 'Missing shell', x: 350, y: 372, r: 20 },
      { id: 'gull', name: 'Missing gull', x: 320, y: 58, r: 22 },
      { id: 'starfish', name: 'Starfish', x: 480, y: 362, r: 22 },
    ],
  },
];

/** Paint one panel of a round into a 560x420 context. `applied` is the set of
 *  difference ids rendered in their changed form (empty for the left panel,
 *  all of them for the right panel). */
export function paintPanel(g, round, applied) {
  g.save();
  g.clearRect(0, 0, 560, 420);
  round.draw(g, applied);
  g.restore();
}
