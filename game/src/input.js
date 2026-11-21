// Mouse + keyboard input for the game canvas.
// Clicks map to scene coordinates on either panel; the keyboard moves a focus
// ring between the still-unfound differences and Enter marks the focused one.
// H hints, P pauses, M toggles sound, Enter advances screens.
import {
  GAP, HINT_BUTTON, LEFT_X, NEXT_BUTTON, PANEL_H, PANEL_W, PANEL_Y, RIGHT_X,
} from './config.js';
import { diffAt, markFound, markWrong, unfoundOf, useHint } from './state.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_HINT = 'hint';
export const ACTION_PAUSE = 'pause';
export const ACTION_MUTE = 'mute';
export const ACTION_NEXT = 'next';
export const ACTION_RESTART = 'restart';

function panelAt(mx, my) {
  if (my >= PANEL_Y && my <= PANEL_Y + PANEL_H) {
    if (mx >= LEFT_X && mx <= LEFT_X + PANEL_W) return { panel: 'left', x: mx - LEFT_X, y: my - PANEL_Y };
    if (mx >= RIGHT_X && mx <= RIGHT_X + PANEL_W) return { panel: 'right', x: mx - RIGHT_X, y: my - PANEL_Y };
  }
  return null;
}

function inRect(mx, my, r) {
  return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
}

export function createInput(canvas, hooks) {
  const input = {
    mouse: { x: 0, y: 0 },
    focusIndex: 0,
  };

  function canvasPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('pointermove', (event) => {
    const p = canvasPos(event);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
  });

  canvas.addEventListener('pointerdown', (event) => {
    const p = canvasPos(event);
    hooks.audio.unlock();
    hooks.onPress(p.x, p.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight'
      && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    const key = event.key;
    if (key === 'm' || key === 'M') { hooks.onAction(ACTION_MUTE); return; }
    if (key === 'p' || key === 'P' || key === 'Escape') { hooks.onAction(ACTION_PAUSE); return; }
    if (key === 'h' || key === 'H') { hooks.onAction(ACTION_HINT); return; }
    if (key === 'Enter' || key === ' ') { event.preventDefault(); hooks.onAction(ACTION_CONFIRM); return; }
    if (key.startsWith('Arrow')) {
      event.preventDefault();
      hooks.onArrow(key.slice(5).toLowerCase());
    }
    if (key === 'Tab') {
      event.preventDefault();
      hooks.onArrow(event.shiftKey ? 'prev' : 'next');
    }
  });

  return input;
}

/** Handle a pointer press at canvas coords; returns what happened. */
export function handlePress(state, x, y, audio) {
  if (state.screen === 'play') {
    if (inRect(x, y, HINT_BUTTON)) {
      const pick = useHint(state);
      if (pick) audio.hint();
      return pick ? 'hint' : 'nohint';
    }
    const hit = panelAt(x, y);
    if (!hit) return 'none';
    const diff = diffAt(state, hit.x, hit.y);
    if (diff) {
      const points = markFound(state, diff);
      audio.found(state.combo);
      return { kind: 'found', diff, points };
    }
    markWrong(state, hit.x, hit.y, hit.panel);
    audio.wrong();
    return 'wrong';
  }
  if (state.screen === 'clear' || state.screen === 'victory' || state.screen === 'over') {
    if (inRect(x, y, NEXT_BUTTON)) return 'next';
    return 'none';
  }
  if (state.screen === 'title') return 'start';
  return 'none';
}

/** Move the keyboard focus ring to the nearest unfound difference in a direction. */
export function moveFocus(state, direction) {
  const rest = unfoundOf(state);
  if (rest.length === 0) return;
  if (!state.cursor) {
    state.cursor = { x: rest[0].x, y: rest[0].y };
    state.focus = 0;
    return;
  }
  const cur = rest[state.focus] ?? rest[0];
  let best = null;
  let bestScore = Infinity;
  for (let i = 0; i < rest.length; i += 1) {
    if (i === state.focus) continue;
    const d = rest[i];
    const dx = d.x - cur.x;
    const dy = d.y - cur.y;
    let along = 0;
    let across = 0;
    if (direction === 'left') { along = -dx; across = Math.abs(dy); if (dx >= 0) continue; }
    if (direction === 'right') { along = dx; across = Math.abs(dy); if (dx <= 0) continue; }
    if (direction === 'up') { along = -dy; across = Math.abs(dx); if (dy >= 0) continue; }
    if (direction === 'down') { along = dy; across = Math.abs(dx); if (dy <= 0) continue; }
    if (direction === 'next' || direction === 'prev') {
      const step = direction === 'next' ? 1 : -1;
      state.focus = (state.focus + step + rest.length) % rest.length;
      state.cursor = { x: rest[state.focus].x, y: rest[state.focus].y };
      return;
    }
    const score = along + across * 2.5;
    if (score < bestScore) { bestScore = score; best = i; }
  }
  if (best !== null) {
    state.focus = best;
    state.cursor = { x: rest[best].x, y: rest[best].y };
  }
}

export { GAP, LEFT_X, RIGHT_X };
