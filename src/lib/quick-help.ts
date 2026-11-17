import type { DiagramId } from './diagrams';
import type { Hue } from './theme';

// "What do I do right now?" cards. These ship inside the app, so they work
// the moment it's installed, with no download and no internet.
//
// This app is for when the power or phone service is down, so every card
// assumes you are on your own: what to do now, then how to look after the
// person over the next hours and days.
//
// Writing rules: short sentences, everyday words, one action per step.
// Based on standard first-aid and preparedness guidance (American Red Cross,
// CDC, WHO, Ready.gov). Have a medical professional review before release.

export type QuickHelp = {
  id: string;
  icon: string; // a MaterialCommunityIcons name
  hue: Hue;
  title: string;
  /** One line under the title: how to know this is the right card. */
  when: string;
  /** Do this right now. */
  steps: string[];
  /** A picture to show under a step: step number (counting from 0) to picture. */
  pictures?: Record<number, DiagramId>;
  /** A picture to show with the "next hours and days" notes. */
  nextPicture?: DiagramId;
  /** Looking after them over the next hours and days, with no outside help. */
  next?: string[];
  dont?: string[];
  /** Signs this is beyond home care: do whatever it takes to reach help. */
  danger?: string[];
  /** One extra thing worth knowing. */
  know?: string;
};

