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
  fireFeedA: require('../../assets/show/fire-feed-a.png'),
  fireFeedB: require('../../assets/show/fire-feed-b.png'),
  fireLightA: require('../../assets/show/fire-light-a.png'),
  fireLightB: require('../../assets/show/fire-light-b.png'),
  fireNoTent: require('../../assets/show/fire-no-tent.png'),
  firePiles: require('../../assets/show/fire-piles.png'),
  fireSnapA: require('../../assets/show/fire-snap-a.png'),
  fireSnapB: require('../../assets/show/fire-snap-b.png'),
  fireSpot: require('../../assets/show/fire-spot.png'),
  fireTent: require('../../assets/show/fire-tent.png'),
  foodBin: require('../../assets/show/food-bin.png'),
  foodCookA: require('../../assets/show/food-cook-a.png'),
  foodCookB: require('../../assets/show/food-cook-b.png'),
  foodCooler: require('../../assets/show/food-cooler.png'),
  foodFreezer: require('../../assets/show/food-freezer.png'),
  foodShut: require('../../assets/show/food-shut.png'),
  lightCeiling: require('../../assets/show/light-ceiling.png'),
  lightJug: require('../../assets/show/light-jug.png'),
  lightLampA: require('../../assets/show/light-lamp-a.png'),
  lightLampB: require('../../assets/show/light-lamp-b.png'),
  lightNoSleep: require('../../assets/show/light-no-sleep.png'),
  lightOil: require('../../assets/show/light-oil.png'),
  saveFillA: require('../../assets/show/save-fill-a.png'),
  saveFillB: require('../../assets/show/save-fill-b.png'),
  saveGallon: require('../../assets/show/save-gallon.png'),
  saveHeater: require('../../assets/show/save-heater.png'),
  saveRainA: require('../../assets/show/save-rain-a.png'),
  saveRainB: require('../../assets/show/save-rain-b.png'),
  saveTub: require('../../assets/show/save-tub.png'),
  toiletBags: require('../../assets/show/toilet-bags.png'),
  toiletCoverA: require('../../assets/show/toilet-cover-a.png'),
  toiletCoverB: require('../../assets/show/toilet-cover-b.png'),
  toiletFlushA: require('../../assets/show/toilet-flush-a.png'),
  toiletFlushB: require('../../assets/show/toilet-flush-b.png'),
  toiletTie: require('../../assets/show/toilet-tie.png'),
  washHandsA: require('../../assets/show/wash-hands-a.png'),
  washHandsB: require('../../assets/show/wash-hands-b.png'),
  cookBricksA: require('../../assets/show/cook-bricks-a.png'),
  cookBricksB: require('../../assets/show/cook-bricks-b.png'),
  cookLid: require('../../assets/show/cook-lid.png'),
  cookMatch: require('../../assets/show/cook-match.png'),
  cookOutside: require('../../assets/show/cook-outside.png'),
  cookSoak: require('../../assets/show/cook-soak.png'),
  coolCurtain: require('../../assets/show/cool-curtain.png'),
  coolLow: require('../../assets/show/cool-low.png'),
  coolNight: require('../../assets/show/cool-night.png'),
  coolNoCar: require('../../assets/show/cool-no-car.png'),
  findwDewA: require('../../assets/show/findw-dew-a.png'),
  findwDewB: require('../../assets/show/findw-dew-b.png'),
  findwDigA: require('../../assets/show/findw-dig-a.png'),
  findwDigB: require('../../assets/show/findw-dig-b.png'),
  findwDownhill: require('../../assets/show/findw-downhill.png'),
  findwFlow: require('../../assets/show/findw-flow.png'),
  findwTarpA: require('../../assets/show/findw-tarp-a.png'),
  findwTarpB: require('../../assets/show/findw-tarp-b.png'),
  phoneAirplane: require('../../assets/show/phone-airplane.png'),
  phoneCar: require('../../assets/show/phone-car.png'),
  phonePaper: require('../../assets/show/phone-paper.png'),
  phoneTemp: require('../../assets/show/phone-temp.png'),
  shelterBed: require('../../assets/show/shelter-bed.png'),
  shelterCoverA: require('../../assets/show/shelter-cover-a.png'),
  shelterCoverB: require('../../assets/show/shelter-cover-b.png'),
  shelterDone: require('../../assets/show/shelter-done.png'),
  shelterEarly: require('../../assets/show/shelter-early.png'),
  shelterFrame: require('../../assets/show/shelter-frame.png'),
  shelterSpot: require('../../assets/show/shelter-spot.png'),
  signalCloth: require('../../assets/show/signal-cloth.png'),
  signalHighA: require('../../assets/show/signal-high-a.png'),
  signalHighB: require('../../assets/show/signal-high-b.png'),
  signalMirrorA: require('../../assets/show/signal-mirror-a.png'),
  signalMirrorB: require('../../assets/show/signal-mirror-b.png'),
  signalSmokeA: require('../../assets/show/signal-smoke-a.png'),
  signalSmokeB: require('../../assets/show/signal-smoke-b.png'),
  signalSos: require('../../assets/show/signal-sos.png'),
  snakeAway: require('../../assets/show/snake-away.png'),
  snakeCarry: require('../../assets/show/snake-carry.png'),
  snakeMark: require('../../assets/show/snake-mark.png'),
  snakeNoCut: require('../../assets/show/snake-no-cut.png'),
  snakeStill: require('../../assets/show/snake-still.png'),
  warmCover: require('../../assets/show/warm-cover.png'),
  warmFloor: require('../../assets/show/warm-floor.png'),
  warmLayers: require('../../assets/show/warm-layers.png'),
  warmRoom: require('../../assets/show/warm-room.png'),
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
    { say: 'Lay them down and keep them warm.', pics: [P.layFlat] },
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
  toilet: [
    {
      say: 'Have spare water? Pour a bucket into the bowl. That flushes it.',
      pics: [P.toiletFlushA, P.toiletFlushB],
      holdMs: 900,
    },
    { say: 'No water? Line the dry bowl or a bucket with 2 trash bags.', pics: [P.toiletBags] },
    {
      say: 'After every use, cover it with a cup of dirt, ash, sawdust or cat litter.',
      pics: [P.toiletCoverA, P.toiletCoverB],
      holdMs: 800,
    },
    {
      say: 'Half full? Tie the bag shut. Put it in a bin with a lid, outside.',
      pics: [P.toiletTie],
    },
    {
      say: 'Wash your hands every time.',
      pics: [P.washHandsA, P.washHandsB],
      holdMs: 700,
    },
  ],
  light: [
    { say: 'Use a flashlight first. It is the safest light you have.', pics: [P.powerLight] },
    {
      say: 'To light a whole room, stand it up and point it at the ceiling.',
      pics: [P.lightCeiling],
    },
    { say: 'Or strap a headlamp to a full water jug, light facing in.', pics: [P.lightJug] },
    {
      say: 'No batteries? Half fill a jar with cooking oil. Poke a cloth strip through foil and rest it on the oil.',
      pics: [P.lightOil],
    },
    {
      say: 'Let it soak for 5 minutes, then light it. Stand the jar on a plate.',
      pics: [P.lightLampA, P.lightLampB],
      holdMs: 700,
      minutes: 5,
    },
    { say: 'Never leave a flame burning when you sleep.', pics: [P.lightNoSleep] },
  ],
  'food-cold': [
    { say: 'Keep the fridge and freezer shut.', pics: [P.foodShut] },
    { say: 'A closed fridge keeps food safe for about 4 hours.', pics: [P.powerFridge] },
    { say: 'A full freezer lasts about 2 days. Do not open it to check.', pics: [P.foodFreezer] },
    {
      say: 'Before 4 hours are up, move milk, meat and eggs into a cooler with ice.',
      pics: [P.foodCooler],
    },
    {
      say: 'Cook thawing meat while it is still cold, and eat it today.',
      pics: [P.foodCookA, P.foodCookB],
      holdMs: 800,
    },
    { say: 'Not sure? Do not taste it. Throw it out.', pics: [P.foodBin] },
  ],
  'store-water': [
    {
      say: 'Fill every clean pot, bottle and jug right now.',
      pics: [P.saveFillA, P.saveFillB],
      holdMs: 900,
    },
    { say: 'Fill the bathtub. That water is for washing and flushing.', pics: [P.saveTub] },
    { say: 'Plan on 1 gallon for each person, each day.', pics: [P.saveGallon] },
    {
      say: 'Your water heater is full of clean water. Turn off its power or gas and let it cool. Then open the tap at the bottom.',
      pics: [P.saveHeater],
    },
    {
      say: 'Put out buckets to catch rain.',
      pics: [P.saveRainA, P.saveRainB],
      holdMs: 600,
    },
    {
      say: 'Boil rain and tub water before you drink it.',
      pics: [P.waterBoilA, P.waterBoilB],
      holdMs: 700,
    },
  ],
  fire: [
    {
      say: 'Pick bare dirt, out of the wind, 10 feet from trees and tents.',
      pics: [P.fireSpot],
    },
    {
      say: 'Gather 3 piles first: dry grass, thin twigs, and thick wood.',
      pics: [P.firePiles],
    },
    {
      say: 'Use dry wood. Good sticks snap. If it bends, leave it.',
      pics: [P.fireSnapA, P.fireSnapB],
      holdMs: 1000,
    },
    {
      say: 'Make a ball of dry grass the size of your fist. Lean twigs over it like a tent.',
      pics: [P.fireTent],
    },
    {
      say: 'Light it low, on the side the wind comes from. Blow gently.',
      pics: [P.fireLightA, P.fireLightB],
      holdMs: 800,
    },
    {
      say: 'Add bigger sticks slowly. Leave gaps for air.',
      pics: [P.fireFeedA, P.fireFeedB],
      holdMs: 900,
    },
    { say: 'Never light a fire in a tent, car or closed room.', pics: [P.fireNoTent] },
  ],
  shelter: [
    { say: 'Start 2 hours before dark. Shelter comes before food.', pics: [P.shelterEarly] },
    {
      say: 'Pick a dry, flat spot out of the wind. Stay away from dead trees and rivers.',
      pics: [P.shelterSpot],
    },
    {
      say: 'Rest a long pole between two trees. Lean sticks against one side, close together.',
      pics: [P.shelterFrame],
    },
    {
      say: 'Pile on leaves and branches, as thick as your arm is long.',
      pics: [P.shelterCoverA, P.shelterCoverB],
      holdMs: 1100,
    },
    {
      say: 'Make a thick bed of dry leaves first. The ground steals your heat.',
      pics: [P.shelterBed],
    },
    {
      say: 'Keep it small. Block the opening. Any fire stays outside.',
      pics: [P.shelterDone],
    },
  ],
  'find-water': [
    {
      say: 'At home, drain the water heater once it is cool. Melted ice and liquid from cans are good too.',
      pics: [P.saveHeater],
    },
    {
      say: 'Catch rain. Hang a tarp or sheet so it runs into a bucket.',
      pics: [P.findwTarpA, P.findwTarpB],
      holdMs: 700,
    },
    { say: 'Outdoors, walk downhill. Look for green plants.', pics: [P.findwDownhill] },
    { say: 'Pick flowing, clear water over still, cloudy water.', pics: [P.findwFlow] },
    {
      say: 'No water? Dig a hole in a damp, low spot. Wait for it to fill.',
      pics: [P.findwDigA, P.findwDigB],
      holdMs: 1500,
    },
    {
      say: 'At dawn, wipe dew off the grass with a cloth. Wring it into a cup.',
      pics: [P.findwDewA, P.findwDewB],
      holdMs: 1200,
    },
    {
      say: 'Make it safe before you drink. Boil it for 1 minute.',
      pics: [P.waterBoilA, P.waterBoilB],
      holdMs: 700,
    },
  ],
  signal: [
    {
      say: 'Three of anything means help. 3 whistles, 3 shouts or 3 flashes. Wait, then do it again.',
      pics: [P.lostThreeA, P.lostThreeB, P.lostThreeC],
      holdMs: 700,
    },
    {
      say: 'Get into the open, as high as is safe.',
      pics: [P.signalHighA, P.signalHighB],
      holdMs: 700,
    },
    {
      say: 'By day, flash sunlight with a mirror or your phone screen.',
      pics: [P.signalMirrorA, P.signalMirrorB],
      holdMs: 600,
    },
    {
      say: 'Make smoke by day. Put green leaves on a hot fire.',
      pics: [P.signalSmokeA, P.signalSmokeB],
      holdMs: 900,
    },
    {
      say: 'Write SOS on the ground with rocks or clothes. Make each letter longer than a car.',
      pics: [P.signalSos],
    },
    { say: 'Hang bright cloth where it moves in the wind.', pics: [P.signalCloth] },
  ],
  warm: [
    {
      say: 'Put on layers now. Snug next to your skin, thick in the middle, windproof on top.',
      pics: [P.warmLayers],
    },
    { say: 'Cover your head, neck, hands and feet.', pics: [P.warmCover] },
    { say: 'Stay dry. Change out of anything damp.', pics: [P.coldDry] },
    {
      say: 'Pick the smallest room. Close the door. Hang blankets over the windows.',
      pics: [P.warmRoom],
    },
    { say: 'Get off the floor. Sit and sleep on cushions or cardboard.', pics: [P.warmFloor] },
    { say: 'Share warmth. Everyone under one pile of blankets.', pics: [P.coldShare] },
    {
      say: 'Eat, and have warm, sweet drinks.',
      pics: [P.warmDrinkA, P.warmDrinkB],
      holdMs: 1200,
    },
    {
      say: 'Never heat the house with a grill, camp stove or generator. The fumes can kill.',
      pics: [P.powerNoGenerator],
    },
  ],
  'snake-bite': [
    { say: 'Move away from the snake. Do not try to catch it.', pics: [P.snakeAway] },
    { say: 'Lay them down. Keep them calm and still.', pics: [P.snakeStill] },
    {
      say: 'Take off rings, watches and anything tight before it swells.',
      pics: [P.burnRings],
    },
    {
      say: 'Keep the bitten arm or leg still, level with the heart. Splint it loosely.',
      pics: [P.boneSplint],
    },
    { say: 'Wash the bite gently. Cover it with a clean, dry cloth.', pics: [P.burnCover] },
    {
      say: 'Mark the edge of the swelling with a pen and write the time. Mark it again every 30 minutes.',
      pics: [P.snakeMark],
      minutes: 30,
    },
    { say: 'Do not cut it, suck it, ice it or tie it tight.', pics: [P.snakeNoCut] },
    { say: 'Get them to care if you can. Carry them. Do not let them walk.', pics: [P.snakeCarry] },
  ],
  cook: [
    {
      say: 'Cook outside, well away from doors and windows.',
      pics: [P.cookOutside],
    },
    {
      say: 'A gas stovetop may still work. Turn the knob and light it with a match.',
      pics: [P.cookMatch],
    },
    {
      say: 'No stove? Build a small fire between two rows of bricks. Rest the pot on top.',
      pics: [P.cookBricksA, P.cookBricksB],
      holdMs: 800,
    },
    { say: 'Put a lid on every pot. It cooks faster and saves fuel.', pics: [P.cookLid] },
    { say: 'Cut food small. Soak rice and beans in water first.', pics: [P.cookSoak] },
    {
      say: 'Boil water for 1 minute to make it safe to drink.',
      pics: [P.waterBoilA, P.waterBoilB],
      holdMs: 700,
      minutes: 1,
    },
    {
      say: 'Never use a grill or camp stove indoors. The fumes can kill.',
      pics: [P.powerNoGenerator],
    },
  ],
  cool: [
    { say: 'Sip water all day, before you feel thirsty.', pics: [P.sipA, P.sipB], holdMs: 1200 },
    { say: 'Put a wet cloth on your neck, wrists and head.', pics: [P.heatCloths] },
    { say: 'Close curtains on sunny windows during the day.', pics: [P.coolCurtain] },
    { say: 'Go low. The lowest floor is the coolest.', pics: [P.coolLow] },
    {
      say: 'At night, open windows on both sides so air moves through.',
      pics: [P.coolNight],
    },
    { say: 'Rest in the shade in the hottest hours.', pics: [P.heatShade] },
    { say: 'Never leave a child or a pet in a parked car.', pics: [P.coolNoCar] },
  ],
  phone: [
    { say: 'Turn on Low Power Mode. Turn the screen all the way down.', pics: [P.powerPhone] },
    {
      say: 'Turn on Airplane Mode. Check for signal only at set times.',
      pics: [P.phoneAirplane],
    },
    { say: 'Write the key steps on paper. Then close the app.', pics: [P.phonePaper] },
    {
      say: 'Keep the phone warm in the cold and shaded in the heat.',
      pics: [P.phoneTemp],
    },
    {
      say: 'Charge from a car, with the engine running outside. Never in a garage.',
      pics: [P.phoneCar],
    },
  ],
};

export const hasShowMe = (id: string) => !!SHOW_ME[id];
