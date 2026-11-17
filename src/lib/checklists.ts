// "Get ready" checklists: what to have at home for 3 days, 2 weeks and a year
// without power, water or shops. Ticks are saved on the phone.
//
// The lists fit themselves to the person: amounts are multiplied by the size
// of the household, hot places get more water, and extra sections appear for
// what can happen where they live (hurricanes, deep cold, earthquakes...).
// Every line can carry a short "why", shown when the line is opened.
//
// Based on Ready.gov / FEMA and Red Cross kit lists, and widely used
// long-term food storage guidelines.

import { File, Paths } from './fs';
import { getProfile, Profile, waterPerDay } from './place';

/** What the lists know about the household when they write themselves. */
type Ctx = { p?: Profile; n: number; water: number };
type Words = string | ((c: Ctx) => string);

type RawItem = { id: string; text: Words; why?: string; when?: (c: Ctx) => boolean };
type RawGroup = { title: Words; note?: Words; items: RawItem[]; when?: (c: Ctx) => boolean };
type RawList = {
  id: string;
  title: string;
  blurb: string;
  icon: string; // MaterialCommunityIcons name
  hue: 'green' | 'sun' | 'coral';
  groups: RawGroup[];
};

export type Item = { id: string; text: string; why?: string };
export type Group = { title: string; note?: string; forYou?: boolean; items: Item[] };
export type Checklist = Omit<RawList, 'groups'> & { groups: Group[] };

const i = (id: string, text: Words, why?: string, when?: (c: Ctx) => boolean): RawItem => ({
  id,
  text,
  why,
  when,
});

const round = (x: number) => (x >= 10 ? Math.round(x) : Math.round(x * 2) / 2);
/** "12 gallons of water for your 4 people" or "3 gallons of water per person". */
const amount = (c: Ctx, each: number, unit: string) =>
  !c.p
    ? `${round(each)} ${unit} per person`
    : c.n === 1
      ? `${round(each)} ${unit}`
      : `${round(each * c.n).toLocaleString()} ${unit} for your ${c.n} people`;
const forAll = (c: Ctx, one: string, many: string) => (c.p && c.n === 1 ? one : many);

const has = (h: string) => (c: Ctx) => !!c.p?.hazards.includes(h as never);
const cold = (c: Ctx) => !!c.p && (c.p.climate === 'cold' || c.p.climate === 'mixed');
const hot = (c: Ctx) => !!c.p && (c.p.climate === 'humid' || c.p.climate === 'dry');
const pets = (c: Ctx) => !c.p || c.p.pets > 0;
const apartment = (c: Ctx) => c.p?.home === 'apartment';
const notApartment = (c: Ctx) => c.p?.home !== 'apartment';

