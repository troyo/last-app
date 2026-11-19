// A picture under each step of a card, drawn in the same style as "Show me".
// The list lines up with the card's steps: one entry per step, null where words are enough.
// A card's own `pictures` (the labelled diagrams) win over these.
import { SHOW_PICS, ShowPic } from './show-me';

const STEP_PICS: Record<string, (ShowPic | null)[]> = {
  bleeding: ['pressA', 'pressB', 'pressMore', null, 'layWarm'],
  cpr: ['cprShout', 'layFlat', null, 'pushB', 'pushA', 'breathA', null],
  choking: [null, 'slapB', 'thrustA', null, 'pushB'],
  burn: ['burnCoolB', 'burnRings', 'burnCover', 'sipB'],
  'broken-bone': ['boneStill', 'boneSplint', 'boneSling', 'boneCold', 'legsUp'],
  heat: ['heatShade', null, 'heatCoolA', 'heatCloths', 'sipA'],
  cold: ['coldInsideA', 'coldDry', 'coldWrap', 'coldShare', 'warmDrinkA'],
};

/** The picture for step i of a card, if it has one. */
export function stepPicture(cardId: string, i: number): number | undefined {
  const key = STEP_PICS[cardId]?.[i];
  return key ? SHOW_PICS[key] : undefined;
}

export const STEP_PICTURE_CARDS = Object.keys(STEP_PICS);
