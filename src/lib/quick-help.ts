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
];

export const findQuickHelp = (id: string) => QUICK_HELP.find((h) => h.id === id);
