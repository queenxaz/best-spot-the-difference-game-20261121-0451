// Original scene art, drawn on canvas with code — no images.
// Each scene is drawn twice: the left panel with no differences applied and the
// right panel with every difference applied. A difference is a small local change
// (a colour, a missing object, one extra item) at a fixed spot, listed with its
// position so clicks and the keyboard cursor can find it.
//
// Scene space is 560x420. `changed` is a Set of difference ids to render in the
// altered state; an empty set renders the original picture.
const W = 560;
const H = 420;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function text(ctx, str, x, y, size, fill, font = 'bold') {
  ctx.fillStyle = fill;
  ctx.font = `${font} ${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// ---------------------------------------------------------------------------
// Scene 1 — Lantern Lane, a night market at dusk.
// ---------------------------------------------------------------------------
export const SCENE1_DIFFS = [
  { id: 'moon', x: 468, y: 62, r: 30, label: 'the moon' },
  { id: 'star', x: 96, y: 44, r: 16, label: 'a star' },
  { id: 'bulb', x: 280, y: 96, r: 14, label: 'a lantern bulb' },
  { id: 'awning', x: 150, y: 168, r: 26, label: 'the awning stripe' },
  { id: 'buns', x: 430, y: 300, r: 26, label: 'a steamed bun' },
  { id: 'cat', x: 318, y: 352, r: 26, label: 'the cat' },
  { id: 'sign', x: 150, y: 236, r: 26, label: 'the stall sign' },
];

export function drawScene1(ctx, changed) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.55, '#7a4a6e');
  sky.addColorStop(1, '#e08a4e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Stars (one extra appears in the changed picture).
  [[60, 30], [180, 52], [330, 28], [520, 110], [40, 90]].forEach(([x, y]) => star(ctx, x, y, 6, '#ffe9a8'));
  if (changed.has('star')) star(ctx, 96, 44, 7, '#ffe9a8');
  // Moon: full in the original, crescent in the changed picture.
  circle(ctx, 468, 62, 26, '#fdf3c4');
  circle(ctx, 458, 58, 5, '#e8d28a');
  circle(ctx, 478, 70, 4, '#e8d28a');
  if (changed.has('moon')) {
    circle(ctx, 482, 54, 24, '#2b2350');
  }
  // Rooftops along the bottom.
  poly(ctx, [[0, 420], [0, 330], [90, 300], [180, 330], [180, 420]], '#3a2f52');
  poly(ctx, [[380, 420], [380, 320], [470, 292], [560, 320], [560, 420]], '#332a4a');
  // String of lantern bulbs across the top.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 78);
  ctx.quadraticCurveTo(280, 128, 560, 78);
  ctx.stroke();
  const bulbXs = [40, 120, 200, 280, 360, 440, 520];
  bulbXs.forEach((x) => {
    const y = 78 + Math.sin((x / W) * Math.PI) * 34;
    const isDiff = x === 280;
    circle(ctx, x, y + 8, 9, isDiff && changed.has('bulb') ? '#37c8a3' : '#ff5a4e');
    circle(ctx, x, y + 8, 4, '#ffe9a8');
  });
  // Left stall: striped awning, counter, jars, hanging sign.
  poly(ctx, [[48, 150], [252, 150], [236, 196], [64, 196]], '#c94f43');
  for (let i = 0; i < 5; i += 1) {
    const x0 = 48 + i * 41;
    const stripe = i === 2 && changed.has('awning') ? '#5aa864' : '#f6e3c2';
    poly(ctx, [[x0, 150], [x0 + 41, 150], [x0 + 36, 196], [x0 + 5, 196]], stripe);
  }
  rect(ctx, 56, 196, 188, 10, '#6b4a2f');
  rect(ctx, 62, 206, 176, 96, '#8a5a35');
  rect(ctx, 62, 206, 176, 8, '#a9713f');
  // Jars on the counter.
  [[84, 262], [120, 262], [156, 262]].forEach(([x, y]) => {
    ellipse(ctx, x, y, 15, 22, '#f2c14e');
    rect(ctx, x - 15, y - 26, 30, 8, '#7a4a2f');
  });
  // Hanging sign: TEA in the original, SOUP in the changed picture.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 196);
  ctx.lineTo(120, 216);
  ctx.moveTo(180, 196);
  ctx.lineTo(180, 216);
  ctx.stroke();
  rect(ctx, 104, 216, 92, 40, '#f6e3c2');
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 3;
  ctx.strokeRect(104, 216, 92, 40);
  text(ctx, changed.has('sign') ? 'SOUP' : 'TEA', 150, 237, 22, '#6b2f2a');
  // Right stall: teal awning, tray of steamed buns.
  poly(ctx, [[320, 150], [520, 150], [504, 196], [336, 196]], '#2f7f7a');
  for (let i = 0; i < 5; i += 1) {
    const x0 = 320 + i * 40;
    poly(ctx, [[x0, 150], [x0 + 40, 150], [x0 + 35, 196], [x0 + 5, 196]], i % 2 ? '#e8f2e0' : '#2f7f7a');
  }
  rect(ctx, 328, 196, 184, 10, '#6b4a2f');
  rect(ctx, 334, 206, 172, 96, '#7a5a35');
  rect(ctx, 334, 206, 172, 8, '#96703f');
  // Buns: three in the original, four in the changed picture.
  const bunXs = [380, 420, 460];
  if (changed.has('buns')) bunXs.push(496);
  bunXs.forEach((x) => {
    circle(ctx, x, 292, 15, '#f7ead0');
    ctx.beginPath();
    ctx.arc(x, 292, 8, Math.PI, 0);
    ctx.strokeStyle = '#d9b98a';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ellipse(ctx, 440, 308, 76, 8, '#c9a86a');
  // Paper lantern hanging at the right edge.
  circle(ctx, 532, 240, 16, '#ff8a3d');
  ctx.fillStyle = '#7a2f1d';
  ctx.fillRect(528, 222, 8, 6);
  ctx.fillRect(528, 252, 8, 6);
  // Cat on a crate between the stalls (absent in the changed picture).
  if (!changed.has('cat')) {
    rect(ctx, 296, 372, 46, 30, '#9a6a3f');
    ctx.strokeStyle = '#7a4f2a';
    ctx.lineWidth = 2;
    ctx.strokeRect(296, 372, 46, 30);
    ellipse(ctx, 318, 360, 20, 14, '#3a3a3a');
    circle(ctx, 318, 342, 12, '#3a3a3a');
    poly(ctx, [[308, 334], [312, 322], [317, 333]], '#3a3a3a');
    poly(ctx, [[320, 333], [325, 322], [328, 334]], '#3a3a3a');
    circle(ctx, 338, 356, 3, '#ffd166');
  }
  // Cobblestones.
  ctx.fillStyle = '#4a3a5e';
  for (let i = 0; i < 9; i += 1) ellipse(ctx, 30 + i * 62, 408, 18, 5, '#4a3a5e');
}

// ---------------------------------------------------------------------------
// Scene 2 — Firefly Garden, a sunny walled garden with a pond.
// ---------------------------------------------------------------------------
export const SCENE2_DIFFS = [
  { id: 'sun', x: 78, y: 58, r: 30, label: 'a sun ray' },
  { id: 'bird', x: 452, y: 96, r: 22, label: 'the bird' },
  { id: 'lily', x: 386, y: 330, r: 22, label: 'the lily flower' },
  { id: 'frog', x: 176, y: 336, r: 24, label: 'the frog' },
  { id: 'flower', x: 96, y: 268, r: 20, label: 'a flower' },
  { id: 'butterfly', x: 300, y: 150, r: 24, label: 'the butterfly' },
  { id: 'can', x: 512, y: 372, r: 24, label: 'the watering can' },
  { id: 'fence', x: 250, y: 210, r: 20, label: 'a fence post' },
];

export function drawScene2(ctx, changed) {
  // Sky and sun (seven rays in the original, six in the changed picture).
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#aee3f5');
  sky.addColorStop(1, '#e8f7c9');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  const rayCount = changed.has('sun') ? 6 : 7;
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 5;
  for (let i = 0; i < rayCount; i += 1) {
    const a = (i / 7) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(78 + Math.cos(a) * 34, 58 + Math.sin(a) * 34);
    ctx.lineTo(78 + Math.cos(a) * 50, 58 + Math.sin(a) * 50);
    ctx.stroke();
  }
  circle(ctx, 78, 58, 28, '#ffd94d');
  // Clouds.
  ellipse(ctx, 220, 60, 44, 16, '#ffffff');
  ellipse(ctx, 250, 52, 30, 14, '#ffffff');
  ellipse(ctx, 420, 40, 38, 13, '#ffffff');
  // Tree on the right.
  rect(ctx, 452, 120, 22, 130, '#7a4f2a');
  circle(ctx, 420, 110, 42, '#4f9e4a');
  circle(ctx, 486, 104, 46, '#5cb85c');
  circle(ctx, 456, 74, 40, '#6fc46a');
  [[428, 128], [470, 138], [446, 96], [492, 122]].forEach(([x, y]) => circle(ctx, x, y, 8, '#e05252'));
  // Bird on a branch (absent in the changed picture).
  if (!changed.has('bird')) {
    ellipse(ctx, 452, 96, 14, 9, '#3d7ac8');
    circle(ctx, 464, 90, 7, '#3d7ac8');
    poly(ctx, [[470, 90], [478, 93], [470, 95]], '#f7a832');
    ctx.beginPath();
    ctx.moveTo(440, 92);
    ctx.quadraticCurveTo(430, 84, 424, 90);
    ctx.strokeStyle = '#3d7ac8';
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  // Fence across the middle (one extra post in the changed picture).
  rect(ctx, 0, 206, W, 10, '#a9713f');
  rect(ctx, 0, 228, W, 8, '#a9713f');
  const postXs = [20, 120, 220, 320, 420, 520];
  if (changed.has('fence')) postXs.splice(3, 0, 270);
  postXs.forEach((x) => rect(ctx, x, 188, 14, 62, '#8a5a35'));
  // Grass.
  rect(ctx, 0, 250, W, 170, '#7cc46a');
  rect(ctx, 0, 250, W, 10, '#93d47e');
  // Flower row: one flower changes colour in the changed picture.
  const flowers = [
    [96, 268, '#e05252'], [150, 282, '#f7a832'], [210, 266, '#e05252'],
    [272, 282, '#b06fd6'], [330, 268, '#e05252'],
  ];
  flowers.forEach(([x, y, col]) => {
    ctx.strokeStyle = '#3f7a37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 26);
    ctx.stroke();
    const petal = x === 96 && changed.has('flower') ? '#b06fd6' : col;
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 6, petal);
    }
    circle(ctx, x, y, 6, '#ffd94d');
  });
  // Butterfly: orange in the original, blue in the changed picture.
  const wing = changed.has('butterfly') ? '#4d8fd6' : '#f78d2e';
  ellipse(ctx, 288, 146, 14, 10, wing);
  ellipse(ctx, 312, 146, 14, 10, wing);
  ellipse(ctx, 290, 158, 10, 7, wing);
  ellipse(ctx, 310, 158, 10, 7, wing);
  rect(ctx, 298, 138, 4, 24, '#3a2f2f');
  // Pond with lily pads.
  ellipse(ctx, 280, 350, 220, 56, '#5fb8d9');
  ellipse(ctx, 280, 344, 200, 44, '#7ccbe6');
  ellipse(ctx, 176, 340, 42, 14, '#4f9e4a');
  ellipse(ctx, 386, 330, 46, 15, '#4f9e4a');
  ellipse(ctx, 300, 368, 36, 12, '#5cb85c');
  // Lily flower on a pad (absent in the changed picture).
  if (!changed.has('lily')) {
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      circle(ctx, 386 + Math.cos(a) * 9, 322 + Math.sin(a) * 9, 6, '#f7a8c8');
    }
    circle(ctx, 386, 322, 5, '#ffd94d');
  }
  // Frog on a pad (absent in the changed picture).
  if (!changed.has('frog')) {
    ellipse(ctx, 176, 330, 20, 13, '#5cb85c');
    circle(ctx, 164, 316, 8, '#5cb85c');
    circle(ctx, 188, 316, 8, '#5cb85c');
    circle(ctx, 164, 314, 3, '#222');
    circle(ctx, 188, 314, 3, '#222');
  }
  // Watering can by the fence (absent in the changed picture).
  if (!changed.has('can')) {
    rect(ctx, 496, 352, 34, 30, '#7a8a99');
    poly(ctx, [[496, 358], [472, 340], [476, 352], [496, 368]], '#7a8a99');
    rect(ctx, 508, 344, 12, 10, '#5a6a79');
    circle(ctx, 472, 338, 3, '#5fb8d9');
    circle(ctx, 478, 332, 2, '#5fb8d9');
  }
}

// ---------------------------------------------------------------------------
// Scene 3 — Harbour Lights, a fishing harbour at dusk.
// ---------------------------------------------------------------------------
export const SCENE3_DIFFS = [
  { id: 'beam', x: 92, y: 96, r: 30, label: 'the lighthouse beam' },
  { id: 'cloud', x: 330, y: 52, r: 24, label: 'a cloud' },
  { id: 'sail', x: 300, y: 190, r: 30, label: 'the sail' },
  { id: 'gull', x: 430, y: 84, r: 20, label: 'a gull' },
  { id: 'flag', x: 92, y: 26, r: 18, label: 'the flag' },
  { id: 'crates', x: 470, y: 356, r: 26, label: 'a crate' },
  { id: 'window', x: 352, y: 268, r: 16, label: 'the cabin window' },
  { id: 'buoy', x: 210, y: 330, r: 20, label: 'the buoy' },
  { id: 'anchor', x: 150, y: 356, r: 24, label: 'the anchor' },
  { id: 'rope', x: 540, y: 388, r: 20, label: 'the rope coil' },
];

export function drawScene3(ctx, changed) {
  // Dusk sky and sea.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#3a3a6e');
  sky.addColorStop(1, '#e08a6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 260);
  rect(ctx, 0, 260, W, 160, '#2f6f8f');
  rect(ctx, 0, 260, W, 8, '#7ccbe6');
  // Clouds (one extra in the changed picture).
  ellipse(ctx, 200, 46, 40, 13, '#d9c9e8');
  ellipse(ctx, 460, 60, 46, 14, '#d9c9e8');
  if (changed.has('cloud')) ellipse(ctx, 330, 52, 34, 12, '#d9c9e8');
  // Gulls: three in the original, two in the changed picture.
  const gulls = [[380, 70], [430, 84], [480, 66]];
  if (changed.has('gull')) gulls.splice(1, 1);
  ctx.strokeStyle = '#2b2350';
  ctx.lineWidth = 3;
  gulls.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x - 8, y, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(x + 8, y, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  });
  // Lighthouse on the left.
  rect(ctx, 66, 60, 52, 200, '#f2ead8');
  rect(ctx, 66, 100, 52, 18, '#c94f43');
  rect(ctx, 66, 160, 52, 18, '#c94f43');
  rect(ctx, 66, 220, 52, 18, '#c94f43');
  rect(ctx, 58, 44, 68, 20, '#3a3a3a');
  circle(ctx, 92, 36, 12, '#ffd94d');
  // Flag on top: red in the original, blue in the changed picture.
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(92, 44);
  ctx.lineTo(92, 14);
  ctx.stroke();
  poly(ctx, [[92, 14], [126, 22], [92, 32]], changed.has('flag') ? '#3d7ac8' : '#c94f43');
  // Beam: shining in the original, off in the changed picture.
  if (!changed.has('beam')) {
    const beam = ctx.createLinearGradient(118, 40, 420, 60);
    beam.addColorStop(0, 'rgba(255, 217, 77, 0.85)');
    beam.addColorStop(1, 'rgba(255, 217, 77, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(118, 32);
    ctx.lineTo(430, 8);
    ctx.lineTo(430, 76);
    ctx.lineTo(118, 48);
    ctx.closePath();
    ctx.fill();
  }
  // Dock.
  rect(ctx, 0, 330, W, 90, '#6b4a2f');
  rect(ctx, 0, 330, W, 10, '#8a5a35');
  for (let x = 20; x < W; x += 60) rect(ctx, x, 344, 8, 66, '#7a4a2f');
  // Fishing boat with a sail: white in the original, striped in the changed picture.
  poly(ctx, [[240, 300], [360, 300], [330, 330], [270, 330]], '#7a3b2e');
  rect(ctx, 316, 262, 44, 38, '#a9713f');
  rect(ctx, 352, 268, 12, 12, changed.has('window') ? '#3a3a3a' : '#ffd94d');
  ctx.strokeStyle = '#3a2f2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(300, 140);
  ctx.stroke();
  if (changed.has('sail')) {
    poly(ctx, [[300, 150], [300, 290], [356, 290]], '#c94f43');
    poly(ctx, [[300, 150], [300, 290], [252, 290]], '#f2ead8');
  } else {
    poly(ctx, [[300, 150], [300, 290], [356, 290]], '#f2ead8');
    poly(ctx, [[300, 150], [300, 290], [252, 290]], '#f2ead8');
  }
  // Buoy: red in the original, yellow in the changed picture.
  circle(ctx, 210, 322, 12, changed.has('buoy') ? '#ffd94d' : '#c94f43');
  rect(ctx, 204, 306, 12, 8, '#3a3a3a');
  ctx.strokeStyle = '#7ccbe6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(210, 322, 20, 0.3, Math.PI - 0.3);
  ctx.stroke();
  // Crates on the dock: three in the original, two in the changed picture.
  const crateXs = [440, 478];
  if (!changed.has('crates')) crateXs.push(516);
  crateXs.forEach((x) => {
    rect(ctx, x, 330, 32, 32, '#c9a86a');
    ctx.strokeStyle = '#8a6a35';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 330, 32, 32);
    ctx.beginPath();
    ctx.moveTo(x, 330);
    ctx.lineTo(x + 32, 362);
    ctx.moveTo(x + 32, 330);
    ctx.lineTo(x, 362);
    ctx.stroke();
  });
  // Anchor leaning on the dock (absent in the changed picture).
  if (!changed.has('anchor')) {
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(150, 336);
    ctx.lineTo(150, 380);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(150, 384, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(136, 344);
    ctx.lineTo(164, 344);
    ctx.stroke();
    circle(ctx, 150, 332, 5, '#3a3a3a');
  }
  // Rope coil at the dock edge (absent in the changed picture).
  if (!changed.has('rope')) {
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 4;
    [16, 11, 6].forEach((r) => {
      ctx.beginPath();
      ctx.arc(540, 388, r, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  // Waves.
  ctx.strokeStyle = '#7ccbe6';
  ctx.lineWidth = 3;
  [[60, 290], [180, 300], [420, 296], [500, 288]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 14, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  });
}

export const SCENES = [
  { draw: drawScene1, diffs: SCENE1_DIFFS },
  { draw: drawScene2, diffs: SCENE2_DIFFS },
  { draw: drawScene3, diffs: SCENE3_DIFFS },
];
