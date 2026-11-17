// "Show me": the emergency cards as moving pictures, one step per screen, with
// only a few words each and a voice that reads them out. Made so that anyone
// can follow along, whatever their reading level, with no internet.
//
// Each step shows one picture, or two that swap back and forth to show the
// movement. The words here are deliberately shorter than on the full card.
import { DIAGRAMS } from './diagrams';

const P = {
  layFlat: require('../../assets/show/lay-flat.png'),
  pushA: require('../../assets/show/cpr-push-a.png'),
  pushB: require('../../assets/show/cpr-push-b.png'),
  breathA: require('../../assets/show/cpr-breath-a.png'),
  breathB: require('../../assets/show/cpr-breath-b.png'),
  pressA: require('../../assets/show/press-a.png'),
  pressB: require('../../assets/show/press-b.png'),
  pressMore: require('../../assets/show/press-more.png'),
  legsUp: require('../../assets/show/legs-up.png'),
  slapA: require('../../assets/show/slap-a.png'),
  slapB: require('../../assets/show/slap-b.png'),
  thrustA: require('../../assets/show/thrust-a.png'),
  thrustB: require('../../assets/show/thrust-b.png'),
  hands: DIAGRAMS.cpr.image,
  tourniquet: DIAGRAMS.tourniquet.image,
  recovery: DIAGRAMS.recovery.image,
};

export type ShowStep = {
  /** A few plain words. Shown big and read aloud. */
  say: string;
  /** One picture, or two that swap to show the movement. */
  pics: number[];
  /** Swap the pictures in time with this many beats a minute (CPR pushes). */
  beat?: number;
  /** Count along up to this number (30 pushes, 5 slaps). */
  count?: number;
  /** How long each picture stays, when there is no beat. */
  holdMs?: number;
  /** Offer a countdown for this many minutes. */
  minutes?: number;
};

export const SHOW_ME: Record<string, ShowStep[]> = {
  cpr: [
    { say: 'Lay them on their back on a hard floor.', pics: [P.layFlat] },
    { say: 'Kneel beside them. Put both hands on the middle of the chest.', pics: [P.hands] },
    {
      say: 'Push down hard and fast. Push in time with the beat.',
      pics: [P.pushA, P.pushB],
      beat: 110,
      count: 30,
    },
    {
      say: 'After 30 pushes, tilt the head back and give 2 breaths. If you can’t, just keep pushing.',
      pics: [P.breathA, P.breathB],
      holdMs: 1300,
    },
    {
      say: 'Keep going. Do not stop. Swap with someone every 2 minutes.',
      pics: [P.pushA, P.pushB],
      beat: 110,
      count: 30,
      minutes: 2,
    },
    {
      say: 'Breathing again? Roll them onto their side and keep them warm.',
      pics: [P.recovery],
    },
  ],
  bleeding: [
    {
      say: 'Press hard on the wound with a cloth or your hand.',
      pics: [P.pressA, P.pressB],
      holdMs: 900,
    },
    { say: 'Keep pressing for 10 minutes. Do not lift to look.', pics: [P.pressB], minutes: 10 },
    {
      say: 'Blood coming through? Put more cloth on top and press harder.',
      pics: [P.pressB, P.pressMore],
      holdMs: 1200,
    },
    {
      say: 'Arm or leg still pouring? Tie a belt above the wound. Twist it tight with a stick.',
      pics: [P.tourniquet],
    },
    { say: 'Lay them down. Raise their legs. Keep them warm.', pics: [P.legsUp] },
  ],
  choking: [
    {
      say: 'Lean them forward. Give 5 hard slaps between the shoulder blades.',
      pics: [P.slapA, P.slapB],
      holdMs: 700,
      count: 5,
    },
    {
      say: 'Still stuck? Stand behind them. Fist above the belly button. Pull in and up, 5 times.',
      pics: [P.thrustA, P.thrustB],
      holdMs: 700,
      count: 5,
    },
    {
      say: 'Keep going. 5 slaps, then 5 pulls, until it comes out.',
      pics: [P.slapA, P.slapB],
      holdMs: 700,
    },
    {
      say: 'If they pass out, lay them down and start pushing on the chest.',
      pics: [P.pushA, P.pushB],
      beat: 110,
    },
  ],
};

export const hasShowMe = (id: string) => !!SHOW_ME[id];
