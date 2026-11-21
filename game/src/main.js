// Boot and the one loop for Lantern Lane.
// The game moves between title, play, paused, level-clear, victory and
// game-over screens. Play runs on a fixed 1/60 s step; the timer ticks in
// real time while the screen is play. ?shot=cover|play|win stages a scene
// instead of running the loop, paints it twice and sets window.__shotReady
// for a screenshot.
//
// Scoring lives in state.js; drawing lives in render.js; input in input.js.
import { BEST_KEY } from './config.js';
import { LEVELS } from './differences.js';
import { createAudio } from './audio.js';
import {
  ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, createInput,
  handlePress, moveFocus,
} from './input.js';
import {
  allFound, clearLevel, createState, markFound, nextLevel, startLevel,
  unfoundOf, useHint,
} from './state.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();

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
    // Storage can be off (private windows): the best score lasts this visit only.
  }
}

function announce(state) {
  const total = state.found.size + unfoundOf(state).length;
  status.textContent = state.screen === 'play'
    ? `${LEVELS[state.level].name}: ${state.found.size} of ${total} differences found, ${Math.ceil(state.timeLeft)} seconds left, score ${state.score}.`
    : state.screen;
}

/** After a found difference, check for a level clear and bank the best score. */
function afterFound(state) {
  announce(state);
  if (!allFound(state)) return;
  audio.clear();
  clearLevel(state);
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.best);
  }
  announce(state);
}

function runShot(name) {
  const state = stageShot(name);
  if (!state) { window.__shotReady = true; return; }
  let painted = 0;
  function paint() {
    renderer.draw(state, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const state = createState();
  state.best = readBest();
  let lastTickSecond = -1;

  createInput(canvas, {
    audio,
    onPress(x, y) {
      if (state.screen === 'title') {
        audio.click();
        startLevel(state, 0);
        announce(state);
        return;
      }
      if (state.screen === 'paused') {
        state.screen = 'play';
        return;
      }
      const result = handlePress(state, x, y, audio);
      if (result && typeof result === 'object' && result.kind === 'found') {
        afterFound(state);
      } else if (result === 'next') {
        audio.click();
        if (state.screen === 'clear') nextLevel(state);
        else if (state.screen === 'victory') { state.score = 0; startLevel(state, 0); }
        else if (state.screen === 'over') startLevel(state, state.level);
        announce(state);
      } else if (result === 'hint' || result === 'wrong') {
        announce(state);
      }
    },
    onArrow(direction) {
      if (state.screen === 'play') moveFocus(state, direction);
    },
    onAction(action) {
      if (action === ACTION_MUTE) {
        const on = audio.toggle();
        status.textContent = on ? 'Sound on.' : 'Sound off.';
        return;
      }
      if (action === ACTION_PAUSE) {
        if (state.screen === 'play') state.screen = 'paused';
        else if (state.screen === 'paused') state.screen = 'play';
        return;
      }
      if (action === ACTION_HINT) {
        if (state.screen === 'play') {
          const pick = useHint(state);
          if (pick) audio.hint();
          announce(state);
        }
        return;
      }
      if (action === ACTION_CONFIRM) {
        if (state.screen === 'title') {
          audio.click();
          startLevel(state, 0);
          announce(state);
        } else if (state.screen === 'clear') {
          audio.click();
          nextLevel(state);
          announce(state);
        } else if (state.screen === 'victory') {
          audio.click();
          state.score = 0;
          startLevel(state, 0);
          announce(state);
        } else if (state.screen === 'over') {
          audio.click();
          startLevel(state, state.level);
          announce(state);
        } else if (state.screen === 'play' && state.cursor) {
          // Enter marks the difference under the keyboard cursor.
          const diff = unfoundOf(state)[state.focus];
          if (!diff) return;
          markFound(state, diff);
          audio.found(state.combo);
          afterFound(state);
        }
      }
    },
  });

  let accumulator = 0;
  let last = performance.now();

  function frame(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      if (state.screen === 'play') {
        state.timeLeft -= STEP;
        const whole = Math.ceil(state.timeLeft);
        if (whole !== lastTickSecond) {
          lastTickSecond = whole;
          if (whole <= 10 && whole > 0) audio.tick();
        }
        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          state.overReason = 'The clock ran out before you found every difference.';
          state.screen = 'over';
          audio.over();
          announce(state);
        }
      }
    }
    renderer.draw(state, now);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