const LISTS: RawList[] = [
  {
    id: '3-days',
    title: '3 days',
    blurb: 'A storm, a blackout, a boil-water notice. The kit everyone should have.',
    icon: 'calendar-today',
    hue: 'green',
    groups: [
      {
        title: 'Water and food',
        items: [
          i(
            'water',
            (c) => `${amount(c, 3 * c.water, 'gallons of water')}`,
            'You can last weeks without food but only about 3 days without water. Count 1 gallon a day each for drinking, cooking and a quick wash, and more when it’s hot. Store-bought jugs are fine. So are clean soda bottles filled from the tap.',
          ),
          i(
            'food',
            '3 days of food that needs no cooking: cans, peanut butter, crackers, bars',
            'With no power you may not be able to cook. Pick things you already like to eat, and swap them out once a year so nothing goes stale.',
          ),
          i(
            'opener',
            'Manual can opener',
            'The one thing people forget. Electric openers are useless in a blackout.',
          ),
          i(
            'pets',
            'Food and water for pets',
            'A medium dog needs about half a gallon of water a day.',
            pets,
          ),
        ],
      },
      {
        title: 'Light, power and news',
        items: [
          i(
            'light',
            (c) =>
              forAll(
                c,
                'A flashlight with spare batteries',
                'A flashlight for each person, with spare batteries',
              ),
            'Flashlights are safer than candles, which start many house fires in blackouts. Headlamps are even better: they leave both hands free.',
          ),
          i(
            'radio',
            'Battery or hand-crank radio',
            'When phones and internet are down, radio is how you hear where the help, water and shelters are. In the US, get one with the NOAA weather band.',
          ),
          i(
            'powerbank',
            'Charged power bank and phone cable',
            'Your phone still works as a flashlight, a map and this app with no signal. Turn on low power mode and airplane mode to make a charge last days.',
          ),
          i(
            'whistle',
            'Whistle to signal for help',
            'A whistle carries much farther than a shout and doesn’t wear you out. Three blasts means "I need help".',
          ),
        ],
      },
      {
        title: 'Health and hygiene',
        items: [
          i(
            'firstaid',
            'First aid kit',
            'At a minimum: bandages, gauze, tape, antiseptic wipes, tweezers and gloves. A small cut that gets infected is a big problem when you can’t reach a doctor.',
          ),
          i(
            'meds7',
            '7 days of any prescription medicine',
            'Pharmacies close when the power is out. Refill a few days early each month and you build a buffer without paying extra.',
          ),
          i('otc', 'Pain reliever, anti-diarrhea medicine, any allergy medicine'),
          i(
            'soap',
            'Soap, hand sanitizer, toilet paper, wet wipes',
            'After a disaster more people get sick from dirty hands than from the disaster itself.',
          ),
          i(
            'bags',
            'Trash bags and ties',
            'If the toilet won’t flush, line it with a heavy trash bag. They also work as rain ponchos and for keeping things dry.',
          ),
          i('masks', 'Dust masks', 'For smoke, ash and dust from damaged buildings.'),
        ],
      },
      {
        title: 'Warmth and tools',
        items: [
          i(
            'blanket',
            (c) =>
              forAll(
                c,
                'A warm blanket or sleeping bag',
                'A warm blanket or sleeping bag for each person',
              ),
            'With no power the heating stops too. Even in warm places, nights get cold when you’re wet or tired.',
          ),
          i(
            'clothes',
            'Change of clothes and sturdy shoes',
            'After a storm or quake the ground is covered in glass and nails.',
          ),
          i(
            'wrench',
            'Wrench or pliers to shut off gas and water',
            'A broken gas line can burn the house down, and a broken water pipe floods it. Find your shut-offs today, while it’s calm.',
          ),
          i('lighter', 'Lighter or waterproof matches'),
        ],
      },
      {
        title: 'Papers and plans',
        items: [
          i(
            'papers',
            'Copies of ID, insurance and medical info in a waterproof bag',
            'You’ll need them for aid, insurance claims and getting medicine replaced.',
          ),
          i(
            'cash',
            'Cash in small bills',
            'Card machines and ATMs need power and internet. Small bills matter because nobody can make change.',
          ),
          i(
            'map',
            'Paper map of your area',
            'For when your phone is dead. You can also save maps in this app’s Maps tab while you still have internet.',
          ),
          i(
            'meet',
            'A meeting place your family has agreed on',
            'If phones are down you can’t call each other. Pick one spot near home and one outside the neighborhood. It costs nothing and matters more than most gear.',
            (c) => !c.p || c.n > 1,
          ),
        ],
      },
    ],
  },
  {
    id: '2-weeks',
    title: '2 weeks',
    blurb: 'Everything in the 3-day kit, stretched to ride out a long outage at home.',
    icon: 'calendar-week',
    hue: 'sun',
    groups: [
      {
        title: 'Water',
        items: [
          i(
            'water',
            (c) => `${amount(c, 14 * c.water, 'gallons of stored water')}`,
            'After big disasters it often takes 1 to 2 weeks for taps or water trucks to come back. Stack jugs in a closet or under beds, away from sunlight.',
          ),
          i(
            'bleach',
            'Plain unscented bleach and a dropper to treat more',
            '8 drops of plain bleach in a gallon of clear water (6 drops if the label says 8.25%), wait 30 minutes, and it’s safe to drink. Bleach loses strength after about a year, so replace it.',
          ),
          i(
            'filter',
            'A water filter (pump, gravity or straw type)',
            'A filter turns rain, creek or lake water into drinking water, so you’re not limited to what you stored.',
          ),
          i('buckets', 'Buckets or jugs to carry and collect water'),
        ],
      },
      {
        title: 'Food',
        items: [
          i(
            'staples',
            '2 weeks of shelf-stable food: rice, beans, pasta, oats',
            'About 2,000 calories a day each. The easy way: every shop, buy a few extra of what you already eat, and use the oldest first.',
          ),
          i(
            'cans',
            'Canned meat, fish, vegetables and fruit',
            'Cans are already cooked, so you can eat them cold if you have to.',
          ),
          i('basics', 'Peanut butter, cooking oil, salt, sugar, powdered milk'),
          i(
            'comfort',
            'Comfort foods: coffee, tea, chocolate',
            'Not a luxury. Morale is what keeps people making good decisions in week two.',
          ),
          i(
            'stove',
            'Camp stove with 2 weeks of fuel (cook outdoors only)',
            'Lets you boil water and cook real food. Never use it indoors: the fumes have no smell and kill quickly.',
          ),
          i('pots', 'Pot, pan and utensils that work on the stove'),
        ],
      },
      {
        title: 'Light, heat and power',
        items: [
          i(
            'lanterns',
            'Lanterns and a 2-week supply of batteries',
            'A lantern lights a whole room, so the family can cook, read and play together.',
          ),
          i(
            'bedding',
            'Sleeping bags or enough blankets for the coldest night',
            'Plan for the coldest night your area gets, with no heating at all.',
          ),
          i(
            'co',
            'Battery carbon monoxide alarm',
            'Stoves, heaters and generators make a gas you can’t see or smell. This alarm is the only warning you get.',
          ),
          i(
            'extinguisher',
            'Fire extinguisher',
            'You’ll be using flames more than usual, and the fire department may not come.',
          ),
          i(
            'fuel',
            'Keep the car at least half full of fuel',
            'Gas pumps need electricity. Your car is also a way out, a phone charger and a warm, dry shelter.',
          ),
        ],
      },
      {
        title: 'Health and sanitation',
        items: [
          i(
            'meds30',
            '30 days of prescription medicine',
            'Ask your doctor for a 90-day prescription. Many will do it.',
          ),
          i(
            'ors',
            'Oral rehydration salts, or sugar and salt to make them',
            'Diarrhea from bad water is one of the biggest killers after a disaster. Home recipe: 6 level teaspoons of sugar and half a teaspoon of salt in 1 quart of clean water.',
          ),
          i(
            'toilet',
            'Bucket toilet: bucket, heavy bags, and kitty litter or sawdust',
            'When water stops, toilets stop. Waste left around spreads disease fast. A lined bucket with a scoop of litter after each use keeps the smell and germs down.',
          ),
          i('personal', 'Feminine and baby supplies if needed'),
          i('gloves', 'Extra soap, bleach and disposable gloves'),
        ],
      },
      {
        title: 'Staying sane',
        items: [
          i(
            'games',
            'Books, cards and games',
            'Two weeks with no screens is long, especially for kids.',
          ),
          i(
            'numbers',
            'A written list of important phone numbers',
            'Most people don’t know any numbers by heart any more. If your phone dies you can still borrow one.',
          ),
          i(
            'neighbors',
            'A plan with neighbors to check on each other',
            'In real disasters, most people are rescued by neighbors, not by emergency crews.',
          ),
        ],
      },
    ],
  },
  {
    id: '1-year',
    title: '1 year',
    blurb: 'Living without shops, taps or the grid. Build this up slowly over time.',
    icon: 'calendar-star',
    hue: 'coral',
    groups: [
      {
        title: 'Water you can renew',
        note: (c) =>
          `Nobody can store a year of water (that would be about ${Math.round(365 * c.water * c.n).toLocaleString()} gallons${c.p ? '' : ' each'}). You need a source you can keep going back to.`,
        items: [
          i(
            'source',
            (c) =>
              apartment(c)
                ? 'A source you can walk to: a river, lake, spring or rain you can catch'
                : 'A lasting source: well, spring, stream, or rain catchment off your roof',
            'Walk to it now and time it. A 1,000 square foot roof catches about 600 gallons from one inch of rain.',
          ),
          i(
            'barrels',
            (c) => `Storage barrels: ${amount(c, 55, 'gallons')}`,
            'A buffer for dry spells and for when the source is frozen or dirty. Food-grade blue barrels are cheap second-hand.',
          ),
          i(
            'gravity',
            'Gravity filter with spare filter elements',
            'Needs no power and cleans gallons a day. The spare elements are what make it last years.',
          ),
          i(
            'shock',
            'Pool shock (calcium hypochlorite) to make disinfectant for years',
            'Liquid bleach goes weak in a year. One small bag of dry pool shock keeps for 10 years and treats thousands of gallons. Buy the kind with no additives.',
          ),
          i(
            'boil',
            'A way to boil large amounts of water',
            'Boiling for 1 minute kills everything alive in water, with no supplies to run out.',
          ),
          i(
            'cart',
            'A cart, wagon or yoke for carrying water',
            'Water weighs 8 pounds a gallon. Carrying it by hand every day wears you down fast.',
            (c) => !c.p || c.p.home !== 'rural',
          ),
        ],
      },
      {
        title: (c) =>
          c.p && c.n > 1 ? `Food for a year, for your ${c.n} people` : 'Food for a year, per adult',
        note: 'Children under 7 need about half of this. Build it up a bag at a time, and eat from it so it stays fresh.',
        items: [
          i(
            'grains',
            (c) =>
              `About ${(400 * c.n).toLocaleString()} lb of grains: rice, wheat, oats, pasta, flour`,
            'Grains are the cheapest calories there are. White rice and whole wheat sealed in buckets keep 25 years or more. Flour and brown rice only keep about a year.',
          ),
          i(
            'beans',
            (c) => `About ${(60 * c.n).toLocaleString()} lb of dried beans and lentils`,
            'Your protein. Beans and rice eaten together give your body everything meat does.',
          ),
          i(
            'sugar',
            (c) => `About ${(60 * c.n).toLocaleString()} lb of sugar or honey`,
            'Calories, comfort, and you need it for preserving fruit. Honey never spoils.',
          ),
          i(
            'oil',
            (c) => `About ${(10 * c.n).toLocaleString()} quarts of cooking oil or other fats`,
            'People forget fat, then feel weak and hungry on plenty of rice. Oil goes off in 1 to 2 years, so use and replace it.',
          ),
          i(
            'salt',
            (c) => `About ${(8 * c.n).toLocaleString()} lb of salt`,
            'Your body needs it, and it’s how you preserve meat and vegetables. Store extra: it’s cheap and never spoils.',
          ),
          i('milk', (c) => `About ${(16 * c.n).toLocaleString()} lb of powdered milk`),
          i(
            'variety',
            'Canned or dried fruit, vegetables and meat for variety',
            'People stop eating when every meal is the same, even when hungry. It’s called appetite fatigue.',
          ),
          i(
            'vitamins',
            'Multivitamins',
            'Covers what a diet of stored food is missing, like vitamin C.',
          ),
          i(
            'buckets',
            'Food-grade buckets, mylar bags and oxygen absorbers',
            'This is what turns a 1-year shelf life into 25 years, and keeps out mice, bugs and damp.',
          ),
        ],
      },
      {
        title: 'Growing and keeping food',
        note: 'Stored food buys you time. Growing food is what gets you past year one.',
        items: [
          i(
            'seeds',
            'Open-pollinated (heirloom) seeds for your climate',
            'You can save seeds from these and plant them next year. Seeds from hybrid plants don’t grow true. Start with easy calorie crops: potatoes, beans, squash, corn.',
          ),
          i(
            'garden',
            (c) =>
              apartment(c)
                ? 'Containers, soil and a sunny balcony, roof or shared plot'
                : 'Garden tools, and a place to grow',
            'Start a small garden this year. The first season always goes badly, and you want that to happen while the shops are still open.',
          ),
          i(
            'canning',
            'Canning jars, plenty of lids, and a pressure canner',
            'How you eat the summer harvest in winter. Lids are single-use, so stock lots. Meat and most vegetables must be pressure canned to be safe.',
          ),
          i('drying', 'Ways to dry, smoke or salt food', 'Needs no jars and no power.'),
          i(
            'hunting',
            'Fishing, trapping or hunting gear you know how to use',
            'Gear you’ve never practiced with won’t feed you. Fishing and snares give the most food for the least effort.',
          ),
          i(
            'animals',
            'Chickens or rabbits, if you have the space',
            'Fresh eggs and meat that renew themselves, and they eat scraps.',
            notApartment,
          ),
        ],
      },
      {
        title: 'Heat, cooking and power',
        items: [
          i(
            'woodstove',
            (c) =>
              apartment(c)
                ? 'A safe way to cook and heat with no power, and fuel for it'
                : 'Wood stove or rocket stove, and a year of dry firewood',
            'Wood is the only fuel you can keep collecting yourself. It has to dry for 6 to 12 months before it burns well, so stack next winter’s wood now.',
          ),
          i('axe', 'Axe, saw and sharpening tools', undefined, notApartment),
          i(
            'solar',
            'Solar panel with a battery or power station',
            'Enough for lights, radios and phones for years, with no fuel to run out. A generator is only useful while you still have gas.',
          ),
          i(
            'rechargeables',
            'Rechargeable batteries and a solar charger',
            'A year of disposable batteries is a huge pile. Rechargeables last hundreds of cycles.',
          ),
          i('lamps', 'Oil lamps or solar lanterns'),
          i(
            'stored-fuel',
            'Safely stored fuel, rotated every year',
            'Gasoline goes bad in about a year, even with stabilizer. Keep it outside the house.',
          ),
        ],
      },
      {
        title: 'Health without a clinic',
        items: [
          i(
            'bigkit',
            'A large first aid kit: bandages, gauze, tape, splints, tourniquet',
            'You’ll be doing more physical work than usual, with tools, so cuts and sprains are likely.',
          ),
          i(
            'rx',
            'As much prescription medicine as your doctor will allow',
            'For anything you depend on daily, talk to your doctor now about what happens if it runs out.',
          ),
          i('otc', 'Pain, fever, allergy and stomach medicines'),
          i(
            'dental',
            'Dental kit: temporary filling material, floss, clove oil',
            'A tooth problem with no dentist is miserable and can turn dangerous. Get dental work done now, while you can.',
          ),
          i('glasses', 'Spare glasses', 'If you can’t see, you can’t work or keep watch.'),
          i(
            'compost',
            'Soap, bleach, and supplies for a composting toilet',
            'Clean hands and safely handled waste prevent most of the illnesses that kill people when systems fail.',
          ),
          i(
            'training',
            'First aid and CPR training for the adults in the house',
            'Skills weigh nothing and can’t be lost or stolen. A weekend course is worth more than a bigger kit.',
          ),
        ],
      },
      {
        title: 'News, safety and people',
        items: [
          i(
            'shortwave',
            'Hand-crank radio that picks up shortwave and weather bands',
            'Shortwave reaches across continents, so you can hear news even if everything local is off the air.',
          ),
          i(
            'twoway',
            'Two-way radios for your household',
            'So whoever goes for water or wood can call for help.',
            (c) => !c.p || c.n > 1,
          ),
          i('locks', 'Sturdy locks, and a plan for who keeps watch'),
          i(
            'community',
            'Neighbors you trust and skills to trade',
            'Nobody makes it a year alone. A group can share watch, work, tools and skills. Getting to know your neighbors now is real preparation.',
          ),
          i(
            'barter',
            'Small items to barter: lighters, soap, batteries, salt',
            'When money stops working, cheap useful things become money.',
          ),
          i(
            'paper',
            'Paper copies of the guides that matter most to you',
            'Phones break. Print the few pages you couldn’t do without.',
          ),
        ],
      },
      {
        title: 'Clothing and repairs',
        items: [
          i(
            'boots',
            (c) =>
              forAll(
                c,
                'Work boots and warm, layered clothing',
                'Work boots and warm, layered clothing for each person',
              ),
            'You’ll be outside and on your feet far more. Buy the next sizes up for growing kids.',
          ),
          i('sewing', 'Sewing kit, duct tape, cord, glue and tarps'),
          i(
            'tools',
            'Hand tools: hammer, saw, screwdrivers, pliers, shovel',
            'Hand tools work without power. Buy good ones once.',
          ),
          i(
            'spares',
            'Spare parts for anything you depend on',
            'Filters, wicks, seals, blades. When there are no shops, a 2-dollar part can end a 200-dollar tool.',
          ),
        ],
      },
    ],
  },
];

