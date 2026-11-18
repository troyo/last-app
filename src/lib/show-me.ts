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
  burnCoolA: require('../../assets/show/burn-cool-a.png'),
  burnCoolB: require('../../assets/show/burn-cool-b.png'),
  burnRings: require('../../assets/show/burn-rings.png'),
  burnCover: require('../../assets/show/burn-cover.png'),
  burnNoIce: require('../../assets/show/burn-no-ice.png'),
  sipA: require('../../assets/show/sip-a.png'),
  sipB: require('../../assets/show/sip-b.png'),
  warmDrinkA: require('../../assets/show/warm-drink-a.png'),
  warmDrinkB: require('../../assets/show/warm-drink-b.png'),
  boneStill: require('../../assets/show/bone-still.png'),
  boneSplint: require('../../assets/show/bone-splint.png'),
  boneCold: require('../../assets/show/bone-cold.png'),
  boneSling: require('../../assets/show/bone-sling.png'),
  heatShade: require('../../assets/show/heat-shade.png'),
  heatCoolA: require('../../assets/show/heat-cool-a.png'),
  heatCoolB: require('../../assets/show/heat-cool-b.png'),
  heatCloths: require('../../assets/show/heat-cloths.png'),
  coldInsideA: require('../../assets/show/cold-inside-a.png'),
  coldInsideB: require('../../assets/show/cold-inside-b.png'),
  coldDry: require('../../assets/show/cold-dry.png'),
  coldWrap: require('../../assets/show/cold-wrap.png'),
  coldShare: require('../../assets/show/cold-share.png'),
  lostSignalA: require('../../assets/show/lost-signal-a.png'),
  lostSignalB: require('../../assets/show/lost-signal-b.png'),
  lostStop: require('../../assets/show/lost-stop.png'),
  lostThreeA: require('../../assets/show/lost-three-a.png'),
  lostThreeB: require('../../assets/show/lost-three-b.png'),
  lostThreeC: require('../../assets/show/lost-three-c.png'),
  lostWarm: require('../../assets/show/lost-warm.png'),
  powerFridge: require('../../assets/show/power-fridge.png'),
  powerLight: require('../../assets/show/power-light.png'),
  powerNoCandle: require('../../assets/show/power-no-candle.png'),
  powerNoGenerator: require('../../assets/show/power-no-generator.png'),
  powerPhone: require('../../assets/show/power-phone.png'),
  powerUnplug: require('../../assets/show/power-unplug.png'),
  waterBleach: require('../../assets/show/water-bleach.png'),
  waterBoilA: require('../../assets/show/water-boil-a.png'),
  waterBoilB: require('../../assets/show/water-boil-b.png'),
  waterFilter: require('../../assets/show/water-filter.png'),
  waterStore: require('../../assets/show/water-store.png'),
  waterWait: require('../../assets/show/water-wait.png'),
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
  burn: [
    {
      say: 'Pour cool, clean water over the burn for 20 minutes.',
      pics: [P.burnCoolA, P.burnCoolB],
      holdMs: 700,
      minutes: 20,
    },
    { say: 'Take off rings and watches near it, unless they are stuck.', pics: [P.burnRings] },
    { say: 'Cover it loosely with plastic wrap or a clean cloth.', pics: [P.burnCover] },
    { say: 'No ice. No butter or oil. Do not pop blisters.', pics: [P.burnNoIce] },
    { say: 'Give them water to drink. Keep them warm.', pics: [P.sipA, P.sipB], holdMs: 1200 },
  ],
  'broken-bone': [
    { say: 'Keep it still. Rest it on something soft. Do not straighten it.', pics: [P.boneStill] },
    {
      say: 'Tie it to something stiff, like a stick. Put padding in between. Not too tight.',
      pics: [P.boneSplint],
    },
    { say: 'An arm can rest in a sling made from a shirt.', pics: [P.boneSling] },
    {
      say: 'Put something cold on it, wrapped in cloth, for 20 minutes.',
      pics: [P.boneSplint, P.boneCold],
      holdMs: 1400,
      minutes: 20,
    },
  ],
  heat: [
    { say: 'Get them into shade. Take off extra clothes.', pics: [P.heatShade] },
    {
      say: 'Pour cool water on their skin and fan them.',
      pics: [P.heatCoolA, P.heatCoolB],
      holdMs: 600,
    },
    { say: 'Put wet cloths on the neck, armpits and groin.', pics: [P.heatCloths] },
    {
      say: 'Fully awake? Give small sips of water. Sleepy or confused? No drinks.',
      pics: [P.sipA, P.sipB],
      holdMs: 1200,
    },
  ],
  cold: [
    {
      say: 'Get out of the wind, rain and snow.',
      pics: [P.coldInsideA, P.coldInsideB],
      holdMs: 800,
    },
    { say: 'Take off wet clothes. Put on dry ones.', pics: [P.coldDry] },
    { say: 'Wrap them up in blankets or coats. Cover the head too.', pics: [P.coldWrap] },
    {
      say: 'Still cold? Get under the blanket with them and share your body heat.',
      pics: [P.coldShare],
    },
    {
      say: 'Awake? Give warm, sweet drinks and food. No alcohol.',
      pics: [P.warmDrinkA, P.warmDrinkB],
      holdMs: 1200,
    },
  ],
  water: [
    { say: 'Cloudy water? Pour it through a clean cloth first.', pics: [P.waterFilter] },
    {
      say: 'Best way: boil it. Big bubbles for 1 minute. Then let it cool.',
      pics: [P.waterBoilA, P.waterBoilB],
      holdMs: 500,
      minutes: 1,
    },
    {
      say: 'Can’t boil? Add plain bleach with no scent. Check the label. 6 percent bleach: 8 drops for each gallon. 8 percent bleach: 6 drops. Double it if the water is cloudy.',
      pics: [P.waterBleach],
    },
    { say: 'Stir it. Wait 30 minutes before you drink.', pics: [P.waterWait], minutes: 30 },
    { say: 'Keep it in clean containers with the lids on.', pics: [P.waterStore] },
  ],
  lost: [
    {
      say: 'Stop. Sit down. Stay where you are. People who stay put get found faster.',
      pics: [P.lostStop],
    },
    { say: 'Stay warm and dry. Put on layers. Get out of the wind and rain.', pics: [P.lostWarm] },
    {
      say: 'Make yourself easy to see. Open ground. Bright clothes. Wave something bright.',
      pics: [P.lostSignalA, P.lostSignalB],
      holdMs: 700,
    },
    {
      say: 'Signal in threes. 3 whistles, 3 shouts or 3 flashes. Wait, then do it again.',
      pics: [P.lostThreeA, P.lostThreeB, P.lostThreeC],
      holdMs: 700,
    },
    {
      say: 'Sip your water. Do not eat plants you don’t know.',
      pics: [P.sipA, P.sipB],
      holdMs: 1200,
    },
  ],
  power: [
    { say: 'Use flashlights, not candles.', pics: [P.powerLight, P.powerNoCandle], holdMs: 1600 },
    {
      say: 'Keep the fridge shut. Food stays safe for about 4 hours.',
      pics: [P.powerFridge],
    },
    { say: 'Unplug TVs and computers.', pics: [P.powerUnplug] },
    { say: 'Save your phone battery. Low power mode. Screen dim.', pics: [P.powerPhone] },
    {
      say: 'Never run a generator, grill or camp stove indoors. The fumes can kill.',
      pics: [P.powerNoGenerator],
    },
  ],
};

export const hasShowMe = (id: string) => !!SHOW_ME[id];
