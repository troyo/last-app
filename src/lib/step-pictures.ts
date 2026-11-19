// A picture under each step of a card, drawn in the same style as "Show me".
// The list lines up with the card's steps: one entry per step, null where words are enough.
// A card's own `pictures` (the labelled diagrams) win over these.
import { REBUILD_PICS } from './rebuild-pictures';
import { SHOW_PICS, ShowPic } from './show-me';

const STEP_PICS: Record<string, (ShowPic | null)[]> = {
  bleeding: ['pressA', 'pressB', 'pressMore', null, 'layWarm'],
  cpr: ['cprShout', 'layFlat', null, 'pushB', 'pushA', 'breathA', null],
  choking: [null, 'slapB', 'thrustA', null, 'pushB'],
  burn: ['burnCoolB', 'burnRings', 'burnCover', 'sipB'],
  'broken-bone': ['boneStill', 'boneSplint', 'boneSling', 'boneCold', 'legsUp'],
  heat: ['heatShade', null, 'heatCoolA', 'heatCloths', 'sipA'],
  cold: ['coldInsideA', 'coldDry', 'coldWrap', 'coldShare', 'warmDrinkA'],
  'snake-bite': [
    'snakeAway',
    'snakeStill',
    'burnRings',
    'boneSplint',
    'burnCover',
    'snakeMark',
    'snakeCarry',
  ],
  seizure: [
    'seizureShakeA',
    'seizureClear',
    'seizurePillow',
    null,
    'seizureTime',
    null,
    'seizureStay',
  ],
  dehydration: ['orsStirB', null, 'sipB', 'orsWait', 'orsPee', null, null, 'orsFresh'],
  wound: [
    null,
    'washHandsB',
    'woundRinseB',
    'woundTweezers',
    'woundOintment',
    'woundCover',
    'woundCheck',
  ],
  allergy: [
    'allergyPenA',
    'allergyStinger',
    'allergySit',
    'legsUp',
    null,
    'allergyPill',
    'allergySecond',
  ],
  water: ['waterFilter', 'waterBoilB', 'waterBleach', 'waterWait', 'waterStore'],
  lost: ['lostStop', 'lostWarm', 'lostSignalB', 'lostThreeC', 'sipA'],
  fire: ['fireSpot', 'firePiles', 'fireSnapB', 'fireTent', 'fireLightB', 'fireFeedB'],
  shelter: [
    'shelterEarly',
    'shelterSpot',
    null,
    'shelterFrame',
    'shelterDone',
    'shelterBed',
    'shelterCoverB',
  ],
  'find-water': [
    'saveHeater',
    'findwTarpB',
    'findwDownhill',
    'findwFlow',
    'findwDigB',
    'findwDewB',
    'waterBoilB',
  ],
  signal: [
    'lostThreeC',
    'signalHighB',
    'signalMirrorB',
    'signalSmokeB',
    'signalSos',
    'signalCloth',
  ],
  warm: ['warmLayers', 'warmCover', 'coldDry', 'warmRoom', 'warmFloor', 'coldShare', 'warmDrinkA'],
  birth: [
    null,
    'birthKit',
    'birthPos',
    null,
    'birthGentle',
    null,
    'birthCatch',
    'birthDryB',
    'birthSkin',
    'birthCord',
    'birthWait',
    'birthRubB',
  ],
};

/** The picture for step i of a card, if it has one. */
export function stepPicture(cardId: string, i: number): number | undefined {
  const key = STEP_PICS[cardId]?.[i];
  if (key) return SHOW_PICS[key];
  return REBUILD_PICS[cardId]?.[i];
}

export const STEP_PICTURE_CARDS = Object.keys(STEP_PICS);