// ---------- Extra sections for where you live ----------
// Each has a prefix so the same idea can be ticked separately in each list.

function localGroups(listId: string): RawGroup[] {
  const short = listId === '3-days';
  const year = listId === '1-year';
  const g: RawGroup[] = [];

  g.push({
    title: 'For hurricane season',
    when: has('hurricane'),
    items: short
      ? [
          i(
            'hu-plan',
            'An evacuation plan: where you’ll go, and two roads to get there',
            'Storm surge, the wall of sea water a hurricane pushes ashore, kills more people than wind. If you’re in a surge zone, leaving early is the only safe plan.',
          ),
          i(
            'hu-bag',
            'A grab bag by the door for each person',
            'Water, snacks, medicine, clothes, papers, charger. When it’s time to go, you go.',
          ),
          i(
            'hu-tub',
            'Know how to fill tubs and pots before a storm',
            'A full bathtub is about 40 gallons for washing and flushing.',
          ),
        ]
      : year
        ? [
            i(
              'hu-roof',
              'Roof straps, storm shutters, and tarps to patch damage',
              'After a big storm there are no roofers. A tarp over a hole saves the house.',
            ),
            i(
              'hu-mold',
              'Bleach, fans and tools to dry out and clean up',
              'Mold starts in 2 days in a wet house and makes it unlivable.',
            ),
          ]
        : [
            i(
              'hu-ply',
              'Plywood cut to fit each window, or storm shutters',
              'A broken window lets wind inside, and that’s what lifts roofs off. Tape on glass does nothing.',
            ),
            i(
              'hu-gas',
              'Fuel cans, filled when a storm is named',
              'After a hurricane, fuel can be gone for 2 weeks.',
            ),
            i('hu-tarp', 'Tarps, rope and a hammer and nails for quick roof repairs'),
            i(
              'hu-bug',
              'Mosquito repellent and nets',
              'Standing water after the storm breeds clouds of mosquitoes, and windows will be open with no air conditioning.',
            ),
          ],
  });

  g.push({
    title: 'For tornado country',
    when: has('tornado'),
    items: short
      ? [
          i(
            'to-spot',
            'A safe spot picked and practiced: basement, or inside room on the lowest floor',
            'You may get only a few minutes of warning. Everyone should be able to reach it in the dark.',
          ),
          i(
            'to-helmet',
            'Helmets and sturdy shoes kept in the safe spot',
            'Most tornado injuries are head injuries from flying debris. A bike helmet really helps.',
          ),
          i(
            'to-radio',
            'A weather radio with an alarm',
            'It wakes you at night, when sirens can’t be heard indoors.',
          ),
        ]
      : [
          i(
            'to-tarp',
            'Tarps, work gloves and a pry bar',
            'For covering a damaged roof and getting to people who are trapped.',
          ),
        ],
  });

  g.push({
    title: 'For earthquake country',
    when: has('earthquake'),
    items: short
      ? [
          i(
            'eq-strap',
            'Tall furniture and the water heater strapped to the wall',
            'Falling furniture is what hurts most people. A strapped water heater is also 40 gallons of clean water saved.',
          ),
          i(
            'eq-shoes',
            'Shoes and a flashlight under every bed',
            'Quakes often hit at night, and the floor will be covered in broken glass.',
          ),
          i(
            'eq-gas',
            'A wrench kept by the gas meter',
            'Fires from broken gas lines do more damage than the shaking. Only shut it off if you smell gas.',
          ),
        ]
      : [
          i(
            'eq-outside',
            'Some supplies stored outside the house or in the car',
            'If the house isn’t safe to go back into, you still have your kit.',
          ),
          i(
            'eq-tent',
            'A tent and sleeping gear',
            'Aftershocks go on for weeks. Many people sleep outside until the building is checked.',
          ),
        ],
  });

  g.push({
    title: 'For wildfire country',
    when: has('wildfire'),
    items: short
      ? [
          i(
            'wf-bag',
            'A go bag by the door and the car parked facing out',
            'Wildfires can cover a mile in minutes. People who leave early live.',
          ),
          i(
            'wf-n95',
            'N95 masks for each person',
            'Smoke can be dangerous for weeks, even far from the flames. Cloth masks don’t stop it.',
          ),
          i(
            'wf-routes',
            'Two ways out by car and one on foot',
            'Fire often blocks the obvious road.',
          ),
        ]
      : [
          i(
            'wf-clear',
            '5 feet around the house cleared of anything that burns',
            'Most houses catch fire from blown embers landing on dry leaves, mulch or firewood next to the wall.',
          ),
          i(
            'wf-hose',
            'Long hoses, a ladder, buckets and a shovel',
            'For putting out small spot fires from embers, before and after the main fire passes.',
          ),
        ],
  });

  g.push({
    title: 'For floods',
    when: has('flood'),
    items: short
      ? [
          i(
            'fl-high',
            'Know your way to higher ground on foot',
            'Roads are the first thing to flood, and most flood deaths happen in cars.',
          ),
          i('fl-up', 'Papers, medicine and chargers stored up high'),
        ]
      : [
          i(
            'fl-boots',
            'Rubber boots and waterproof gloves',
            'Floodwater is full of sewage and chemicals. Keep it off your skin.',
          ),
          i(
            'fl-bleach',
            'Extra bleach for cleaning and for your well',
            'Everything the water touched has to be disinfected.',
          ),
        ],
  });

  g.push({
    title: 'For cold winters',
    when: (c) => cold(c) || has('winter')(c),
    items: short
      ? [
          i(
            'wi-layers',
            (c) =>
              forAll(
                c,
                'Hat, gloves, wool socks and warm layers',
                'Hat, gloves, wool socks and warm layers for each person',
              ),
            'With no heating, your clothes are your shelter. Wool keeps you warm even when damp. Cotton doesn’t.',
          ),
          i(
            'wi-car',
            'A winter kit in the car: blankets, food, water, shovel',
            'People get stuck on roads for a day or more in big storms.',
          ),
          i(
            'wi-drip',
            'Know how to shut off your water and drain the pipes',
            'Frozen pipes burst and flood the house when they thaw.',
          ),
        ]
      : year
        ? [
            i(
              'wi-wood',
              'Two winters of firewood, cut and stacked dry',
              'In deep cold, running out of fuel in February is deadly. The second winter’s wood needs a year to dry.',
            ),
            i(
              'wi-cellar',
              'A root cellar or cold room for storing food',
              'Potatoes, carrots, cabbage and apples keep all winter with no power.',
            ),
            i(
              'wi-season',
              'Cold frames or a small greenhouse',
              'Adds weeks to a short growing season at both ends.',
            ),
          ]
        : [
            i(
              'wi-heat',
              'A way to heat one room with no electricity, with 2 weeks of fuel',
              'An indoor-safe propane or kerosene heater, or a wood stove. Always with a carbon monoxide alarm and a cracked window.',
            ),
            i(
              'wi-room',
              'Plastic sheet, tape and blankets to seal off one warm room',
              'Heating one small room uses a fraction of the fuel. A tent set up indoors is warmer still.',
            ),
            i('wi-bags', (c) =>
              forAll(
                c,
                'A sleeping bag rated for freezing temperatures',
                'A sleeping bag rated for freezing temperatures for each person',
              ),
            ),
            i('wi-salt', 'Rock salt or sand, and a snow shovel'),
          ],
  });

  g.push({
    title: 'For the heat',
    when: (c) => hot(c) || has('heat')(c),
    items: short
      ? [
          i(
            'he-water',
            'Extra water on top of the amount above',
            'In real heat you can sweat out a quart an hour. The amounts on this list already count more water for your climate, but more is always better.',
          ),
          i(
            'he-fan',
            'Battery fans and spray bottles',
            'Wet skin plus moving air is how your body dumps heat when there’s no air conditioning.',
          ),
          i(
            'he-salts',
            'Electrolyte powder or oral rehydration salts',
            'Sweat takes salt with it. Water alone isn’t enough after hours of sweating.',
          ),
        ]
      : year
        ? [
            i(
              'he-shade',
              'Shade cloth, awnings and trees on the sunny side',
              'Shade on the outside of a window keeps out far more heat than curtains inside.',
            ),
            i(
              'he-cool',
              'A clay pot cooler or root cellar to keep food',
              'A pot-in-pot cooler with wet sand keeps vegetables fresh for weeks using only evaporation.',
            ),
            i('he-sleep', 'Insect nets, so you can sleep outside or with windows open'),
          ]
        : [
            i(
              'he-shade2',
              'Foil, cardboard or shade cloth for sunny windows',
              'Keeping sun off the glass can drop a room by 10 degrees or more.',
            ),
            i('he-hats', 'Wide hats and loose, light-colored cotton clothes'),
            i(
              'he-cooler',
              'Coolers, and ice made in advance',
              'Keeps medicine like insulin cold and saves fridge food for a few extra days.',
            ),
          ],
  });

  g.push({
    title: 'For apartment living',
    when: apartment,
    items: short
      ? [
          i(
            'ap-stairs',
            'Know every stairway out, and keep a flashlight by the door',
            'Lifts stop in a blackout and stairwells are pitch dark.',
          ),
          i(
            'ap-water',
            'Fill tubs and pots the moment the power goes out',
            'In tall buildings the water pumps are electric. Taps above about the 6th floor stop within hours.',
          ),
        ]
      : year
        ? [
            i(
              'ap-where',
              'A place to go: family or friends with land, and a way to get there',
              'A year in an apartment with no water or power is very hard. For most people the real long-term plan is somewhere else. Agree on it now.',
            ),
            i(
              'ap-bike',
              'Bicycles, a cart, and a paper map of the route',
              'For when there’s no fuel.',
            ),
          ]
        : [
            i(
              'ap-store',
              'Storage found: under beds, top of closets, behind the sofa',
              'Two weeks of food and water for one person fits under a single bed.',
            ),
            i(
              'ap-cook',
              'A way to cook on a balcony or outside',
              'Never use a camp stove or grill indoors.',
            ),
            i(
              'ap-waste',
              'Extra heavy bags for trash and toilet waste',
              'Pickup stops, and in a shared building waste becomes a health problem fast.',
            ),
          ],
  });

  return g;
}

