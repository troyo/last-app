// "Get ready" checklists: what to have at home for 3 days, 2 weeks and a year
// without power, water or shops. Ticks are saved on the phone.
//
// Amounts are per person unless it says otherwise. Based on Ready.gov / FEMA
// and Red Cross kit lists, and widely used long-term food storage guidelines.

import { File, Paths } from './fs';

export type Checklist = {
  id: string;
  title: string;
  blurb: string;
  icon: string; // MaterialCommunityIcons name
  hue: 'green' | 'sun' | 'coral';
  groups: { title: string; items: string[] }[];
};

export const CHECKLISTS: Checklist[] = [
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
          '3 gallons of water per person (1 gallon a day)',
          '3 days of food that needs no cooking: cans, peanut butter, crackers, bars',
          'Manual can opener',
          'Food and water for pets',
        ],
      },
      {
        title: 'Light, power and news',
        items: [
          'Flashlight for each person, with spare batteries',
          'Battery or hand-crank radio',
          'Charged power bank and phone cable',
          'Whistle to signal for help',
        ],
      },
      {
        title: 'Health and hygiene',
        items: [
          'First aid kit',
          '7 days of any prescription medicine',
          'Pain reliever, anti-diarrhea medicine, any allergy medicine',
          'Soap, hand sanitizer, toilet paper, wet wipes',
          'Trash bags and ties',
          'Dust masks',
        ],
      },
      {
        title: 'Warmth and tools',
        items: [
          'Warm blanket or sleeping bag per person',
          'Change of clothes and sturdy shoes',
          'Wrench or pliers to shut off gas and water',
          'Lighter or waterproof matches',
        ],
      },
      {
        title: 'Papers and plans',
        items: [
          'Copies of ID, insurance and medical info in a waterproof bag',
          'Cash in small bills',
          'Paper map of your area',
          'A meeting place your family has agreed on',
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
          '14 gallons of stored water per person',
          'Plain unscented bleach and a dropper to treat more',
          'A water filter (pump, gravity or straw type)',
          'Buckets or jugs to carry and collect water',
        ],
      },
      {
        title: 'Food',
        items: [
          '2 weeks of shelf-stable food: rice, beans, pasta, oats',
          'Canned meat, fish, vegetables and fruit',
          'Peanut butter, cooking oil, salt, sugar, powdered milk',
          'Comfort foods: coffee, tea, chocolate',
          'Camp stove with 2 weeks of fuel (cook outdoors only)',
          'Pot, pan and utensils that work on the stove',
        ],
      },
      {
        title: 'Light, heat and power',
        items: [
          'Lanterns and a 2-week supply of batteries',
          'Sleeping bags or enough blankets for the coldest night',
          'Battery carbon monoxide alarm',
          'Fire extinguisher',
          'Keep the car at least half full of fuel',
        ],
      },
      {
        title: 'Health and sanitation',
        items: [
          '30 days of prescription medicine',
          'Oral rehydration salts, or sugar and salt to make them',
          'Bucket toilet: bucket, heavy bags, and kitty litter or sawdust',
          'Feminine and baby supplies if needed',
          'Extra soap, bleach and disposable gloves',
        ],
      },
      {
        title: 'Staying sane',
        items: [
          'Books, cards and games',
          'A written list of important phone numbers',
          'A plan with neighbors to check on each other',
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
        items: [
          'A lasting source: well, spring, stream, or rain catchment off your roof',
          'Storage barrels (at least 55 gallons per person)',
          'Gravity filter with spare filter elements',
          'Pool shock (calcium hypochlorite) to make disinfectant for years',
          'A way to boil large amounts of water',
        ],
      },
      {
        title: 'Food for a year, per adult',
        items: [
          'About 400 lb of grains: rice, wheat, oats, pasta, flour',
          'About 60 lb of dried beans and lentils',
          'About 60 lb of sugar or honey',
          'About 10 quarts of cooking oil or other fats',
          'About 8 lb of salt',
          'About 16 lb of powdered milk',
          'Canned or dried fruit, vegetables and meat for variety',
          'Multivitamins',
          'Food-grade buckets, mylar bags and oxygen absorbers',
        ],
      },
      {
        title: 'Growing and keeping food',
        items: [
          'Open-pollinated (heirloom) seeds for your climate',
          'Garden tools, and a place to grow',
          'Canning jars, plenty of lids, and a pressure canner',
          'Ways to dry, smoke or salt food',
          'Fishing, trapping or hunting gear you know how to use',
          'Chickens or rabbits, if you have the space',
        ],
      },
      {
        title: 'Heat, cooking and power',
        items: [
          'Wood stove or rocket stove, and a year of dry firewood',
          'Axe, saw and sharpening tools',
          'Solar panel with a battery or power station',
          'Rechargeable batteries and a solar charger',
          'Oil lamps or solar lanterns',
          'Safely stored fuel, rotated every year',
        ],
      },
      {
        title: 'Health without a clinic',
        items: [
          'A large first aid kit: bandages, gauze, tape, splints, tourniquet',
          'As much prescription medicine as your doctor will allow',
          'Pain, fever, allergy and stomach medicines',
          'Dental kit: temporary filling material, floss, clove oil',
          'Spare glasses',
          'Soap, bleach, and supplies for a composting toilet',
          'First aid and CPR training for the adults in the house',
        ],
      },
      {
        title: 'News, safety and people',
        items: [
          'Hand-crank radio that picks up shortwave and weather bands',
          'Two-way radios for your household',
          'Sturdy locks, and a plan for who keeps watch',
          'Neighbors you trust and skills to trade',
          'Small items to barter: lighters, soap, batteries, salt',
          'Paper copies of the guides that matter most to you',
        ],
      },
      {
        title: 'Clothing and repairs',
        items: [
          'Work boots and warm, layered clothing for each person',
          'Sewing kit, duct tape, cord, glue and tarps',
          'Hand tools: hammer, saw, screwdrivers, pliers, shovel',
          'Spare parts for anything you depend on',
        ],
      },
    ],
  },
];

export const findChecklist = (id: string) => CHECKLISTS.find((c) => c.id === id);
export const itemKey = (listId: string, item: string) => `${listId}|${item}`;

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
      if (set.has(itemKey(list.id, item))) n++;
    }
  return { done: n, total };
}
