// Game state: one level at a time, found differences, score, combo, timer.
// Pure data plus the small rules for marking, hints and clearing a level.
import {
  COMBO_STEP, HINT_COST, HINT_TIME_COST, POINTS_PER_DIFF,
  TIME_BONUS_PER_SECOND, WRONG_TIME_COST,
} from './config.js';
import { LEVELS, levelDiffs } from './differences.js';

export function createState() {
  return {
    screen: 'title',
    level: 0,
    found: new Set(),
    hinted: null, // id of the difference the hint is pointing at, or null
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: LEVELS[0].seconds,
    levelScore: 0,
    levelBonus: 0,
    totalScore: 0,
    misses: 0,
    hintsUsed: 0,
    focus: 0, // keyboard cursor: index into the level's unfound differences
    cursor: null, // {x, y} scene coords of the keyboard cursor, or null
    wrongMarks: [], // {x, y, panel, at} fading red X marks
    foundPop: [], // {id, at} pop animation for a fresh ring
    paused: false,
    overReason: '',
  };
}

export function startLevel(state, levelIndex) {
  state.level = levelIndex;
  state.found = new Set();
  state.hinted = null;
  state.combo = 0;
  state.timeLeft = LEVELS[levelIndex].seconds;
  state.levelScore = 0;
  state.levelBonus = 0;
  state.misses = 0;
  state.hintsUsed = 0;
  state.focus = 0;
  state.cursor = null;
  state.wrongMarks = [];
  state.foundPop = [];
  state.screen = 'play';
  state.paused = false;
}

export function diffsOf(state) {
  return levelDiffs(state.level);
}

export function unfoundOf(state) {
  return diffsOf(state).filter((d) => !state.found.has(d.id));
}

export function allFound(state) {
  return state.found.size === diffsOf(state).length;
}

/** Find the difference at scene coords (x, y), if it is still unfound. */
export function diffAt(state, x, y) {
  for (const d of unfoundOf(state)) {
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}

/** Mark a difference found. Returns the points earned. */
export function markFound(state, diff) {
  state.found.add(diff.id);
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const points = POINTS_PER_DIFF + (state.combo - 1) * COMBO_STEP;
  state.score += points;
  state.levelScore += points;
  state.hinted = state.hinted === diff.id ? null : state.hinted;
  state.foundPop.push({ id: diff.id, at: performance.now() });
  return points;
}

export function markWrong(state, x, y, panel) {
  state.combo = 0;
  state.misses += 1;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_COST);
  state.wrongMarks.push({ x, y, panel, at: performance.now() });
}

/** Spend a hint: reveal one unfound difference for a few seconds. */
export function useHint(state) {
  const rest = unfoundOf(state);
  if (rest.length === 0) return null;
  if (state.score < HINT_COST && state.levelScore < HINT_COST) return null;
  state.score = Math.max(0, state.score - HINT_COST);
  state.levelScore = Math.max(0, state.levelScore - HINT_COST);
  state.timeLeft = Math.max(0, state.timeLeft - HINT_TIME_COST);
  state.hintsUsed += 1;
  const pick = rest[Math.floor(rest.length / 2)];
  state.hinted = pick.id;
  return pick;
}

/** Called when a level is cleared: time bonus, then advance or win. */
export function clearLevel(state) {
  state.levelBonus = Math.floor(state.timeLeft) * TIME_BONUS_PER_SECOND;
  state.score += state.levelBonus;
  state.totalScore = state.score;
  if (state.level + 1 >= LEVELS.length) {
    state.screen = 'victory';
  } else {
    state.screen = 'clear';
  }
}

export function nextLevel(state) {
  startLevel(state, state.level + 1);
}
