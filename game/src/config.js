// Shared constants for Lantern Lane — Spot the Difference.
// One canvas, two panels, three hand-drawn scenes, keyboard + mouse play.
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// Scene panels: two 560x420 pictures side by side.
export const PANEL_W = 560;
export const PANEL_H = 420;
export const PANEL_Y = 108;
export const LEFT_X = 36;
export const RIGHT_X = 684;
export const GAP = 88;

// Scoring.
export const POINTS_PER_DIFF = 100;
export const COMBO_STEP = 15;
export const HINT_COST = 50;
export const HINT_TIME_COST = 5;
export const WRONG_TIME_COST = 2;
export const TIME_BONUS_PER_SECOND = 10;

// Screens.
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_VICTORY = 'victory';
export const SCREEN_OVER = 'over';
export const SCREEN_PAUSED = 'paused';

export const BEST_KEY = 'lantern-lane-best';

// Hint button rect (canvas coordinates).
export const HINT_BUTTON = { x: 1060, y: 648, w: 184, h: 44 };
export const NEXT_BUTTON = { x: 520, y: 560, w: 240, h: 56 };
