// "What do I do right now?" cards. These ship inside the app, so they work
// the moment it's installed, with no download and no internet.
//
// Writing rules: short sentences, everyday words, one action per step.
// Based on standard first-aid and preparedness guidance (American Red Cross,
// CDC, Ready.gov). Have a medical professional review before public release.

export type QuickHelp = {
  id: string;
  icon: string;
  title: string;
  /** One line under the title: how to know this is the right card. */
  when: string;
  /** Show the "Call 911" banner at the top. */
  call?: string;
  steps: string[];
  dont?: string[];
  /** When to get professional help, in plain words. */
  getHelp?: string;
};

export const QUICK_HELP: QuickHelp[] = [
  {
    id: 'bleeding',
    icon: '🩸',
    title: 'Bad bleeding',
    when: 'Blood is flowing, spurting or soaking through.',
    call: 'Call 911 or have someone call while you help.',
    steps: [
      'Press hard, right on the wound, with a clean cloth or your hand.',
      'Keep pressing. Do not lift to peek.',
      'If blood soaks through, put more cloth on top and press harder.',
      'Arm or leg still pouring blood? Tie a tourniquet (or a belt) 2 to 3 inches above the wound, not on a joint. Tighten until the bleeding stops. Note the time.',
      'Lay them down and keep them warm until help comes.',
    ],
    dont: ['Don’t remove the first cloth.', 'Don’t pull out anything stuck in the wound.'],
  },
  {
    id: 'cpr',
    icon: '❤️',
    title: 'Not breathing (CPR)',
    when: 'They won’t wake up and are not breathing normally.',
    call: 'Call 911 first. Put the phone on speaker.',
    steps: [
      'Lay them on their back on a hard, flat surface.',
      'Kneel beside them. Put one hand on top of the other in the center of the chest.',
      'Push hard and fast, about 2 inches deep, around 2 pushes every second.',
      'Let the chest come all the way back up between pushes.',
      'Keep going. Don’t stop until help arrives or they start breathing.',
      'If there’s an AED (defibrillator) nearby, send someone for it, turn it on and follow its voice.',
    ],
    getHelp: 'For a baby, use two fingers and push about 1.5 inches deep.',
  },
  {
    id: 'choking',
    icon: '😮',
    title: 'Choking',
    when: 'They can’t talk, cough or breathe.',
    steps: [
      'If they can cough or talk, let them keep coughing.',
      'If they can’t: lean them forward and give 5 firm slaps between the shoulder blades.',
      'Still stuck? Stand behind them. Make a fist just above the belly button, grab it with your other hand, and pull sharply in and up 5 times.',
      'Keep switching: 5 back slaps, 5 pulls, until it comes out.',
      'If they pass out, call 911 and start CPR.',
    ],
    getHelp:
      'Baby under 1: lay them face down along your arm, give 5 back slaps, then 5 chest pushes with two fingers. No belly thrusts.',
  },
  {
    id: 'burn',
    icon: '🔥',
    title: 'Burns',
    when: 'Skin burned by heat, hot liquid or steam.',
    steps: [
      'Hold the burn under cool running water for 20 minutes.',
      'Take off rings, watches or tight clothes near it, unless they’re stuck to the skin.',
      'Cover loosely with a clean cloth or plastic wrap.',
      'Give sips of water and keep them warm.',
    ],
    dont: ['No ice.', 'No butter, oil or toothpaste.', 'Don’t pop blisters.'],
    getHelp:
      'Get medical help if the burn is bigger than their hand, on the face, hands or groin, or looks white or charred.',
  },
  {
    id: 'broken-bone',
    icon: '🦴',
    title: 'Broken bone or bad sprain',
    when: 'Strong pain, swelling, or it looks bent.',
    steps: [
      'Keep it still. Don’t try to straighten it.',
      'Support it the way you found it. Pad it and tie it to something stiff (a stick, a rolled magazine).',
      'Put something cold on it, wrapped in cloth, for 20 minutes at a time.',
      'Raise it if that doesn’t hurt more.',
    ],
    getHelp:
      'Call 911 if bone is showing, the hurt is in the head, neck or back, or the limb is numb, cold or blue.',
  },
  {
    id: 'heat',
    icon: '🥵',
    title: 'Overheating',
    when: 'Very hot, confused, dizzy, or stopped sweating.',
    call: 'Confused or passing out? Call 911. This is an emergency.',
    steps: [
      'Get them into shade or a cool room.',
      'Take off extra clothes.',
      'Cool them fast: pour cool water on their skin and fan them.',
      'Put cold packs or wet cloths on the neck, armpits and groin.',
      'If they’re fully awake, give small sips of water.',
    ],
    dont: ['Don’t give drinks to someone who is confused or sleepy.'],
  },
  {
    id: 'cold',
    icon: '🥶',
    title: 'Too cold',
    when: 'Hard shivering, slurred words, clumsy or sleepy.',
    steps: [
      'Get out of the wind, rain and snow.',
      'Take off wet clothes. Put on dry ones.',
      'Wrap them up, head included. Blankets, sleeping bag, coats, anything.',
      'Warm the chest first. Share body heat if you need to.',
      'If they’re awake, give warm, sweet drinks.',
    ],
    dont: ['No alcohol.', 'Don’t rub arms and legs.', 'No hot bath.'],
    getHelp: 'Call 911 if they stop shivering, get confused or are hard to wake.',
  },
  {
    id: 'water',
    icon: '💧',
    title: 'Make water safe to drink',
    when: 'Tap is off or you’re not sure the water is clean.',
    steps: [
      'Cloudy? Pour it through a clean cloth or coffee filter first.',
      'Best way: bring it to a full rolling boil for 1 minute (3 minutes high in the mountains). Let it cool.',
      'Can’t boil? Use plain, unscented household bleach: 8 drops per gallon of clear water, 16 drops if it’s cloudy.',
      'Stir and wait 30 minutes before drinking.',
      'Store it in clean, covered containers.',
    ],
    dont: ['Don’t use scented or “splashless” bleach.'],
    getHelp: 'Boiling and bleach kill germs. They don’t remove chemicals or fuel.',
  },
  {
    id: 'lost',
    icon: '🧭',
    title: 'Lost outdoors',
    when: 'You don’t know the way back.',
    steps: [
      'Stop. Sit down, breathe, and stay where you are. People who stay put get found faster.',
      'Stay warm and dry first. Put on layers and get out of wind and rain.',
      'Make yourself easy to spot: open ground, bright clothes, a fire if it’s safe.',
      'Signal in threes: 3 whistle blasts, 3 shouts or 3 flashes. Then wait and repeat.',
      'Sip your water. You can go days without food, so don’t risk eating plants you don’t know.',
    ],
  },
  {
    id: 'power',
    icon: '🔦',
    title: 'Power is out',
    when: 'No electricity and you don’t know for how long.',
    steps: [
      'Use flashlights, not candles.',
      'Keep the fridge and freezer shut. Fridge food stays safe about 4 hours, a full freezer about 2 days.',
      'Unplug TVs and computers so a surge doesn’t fry them.',
      'In the cold, pick one room, close the doors and layer up. In the heat, drink water and stay low and shaded.',
      'Check on neighbors who are older or live alone.',
    ],
    dont: [
      'Never run a generator, grill or camp stove indoors or in a garage. The fumes can kill.',
    ],
  },
];

export const findQuickHelp = (id: string) => QUICK_HELP.find((h) => h.id === id);
