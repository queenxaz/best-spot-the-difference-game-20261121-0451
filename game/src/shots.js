// Staged screenshot scenes behind ?shot=cover|play|win.
// Each one builds a real game state, plays the real rules forward a little
// (marks a few differences found, uses a hint once), and paints the frame the
// live game paints — so the shot is what a short game really looks like.
import { diffsOf, createState, markFound, startLevel, useHint } from './state.js';

function findDiff(state, id) {
  return diffsOf(state).find((d) => d.id === id) ?? null;
}

function mark(state, ids) {
  for (const id of ids) {
    const diff = findDiff(state, id);
    if (diff) markFound(state, diff);
  }
}

/** A mid-play frame: level 1, 3 of 7 found, 4 still hiding, counter visible. */
function stageCover() {
  const state = createState();
  state.best = 0;
  startLevel(state, 0);
  mark(state, ['moon', 'cat', 'sign']);
  state.timeLeft = 84;
  state.combo = 3;
  state.score = 345;
  state.levelScore = 345;
  state.cursor = { x: 430, y: 300 };
  state.focus = 3;
  return state;
}

/** A garden frame: level 2, 2 of 8 found, a hint ringing one unfound diff. */
function stagePlay() {
  const state = createState();
  state.best = 315;
  startLevel(state, 1);
  mark(state, ['butterfly', 'frog']);
  state.score = 530;
  state.levelScore = 215;
  state.timeLeft = 61;
  state.combo = 2;
  useHint(state);
  state.cursor = { x: 78, y: 58 };
  state.focus = 0;
  return state;
}

/** A victory frame: all three levels cleared, final score on screen. */
function stageWin() {
  const state = createState();
  state.best = 2400;
  startLevel(state, 2);
  mark(state, ['beam', 'cloud', 'sail', 'gull', 'flag', 'crates', 'window', 'buoy', 'anchor', 'rope']);
  state.score = 2650;
  state.totalScore = 2650;
  state.levelScore = 1675;
  state.levelBonus = 150;
  state.timeLeft = 15;
  state.screen = 'victory';
  return state;
}

/** Stage a shot by name; returns a state ready for the renderer, or null. */
export function stageShot(name) {
  if (name === 'cover') return stageCover();
  if (name === 'play') return stagePlay();
  if (name === 'win') return stageWin();
  return null;
}
