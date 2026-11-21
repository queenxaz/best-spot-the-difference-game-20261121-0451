// Level definitions: each level is one hand-drawn scene with its differences
// and a timer that tightens as the pictures get busier.
import { SCENES } from './scenes.js';

export const LEVELS = [
  {
    name: 'Lantern Lane',
    subtitle: 'A night market at dusk',
    scene: 0,
    seconds: 120,
    blurb: 'Seven little things changed between the two pictures. Find them all!',
  },
  {
    name: 'Firefly Garden',
    subtitle: 'A sunny walled garden',
    scene: 1,
    seconds: 100,
    blurb: 'Eight differences hide in the garden. Look close — the small ones bite.',
  },
  {
    name: 'Harbour Lights',
    subtitle: 'A fishing harbour at dusk',
    scene: 2,
    seconds: 90,
    blurb: 'Ten differences in the busiest picture yet. The clock is not your friend.',
  },
];

/** The differences for a level: the scene's own list, in scene coordinates. */
export function levelDiffs(levelIndex) {
  return SCENES[LEVELS[levelIndex].scene].diffs;
}

/** Draw one scene into a panel; `changed` holds the ids altered in that panel. */
export function drawSceneInto(ctx, levelIndex, changed) {
  const scene = SCENES[LEVELS[levelIndex].scene];
  scene.draw(ctx, changed);
}