export const QUICK_HELP: QuickHelp[] = [
  {
    id: 'bleeding',
    icon: 'water',
    hue: 'red',
    title: 'Bad bleeding',
    when: 'Blood is flowing, spurting or soaking through.',
    steps: [
      'Press hard, right on the wound, with a clean cloth or your bare hand.',
      'Keep pressing for at least 10 minutes. Do not lift to peek.',
      'If blood soaks through, put more cloth on top and press harder.',
      'Arm or leg still pouring blood? Tie a belt or strip of cloth 2 to 3 inches above the wound, not on a joint. Twist it tight with a stick until the bleeding stops. Write down the time.',
      'Lay them down, raise their legs a little, and keep them warm.',
    ],
    pictures: { 3: 'tourniquet' },
    next: [
      'Once it stops, leave the cloth in place and wrap it firmly with a bandage or strips of fabric.',
      'Check the fingers or toes below the wrap. If they turn cold, blue or numb, loosen it slightly.',
      'After a day, rinse the wound gently with boiled, cooled water and put on a clean covering. Do this daily.',
      'Give water to drink in small sips. Rest for at least a day.',
    ],
    dont: [
      'Don’t remove the first cloth.',
      'Don’t pull out anything stuck deep in the wound. Pad around it.',
      'Don’t loosen a tight belt or tourniquet once the bleeding has stopped.',
    ],
    danger: [
      'A tourniquet was needed',
      'Bleeding will not stop after 20 minutes of hard pressure',
      'Later: spreading redness, pus, a bad smell or fever',
    ],
  },
  {
    id: 'cpr',
    icon: 'heart-pulse',
    hue: 'red',
    title: 'Not breathing (CPR)',
    when: 'They won’t wake up and are not breathing normally.',
    steps: [
      'Shout for anyone nearby to come and help you.',
      'Lay them on their back on a hard, flat surface.',
      'Kneel beside them. Put one hand on top of the other in the center of the chest.',
      'Push hard and fast, about 2 inches deep, around 2 pushes every second.',
      'Let the chest come all the way back up between pushes.',
      'After every 30 pushes, tilt the head back, pinch the nose and give 2 breaths, if you are able. If not, just keep pushing.',
      'Swap with another person every 2 minutes so you don’t tire out.',
    ],
    pictures: { 2: 'cpr' },
    nextPicture: 'recovery',
    next: [
      'If they start breathing, roll them onto their side with the head tilted back, and keep them warm.',
      'Stay with them. Check their breathing every minute and be ready to start again.',
      'If there’s a defibrillator (AED) in the building, send someone for it. Turn it on and follow its voice.',
    ],
    know: 'Baby under 1: use two fingers and push about 1.5 inches deep. Cover the nose and mouth with your mouth for small puffs of breath.',
  },
  {
    id: 'choking',
    icon: 'account-alert',
    hue: 'coral',
    title: 'Choking',
    when: 'They can’t talk, cough or breathe.',
    steps: [
      'If they can cough or talk, let them keep coughing.',
      'If they can’t: lean them forward and give 5 firm slaps between the shoulder blades.',
      'Still stuck? Stand behind them. Make a fist just above the belly button, grab it with your other hand, and pull sharply in and up 5 times.',
      'Keep switching: 5 back slaps, 5 pulls, until it comes out.',
      'If they pass out, lay them down and start CPR. Look in the mouth before each breath and remove anything you can see.',
    ],
    next: [
      'Once it’s out, let them sit and breathe quietly. A sore throat and coughing are normal for a while.',
      'Alone and choking? Push your belly hard against the back of a chair or the edge of a table.',
    ],
    danger: ['Belly pain, trouble swallowing or a cough that won’t stop afterwards'],
    know: 'Baby under 1: lay them face down along your arm, give 5 back slaps, then 5 chest pushes with two fingers. No belly thrusts.',
  },
  {
    id: 'burn',
    icon: 'fire',
    hue: 'coral',
    title: 'Burns',
    when: 'Skin burned by heat, hot liquid or steam.',
    steps: [
      'Cool the burn with cool, clean water for 20 minutes. No running water? Pour it slowly from a jug or soak a clean cloth and keep re-wetting it.',
      'Take off rings, watches or tight clothes near it, unless they’re stuck to the skin.',
      'Cover loosely with plastic wrap or a clean, non-fluffy cloth.',
      'Give plenty of water to drink and keep the rest of them warm.',
    ],
    next: [
      'Keep it covered and clean. Change the covering once a day with washed hands.',
      'Raise a burned arm or leg to ease swelling.',
      'For pain, use a pain reliever you already have at home, following the label.',
      'Keep them drinking. Burns dry the body out.',
    ],
    dont: ['No ice.', 'No butter, oil or toothpaste.', 'Don’t pop blisters.'],
    danger: [
      'Bigger than their hand, or on the face, hands, feet or groin',
      'Skin looks white, leathery or charred',
      'Later: spreading redness, pus or fever',
    ],
  },
  {
    id: 'broken-bone',
    icon: 'bone',
    hue: 'brown',
    title: 'Broken bone or bad sprain',
    when: 'Strong pain, swelling, or it looks bent.',
    steps: [
      'Keep it still. Don’t try to straighten it.',
      'Support it the way you found it. Pad it and tie it to something stiff, like a stick or a rolled magazine. Include the joints above and below.',
      'An arm can rest in a sling made from a shirt or scarf.',
      'Put something cold on it, wrapped in cloth, for 20 minutes at a time.',
      'Raise it if that doesn’t hurt more.',
    ],
    next: [
      'Every few hours, check the fingers or toes beyond the injury. They should be warm, pink and able to feel. If not, loosen the ties.',
      'Rest it completely. A sprain eases over days. A break needs weeks in the splint.',
      'For pain, use a pain reliever you already have at home, following the label.',
    ],
    dont: ['Don’t push a bone back in. Cover an open wound with a clean, damp cloth.'],
    danger: [
      'Bone is showing or the limb is badly bent',
      'The hurt is in the head, neck or back: keep them completely still',
      'Fingers or toes stay cold, blue or numb',
    ],
  },
  {
    id: 'heat',
    icon: 'white-balance-sunny',
    hue: 'sun',
    title: 'Overheating',
    when: 'Very hot, confused, dizzy, or stopped sweating.',
    steps: [
      'Get them into shade or the coolest room you have.',
      'Take off extra clothes.',
      'Cool them fast: pour cool water on their skin and fan them.',
      'Put wet cloths on the neck, armpits and groin. Re-wet them often.',
      'If they’re fully awake, give small sips of water.',
    ],
    next: [
      'Keep cooling until they feel cool to the touch and think clearly.',
      'Make a rehydration drink: 1 liter of clean water, 6 level teaspoons of sugar and half a teaspoon of salt. Sip it over a few hours.',
      'Rest in the cool for the rest of the day. No hard work in the heat tomorrow either.',
    ],
    dont: ['Don’t give drinks to someone who is confused or sleepy.'],
    danger: ['Confused, fainting or having a fit', 'Still very hot after 30 minutes of cooling'],
  },
  {
    id: 'cold',
    icon: 'snowflake',
    hue: 'blue',
    title: 'Too cold',
    when: 'Hard shivering, slurred words, clumsy or sleepy.',
    steps: [
      'Get out of the wind, rain and snow.',
      'Take off wet clothes. Put on dry ones.',
      'Wrap them up, head included. Blankets, sleeping bag, coats, anything.',
      'Warm the chest first. Share body heat skin to skin if you need to.',
      'If they’re awake, give warm, sweet drinks and food.',
    ],
    next: [
      'Keep them lying down and handle them gently. Don’t let them walk around until they have stopped shivering and are thinking clearly.',
      'Put warm (not hot) water bottles, wrapped in cloth, at the chest and armpits.',
      'Stay with them for several hours. Keep feeding them.',
    ],
    dont: ['No alcohol.', 'Don’t rub arms and legs.', 'No hot bath.'],
    danger: ['Shivering stops but they are still cold', 'Confused or hard to wake'],
  },
  {
    id: 'water',
    icon: 'cup-water',
    hue: 'blue',
    title: 'Make water safe to drink',
    when: 'Tap is off or you’re not sure the water is clean.',
    steps: [
      'Cloudy? Let it settle, then pour it through a clean cloth or coffee filter.',
      'Best way: bring it to a full rolling boil for 1 minute (3 minutes high in the mountains). Let it cool.',
      'Can’t boil? Use plain, unscented household bleach: 8 drops per gallon of clear water, 16 drops if it’s cloudy.',
      'Stir and wait 30 minutes before drinking.',
      'Store it in clean, covered containers.',
    ],
    next: [
      'Plan on about 1 gallon per person per day for drinking and cooking.',
      'Other safe sources at home: the hot water tank, melted ice cubes, and canned fruit or vegetable juice.',
      'Collect rainwater in clean pots, then treat it the same way.',
    ],
    dont: [
      'Don’t use scented or “splashless” bleach.',
      'Don’t drink from radiators, waterbeds or pools.',
    ],
    know: 'Boiling and bleach kill germs. They don’t remove chemicals or fuel.',
  },
  {
    id: 'lost',
    icon: 'compass',
    hue: 'green',
    title: 'Lost outdoors',
    when: 'You don’t know the way back.',
    steps: [
      'Stop. Sit down, breathe, and stay where you are. People who stay put get found faster.',
      'Stay warm and dry first. Put on layers and get out of wind and rain.',
      'Make yourself easy to spot: open ground, bright clothes, a fire if it’s safe.',
      'Signal in threes: 3 whistle blasts, 3 shouts or 3 flashes. Then wait and repeat.',
      'Sip your water. You can go days without food, so don’t risk eating plants you don’t know.',
    ],
    next: [
      'Before dark, build a simple shelter and a thick bed of leaves or branches to keep you off the cold ground.',
      'Find water. Flowing water is better than still water. Treat it if you can.',
      'If you must move, follow a stream or trail downhill and leave markers behind you.',
    ],
  },
  {
    id: 'power',
    icon: 'flashlight',
    hue: 'violet',
    title: 'Power is out',
    when: 'No electricity and you don’t know for how long.',
    steps: [
      'Use flashlights, not candles.',
      'Keep the fridge and freezer shut. Fridge food stays safe about 4 hours, a full freezer about 2 days.',
      'Unplug TVs and computers so a surge doesn’t fry them.',
      'Save your phone: low power mode, screen dim, airplane mode when there’s no signal anyway.',
      'In the cold, pick one room, close the doors and layer up. In the heat, drink water and stay low and shaded.',
    ],
    next: [
      'Eat fridge food first, then freezer food, then cans and dry food.',
      'Fill pots, bottles and the bathtub with water while the taps still run.',
      'Check on neighbors who are older or live alone. Share what you know.',
    ],
    dont: [
      'Never run a generator, grill or camp stove indoors or in a garage. The fumes can kill.',
      'Don’t eat fridge food that has been warm for more than 4 hours.',
    ],
  },
  {
    id: 'fire',
    icon: 'fire',
    hue: 'coral',
    title: 'Start a fire',
    when: 'You need heat, light, a signal or a way to boil water.',
    steps: [
      'Pick a spot out of the wind, on bare dirt or rock, at least 10 feet from tents, trees and dry grass. Clear the ground around it.',
      'Gather three piles before you light anything: tinder (dry grass, bark shavings, paper, lint), kindling (twigs thinner than a pencil) and fuel (wrist-thick dead wood). Collect twice what you think you need.',
      'Wood must be dead and dry. Good sticks snap cleanly. If it bends, leave it. In wet weather, take dead branches still on the tree and split them to reach the dry middle.',
      'Make a loose ball of tinder the size of your fist. Lean kindling over it like a small tent, leaving gaps for air.',
      'Light the tinder low, on the side the wind comes from. Blow gently at the base.',
      'Add bigger sticks slowly as each size catches. Fire needs air, so don’t smother it.',
    ],
    next: [
      'No matches or lighter? Touch both ends of a battery with steel wool or a foil gum wrapper, focus sunlight through glasses or a clear water bottle, or strike sparks from a fire steel into very fine tinder.',
      'Keep spare tinder and kindling dry, inside your jacket or under cover, for the next fire.',
      'To keep it going all night, feed it thick logs and build a wall of logs or rocks behind it to throw heat toward you.',
      'To put it out: spread the coals, pour on water, stir, and repeat until you can hold your hand on the ashes.',
    ],
    dont: [
      'Never light a fire inside a tent, car or closed room. The smoke and fumes can kill.',
      'Don’t use gasoline to start it.',
      'Don’t leave it burning with no one watching.',
      'Don’t use wet or river rocks around the fire. They can burst.',
    ],
    know: 'Small fires are easier to light, use less wood and are easier to sit close to. Two small fires warm you better than one big one.',
  },
  {
    id: 'shelter',
    icon: 'tent',
    hue: 'brown',
    title: 'Build a shelter',
    when: 'You have to spend the night outside, or your home has no heat.',
    steps: [
      'Start at least 2 hours before dark. Cold, wind and wet are the danger, so shelter comes before food.',
      'Pick the spot: dry, flat, out of the wind, away from dead trees, cliffs, and river banks that can flood.',
      'Use what is already there first: a car, a rock overhang, a fallen tree, a thick evergreen. Improving something is faster than building.',
      'Simple lean-to: rest a long pole on a low branch or between two trees. Lean sticks against one side, close together. Pile on leaves, grass, bark or branches as thick as your arm is long.',
      'Keep it small. It should be just big enough to lie in. Your body heat warms a small space.',
      'Make a bed first: at least a hand’s length of dry leaves, grass or branches under you. The cold ground steals heat faster than the air.',
      'Block the opening with a pack, branches or more leaves.',
    ],
    next: [
      'Have a tarp, poncho or trash bags? Tie a line between two trees, hang the tarp over it and weigh down the edges with rocks or logs.',
      'In snow: dig into a deep drift or the hollow under a big evergreen. Keep a fist-sized air hole open and mark the outside so people can find you.',
      'In hot sun: make shade and stay off the hot ground. Rest by day and work at dawn and dusk.',
      'At home with no heat: move everyone into one small room, hang blankets over doors and windows, and build a blanket tent over the bed or table.',
    ],
    dont: [
      'Don’t sleep directly on the ground.',
      'Don’t burn anything inside a small shelter. Put the fire outside the opening.',
      'Don’t build in a dry riverbed or at the very bottom of a valley, where water and cold air collect.',
    ],
  },
  {
    id: 'find-water',
    icon: 'water-plus',
    hue: 'blue',
    title: 'Find water',
    when: 'The taps are dry or you are away from home with none left.',
    steps: [
      'At home first: the water heater tank, the toilet tank (not the bowl), melted ice cubes, and liquid from canned food are all usable.',
      'Catch rain. Spread a tarp, sheet or trash bags to run into pots and buckets. Rain you catch yourself is the safest wild water.',
      'Outdoors, walk downhill. Water collects in valleys. Look for green plants, animal trails, and swarms of insects.',
      'Flowing water is better than still water. Clear is better than cloudy. Take it upstream of camps, roads and animals.',
      'No surface water? Dig a hole in a damp, low spot or on the outside bend of a dry stream. Wait for it to fill.',
      'At dawn, wipe dew off grass with a cloth and wring it into a cup.',
      'Treat it before drinking. See the card “Make water safe to drink”.',
    ],
    next: [
      'Each person needs about 1 gallon a day for drinking and cooking. More in heat.',
      'Sip steadily. Don’t ration water until you are sick. Save sweat instead: rest in shade and work when it is cool.',
      'Store water in clean, covered containers, out of the sun.',
    ],
    dont: [
      'Never drink sea water, urine, pool water, or water from a car radiator.',
      'Don’t drink flood water. It carries sewage and chemicals that boiling does not remove.',
      'Don’t eat snow as it is. Melt it first, or it chills your body.',
    ],
  },
  {
    id: 'signal',
    icon: 'bullhorn',
    hue: 'sun',
    title: 'Signal for help',
    when: 'You need people to find you and phones don’t work.',
    steps: [
      'Three of anything means “help”: 3 whistle blasts, 3 shouts, 3 flashes, 3 fires. Pause, then repeat.',
      'Get into the open, as high as is safe: a clearing, hilltop, shoreline or roof.',
      'By day, use a mirror, phone screen or any shiny metal to flash sunlight at planes, boats or distant people.',
      'Make smoke by day: add green leaves or damp grass to a hot fire. Make bright flame by night.',
      'Write big on the ground with rocks, logs or clothes: SOS or a large X, each letter longer than a car, in a color that stands out.',
      'Hang bright cloth where it moves in the wind.',
    ],
    next: [
      'A whistle carries much farther than your voice and saves your strength. Blow it every few minutes.',
      'At night, flash a light in threes, or SOS: 3 short, 3 long, 3 short.',
      'Trapped in a building: bang on a pipe or wall 3 times, pause, repeat. Hang a sheet out of a window.',
      'Have a radio? Listen on the hour to save the battery. Family radios: try channel 1. CB: channel 9. Marine: channel 16.',
      'Stay where you are once you have signaled, and leave notes or arrows if you must move.',
    ],
    dont: [
      'Don’t shout until you are hoarse. Use a whistle or bang on something.',
      'Don’t wander at night.',
    ],
  },
  {
    id: 'warm',
    icon: 'radiator-off',
    hue: 'coral',
    title: 'Stay warm with no heat',
    when: 'It’s cold and the heating is off, or you are outside.',
    steps: [
      'Put on layers now, before you feel cold: a snug layer next to the skin, a thick loose layer, and something that blocks wind on top.',
      'Cover your head, neck, hands and feet. Dry socks matter most.',
      'Stay dry. Wet clothes pull heat out fast, so change out of anything damp, including sweat.',
      'Pick the smallest room, on the sunny side. Close the doors. Hang blankets over windows and doorways, and push towels against gaps.',
      'Get off the floor. Sit and sleep on cushions, cardboard or folded blankets.',
      'Share warmth. Everyone, pets included, in one room or under one pile of blankets.',
      'Eat and drink. Warm, sweet drinks and fatty food help your body make heat.',
    ],
    next: [
      'Fill bottles with warm water and tuck them against your chest and thighs, wrapped in cloth.',
      'Move a little every hour to warm up, but not enough to sweat.',
      'Open curtains on sunny windows by day and cover them again at dusk.',
      'Let taps drip and open cabinet doors under sinks so pipes don’t freeze.',
    ],
    dont: [
      'Never heat the house with a gas oven, grill, camp stove or generator indoors. The fumes can kill without any smell.',
      'Don’t drink alcohol to warm up. It makes you lose heat faster.',
      'Don’t leave candles burning while you sleep.',
    ],
    danger: [
      'Strong shivering that then stops',
      'Slurred words, clumsiness, confusion or unusual sleepiness',
      'White, hard or numb fingers, toes, nose or ears',
    ],
  },
  {
    id: 'snake-bite',
    icon: 'snake',
    hue: 'green',
    title: 'Snake bite',
    when: 'Someone was bitten and you can’t be sure the snake was harmless.',
    steps: [
      'Move away from the snake. Don’t try to catch or kill it.',
      'Keep them calm and still. Sit or lay them down. Moving spreads venom faster.',
      'Take off rings, watches, shoes and tight clothes near the bite before it swells.',
      'Keep the bitten arm or leg still, at about the level of the heart. Splint it loosely like a broken bone.',
      'Wash the bite gently with clean water and cover it with a clean, dry cloth.',
      'Mark the edge of the swelling on the skin with a pen and write the time. Mark it again every 30 minutes.',
      'Get them to medical care if there is any way to. Carry them or bring a vehicle to them rather than have them walk.',
    ],
    next: [
      'Give small sips of water. Watch their breathing.',
      'Remember what the snake looked like: color, pattern, head shape. Don’t go back for it.',
      'Many bites inject little or no venom. Stay still and keep watching for 24 hours anyway.',
      'If they stop breathing, start CPR.',
    ],
    dont: [
      'Don’t cut the bite or try to suck out venom.',
      'Don’t tie a tight band or tourniquet.',
      'Don’t put ice on it.',
      'Don’t give alcohol, coffee or painkillers like aspirin or ibuprofen.',
    ],
    danger: [
      'Swelling that keeps spreading past your pen marks',
      'Trouble breathing, swallowing or speaking',
      'Drooping eyelids, blurred vision or weakness',
      'Bleeding from the gums or nose, or dark urine',
      'Fainting, vomiting or strong belly pain',
    ],
  },
];

export const findQuickHelp = (id: string) => QUICK_HELP.find((h) => h.id === id);