function build(list: RawList, p: Profile | undefined): Checklist {
  const c: Ctx = { p, n: p?.people ?? 1, water: waterPerDay(p) };
  const say = (w: Words) => (typeof w === 'function' ? w(c) : w);
  const make = (g: RawGroup, forYou: boolean): Group => ({
    title: say(g.title),
    note: g.note ? say(g.note) : undefined,
    forYou,
    items: g.items
      .filter((it) => !it.when || it.when(c))
      .map((it) => ({ id: it.id, text: say(it.text), why: it.why })),
  });
  // What's special about your place goes right after the basics, where it gets seen.
  const local = localGroups(list.id)
    .filter((g) => g.when?.(c))
    .map((g) => make(g, true));
  const common = list.groups.filter((g) => !g.when || g.when(c)).map((g) => make(g, false));
  return {
    ...list,
    groups: [common[0], ...local, ...common.slice(1)].filter((g) => g.items.length > 0),
  };
}

/** The three lists, written for this household. */
export const getChecklists = (): Checklist[] => {
  const p = getProfile();
  return LISTS.map((l) => build(l, p));
};
export const findChecklist = (id: string) => getChecklists().find((c) => c.id === id);
export const itemKey = (listId: string, itemId: string) => `${listId}|${itemId}`;

// ---------- Saved ticks ----------

const FILE = new File(Paths.document, 'checklists.json');
let done: Set<string> | null = null;

function load(): Set<string> {
  if (done === null) {
    done = new Set();
    try {
      if (FILE.exists) done = new Set(JSON.parse(FILE.textSync()) as string[]);
    } catch {
      // start fresh
    }
  }
  return done;
}

export const isDone = (key: string) => load().has(key);

export function toggle(key: string) {
  const set = load();
  if (set.has(key)) set.delete(key);
  else set.add(key);
  try {
    FILE.writeSync(JSON.stringify([...set]));
  } catch {
    // not worth interrupting anyone over
  }
}

/** How many items of a list are ticked, and how many there are. */
export function progressOf(list: Checklist): { done: number; total: number } {
  const set = load();
  let total = 0;
  let n = 0;
  for (const g of list.groups)
    for (const item of g.items) {
      total++;
      if (set.has(itemKey(list.id, item.id))) n++;
    }
  return { done: n, total };
}
