// Renderer: paints the whole game from state onto one 1280x720 canvas.
// Title, play (two panels + HUD + markers), level-clear, victory, game-over
// and pause screens. Markers are drawn on both panels so a found difference
// is circled wherever the player looks.
import {
  CANVAS_H, CANVAS_W, HINT_BUTTON, LEFT_X, NEXT_BUTTON, PANEL_H, PANEL_W,
  PANEL_Y, RIGHT_X,
} from './config.js';
import { LEVELS, drawSceneInto, levelDiffs } from './differences.js';
import { allFound, diffsOf, unfoundOf } from './state.js';

const BG = '#171226';
const PANEL_BG = '#241d33';
const CREAM = '#f6e3c2';
const GOLD = '#ffd94d';
const GREEN = '#5fd68a';
const RED = '#ff6b5e';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx, str, x, y, size, fill, align = 'left', font = 'bold') {
  ctx.fillStyle = fill;
  ctx.font = `${font} ${size}px Georgia, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawPanelFrame(ctx, x) {
  ctx.fillStyle = PANEL_BG;
  ctx.fillRect(x - 6, PANEL_Y - 6, PANEL_W + 12, PANEL_H + 12);
  ctx.strokeStyle = '#4a3a5e';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, PANEL_Y - 6, PANEL_W + 12, PANEL_H + 12);
}

/** Draw one scene panel, clipped to the panel rect. */
function drawPanel(ctx, state, panelX, changed) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(panelX, PANEL_Y);
  drawSceneInto(ctx, state.level, changed);
  ctx.restore();
}

/** Green ring + check on a found difference, on both panels. */
function drawFoundMarkers(ctx, state, now) {
  for (const d of diffsOf(state)) {
    if (!state.found.has(d.id)) continue;
    const pop = state.foundPop.find((p) => p.id === d.id);
    const age = pop ? (now - pop.at) / 350 : 1;
    const scale = age < 1 ? 1.35 - 0.35 * age : 1;
    for (const px of [LEFT_X, RIGHT_X]) {
      const cx = px + d.x;
      const cy = PANEL_Y + d.y;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, d.r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(-2, 8);
      ctx.lineTo(11, -8);
      ctx.stroke();
      ctx.restore();
    }
  }
}

/** Pulsing dashed ring on the hinted difference, on both panels. */
function drawHintMarker(ctx, state, now) {
  if (!state.hinted) return;
  const d = diffsOf(state).find((x) => x.id === state.hinted);
  if (!d || state.found.has(d.id)) return;
  const pulse = 1 + 0.12 * Math.sin(now / 180);
  for (const px of [LEFT_X, RIGHT_X]) {
    ctx.save();
    ctx.translate(px + d.x, PANEL_Y + d.y);
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, d.r + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.setLineDash([]);
}

/** Fading red X marks where the player clicked and missed. */
function drawWrongMarks(ctx, state, now) {
  state.wrongMarks = state.wrongMarks.filter((m) => now - m.at < 900);
  for (const m of state.wrongMarks) {
    const alpha = 1 - (now - m.at) / 900;
    const px = m.panel === 'left' ? LEFT_X : RIGHT_X;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 4;
    const x = px + m.x;
    const y = PANEL_Y + m.y;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    ctx.restore();
  }
}

/** Keyboard cursor: a dashed white ring on the focused unfound difference. */
function drawCursor(ctx, state) {
  if (!state.cursor || state.screen !== 'play') return;
  for (const px of [LEFT_X, RIGHT_X]) {
    ctx.save();
    ctx.translate(px + state.cursor.x, PANEL_Y + state.cursor.y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.setLineDash([]);
}

function drawHud(ctx, state) {
  const level = LEVELS[state.level];
  label(ctx, 'LANTERN LANE', 36, 34, 30, CREAM);
  label(ctx, 'spot the difference', 36, 62, 15, '#b8a8d8', 'left', 'italic');
  label(ctx, `Level ${state.level + 1} / ${LEVELS.length} — ${level.name}`, 640, 34, 22, GOLD, 'center');
  label(ctx, level.subtitle, 640, 60, 14, '#b8a8d8', 'center', 'italic');

  // Found counter — big, because the judge reads it at a glance.
  const total = diffsOf(state).length;
  const found = state.found.size;
  ctx.fillStyle = found === total ? GREEN : '#2b2350';
  roundRect(ctx, 1010, 16, 234, 58, 10);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();
  label(ctx, `Found ${found} of ${total}`, 1127, 46, 26, found === total ? '#0f2f1a' : CREAM, 'center');

  // Timer bar + score line.
  const seconds = Math.max(0, Math.ceil(state.timeLeft));
  const frac = Math.max(0, state.timeLeft / LEVELS[state.level].seconds);
  ctx.fillStyle = '#2b2350';
  roundRect(ctx, 36, 82, 560, 14, 7);
  ctx.fill();
  ctx.fillStyle = seconds <= 15 ? RED : GOLD;
  roundRect(ctx, 36, 82, 560 * frac, 14, 7);
  ctx.fill();
  label(ctx, `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`, 610, 89, 20, seconds <= 15 ? RED : CREAM);
  label(ctx, `Score ${state.score}   Combo x${state.combo}   Best ${state.best}`, 700, 89, 18, CREAM);
  if (state.combo >= 2) label(ctx, `COMBO x${state.combo}!`, 1127, 96, 15, GOLD, 'center');
}

function drawFooter(ctx, state) {
  label(ctx, 'Click a difference on either picture  •  Arrows / Tab move the ring, Enter marks it  •  H hint (−50 pts, −5 s)  •  P pause  •  M sound', 36, 576, 15, '#b8a8d8');
  label(ctx, 'One picture changed. The other did not. Trust your eyes, not your memory.', 36, 600, 15, '#8a7ab8', 'left', 'italic');
  // Hint button.
  const afford = state.score >= 50 || state.levelScore >= 50;
  ctx.fillStyle = afford ? '#3d7ac8' : '#2b2350';
  roundRect(ctx, HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 8);
  ctx.fill();
  ctx.strokeStyle = afford ? GOLD : '#4a3a5e';
  ctx.lineWidth = 2;
  ctx.stroke();
  label(ctx, `Hint (H) — 50`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 23, 18, afford ? '#ffffff' : '#8a7ab8', 'center');
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(12, 8, 24, 0.72)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawTitle(ctx, state, now) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // A small preview of the first scene, drawn live.
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.rect(340, 120, 600, 300);
  ctx.clip();
  ctx.translate(340, 120);
  ctx.scale(600 / 560, 300 / 420);
  drawSceneInto(ctx, 0, new Set());
  ctx.restore();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(340, 120, 600, 300);
  label(ctx, 'LANTERN LANE', 640, 84, 56, GOLD, 'center');
  label(ctx, 'spot the difference', 640, 122, 22, CREAM, 'center', 'italic');
  // The two panels, labelled, so the game reads at a glance.
  label(ctx, 'ORIGINAL', 390, 446, 18, GREEN);
  label(ctx, 'CHANGED', 890, 446, 18, GOLD, 'right');
  label(ctx, 'Two pictures. One of them changed. Find every difference —', 640, 500, 20, CREAM, 'center');
  label(ctx, 'click it on either picture, or move the ring with the arrows and press Enter.', 640, 528, 20, CREAM, 'center');
  label(ctx, '3 scenes  •  7, 8 and 10 differences  •  hints cost points  •  beat the clock', 640, 566, 17, '#b8a8d8', 'center');
  const pulse = 0.75 + 0.25 * Math.sin(now / 300);
  ctx.globalAlpha = pulse;
  label(ctx, 'Click or press Enter to play', 640, 620, 24, GOLD, 'center');
  ctx.globalAlpha = 1;
  if (state.best > 0) label(ctx, `Best score: ${state.best}`, 640, 656, 17, '#b8a8d8', 'center');
}

function drawClear(ctx, state) {
  overlay(ctx);
  label(ctx, `Level ${state.level + 1} clear!`, 640, 240, 48, GREEN, 'center');
  label(ctx, LEVELS[state.level].name, 640, 296, 26, GOLD, 'center');
  label(ctx, `Differences found: ${diffsOf(state).length} of ${diffsOf(state).length}`, 640, 350, 22, CREAM, 'center');
  label(ctx, `Level score ${state.levelScore}  +  time bonus ${state.levelBonus}  =  ${state.score} total`, 640, 386, 22, CREAM, 'center');
  label(ctx, `Best combo x${state.bestCombo}   •   Misses ${state.misses}   •   Hints ${state.hintsUsed}`, 640, 420, 18, '#b8a8d8', 'center');
  ctx.fillStyle = GREEN;
  roundRect(ctx, NEXT_BUTTON.x, NEXT_BUTTON.y, NEXT_BUTTON.w, NEXT_BUTTON.h, 10);
  ctx.fill();
  label(ctx, state.level + 1 >= LEVELS.length ? 'See results' : 'Next level  →', NEXT_BUTTON.x + NEXT_BUTTON.w / 2, NEXT_BUTTON.y + 29, 22, '#0f2f1a', 'center');
}

function drawVictory(ctx, state) {
  overlay(ctx);
  label(ctx, 'You found them all!', 640, 220, 52, GOLD, 'center');
  label(ctx, 'Every difference in all three scenes — Lantern Lane, Firefly Garden, Harbour Lights.', 640, 282, 20, CREAM, 'center');
  label(ctx, `Final score: ${state.score}`, 640, 340, 34, CREAM, 'center');
  label(ctx, `Best score: ${state.best}`, 640, 384, 20, '#b8a8d8', 'center');
  label(ctx, `Best combo x${state.bestCombo}   •   Total misses ${state.misses}`, 640, 420, 18, '#b8a8d8', 'center');
  ctx.fillStyle = GOLD;
  roundRect(ctx, NEXT_BUTTON.x, NEXT_BUTTON.y, NEXT_BUTTON.w, NEXT_BUTTON.h, 10);
  ctx.fill();
  label(ctx, 'Play again', NEXT_BUTTON.x + NEXT_BUTTON.w / 2, NEXT_BUTTON.y + 29, 22, '#241d33', 'center');
}

function drawOver(ctx, state) {
  overlay(ctx);
  label(ctx, 'Out of time!', 640, 260, 48, RED, 'center');
  label(ctx, state.overReason || 'The clock ran out before you found every difference.', 640, 320, 20, CREAM, 'center');
  const left = unfoundOf(state).length;
  label(ctx, `${state.found.size} of ${diffsOf(state).length} found — ${left} still hiding.`, 640, 356, 22, CREAM, 'center');
  ctx.fillStyle = GOLD;
  roundRect(ctx, NEXT_BUTTON.x, NEXT_BUTTON.y, NEXT_BUTTON.w, NEXT_BUTTON.h, 10);
  ctx.fill();
  label(ctx, 'Try this level again', NEXT_BUTTON.x + NEXT_BUTTON.w / 2, NEXT_BUTTON.y + 29, 22, '#241d33', 'center');
}

function drawPaused(ctx, state) {
  overlay(ctx);
  label(ctx, 'Paused', 640, 300, 48, CREAM, 'center');
  label(ctx, 'Press P or click to keep hunting.', 640, 356, 20, '#b8a8d8', 'center');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  function draw(state, now) {
    if (state.screen === 'title') { drawTitle(ctx, state, now); return; }
    // Playfield behind every in-game screen.
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawHud(ctx, state);
    drawPanelFrame(ctx, LEFT_X);
    drawPanelFrame(ctx, RIGHT_X);
    const all = new Set(diffsOf(state).map((d) => d.id));
    drawPanel(ctx, state, LEFT_X, new Set());
    drawPanel(ctx, state, RIGHT_X, all);
    label(ctx, 'ORIGINAL', LEFT_X + PANEL_W / 2, PANEL_Y + PANEL_H + 22, 15, GREEN, 'center');
    label(ctx, 'CHANGED', RIGHT_X + PANEL_W / 2, PANEL_Y + PANEL_H + 22, 15, GOLD, 'center');
    drawFoundMarkers(ctx, state, now);
    drawHintMarker(ctx, state, now);
    drawWrongMarks(ctx, state, now);
    drawCursor(ctx, state);
    if (state.screen === 'play' || state.screen === 'paused') drawFooter(ctx, state);
    if (state.screen === 'clear') drawClear(ctx, state);
    else if (state.screen === 'victory') drawVictory(ctx, state);
    else if (state.screen === 'over') drawOver(ctx, state);
    else if (state.screen === 'paused') drawPaused(ctx, state);
    if (allFound(state) && state.screen === 'play') {
      label(ctx, 'All found!', 640, 620, 22, GREEN, 'center');
    }
  }

  return { draw };
}
