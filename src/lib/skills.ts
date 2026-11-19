// Skill paths: the same cards as everywhere else, put in the order you would
// learn them. Five short paths, each a handful of steps, so a beginner knows
// where to start and can see how far they have come. Ticks are saved on the phone.
import { File, Paths } from './fs';
import { findQuickHelp, QuickHelp } from './quick-help';
import type { Hue } from './theme';

export type SkillStep = {
  /** The emergency card that teaches this step. */
  card: string;
  /** Why this comes now, in one plain line. */
  why: string;
};

export type SkillPath = {
  id: string;
  title: string;
  icon: string; // MaterialCommunityIcons name
  hue: Hue;
  /** What you can do once the path is finished. */
  goal: string;
  steps: SkillStep[];
};

export const SKILL_PATHS: SkillPath[] = [
  {
    id: 'water',
    title: 'Water',
    icon: 'water',
    hue: 'blue',
    goal: 'You can find water, make it safe, and keep enough for everyone.',
    steps: [
      { card: 'store-water', why: 'Start here. Stored water buys you days.' },
      { card: 'water', why: 'Any water you find has to be made safe first.' },
      { card: 'find-water', why: 'Stored water runs out. Know where more is.' },
      { card: 'dehydration', why: 'Bad water makes people sick. Know how to bring them back.' },
      { card: 'toilet', why: 'Keep waste away from your water, or all of this is undone.' },
      { card: 'latrine', why: 'The long-term fix once the toilets are gone for good.' },
    ],
  },
  {
    id: 'fire',
    title: 'Fire and heat',
    icon: 'fire',
    hue: 'coral',
    goal: 'You can make fire, cook on it, and keep everyone warm through winter.',
    steps: [
      { card: 'fire', why: 'Everything else on this path needs a fire.' },
      { card: 'cook', why: 'Cooked food and boiled water keep people well.' },
      { card: 'light', why: 'Safe light after dark, without burning the house down.' },
      { card: 'warm', why: 'Staying warm takes less wood when you do it right.' },
      { card: 'cold', why: 'Know the signs when someone is getting dangerously cold.' },
      { card: 'firewood', why: 'Winter wood has to be cut and dried months ahead.' },
    ],
  },
  {
    id: 'food',
    title: 'Food',
    icon: 'food-apple',
    hue: 'green',
    goal: 'You can stretch what you have, keep it from spoiling, and bring in more.',
    steps: [
      { card: 'food-cold', why: 'Save what is in the fridge and freezer first.' },
      { card: 'ration', why: 'Count your food, so you know how long it lasts.' },
      { card: 'keep-food', why: 'Food that keeps without a fridge feeds you all year.' },
      { card: 'garden', why: 'Planting early is the only way to eat next season.' },
      { card: 'forage', why: 'Free food is all around, if you only eat what you know.' },
      { card: 'trap', why: 'Fish and small animals add the protein a garden lacks.' },
      { card: 'chickens', why: 'Eggs every day, from scraps.' },
      { card: 'save-seed', why: 'Without your own seed, this year’s garden is the last.' },
      { card: 'grain', why: 'The one food that stores for years and feeds a village.' },
      { card: 'goats', why: 'Milk every day from plants people cannot eat.' },
    ],
  },
  {
    id: 'shelter',
    title: 'Shelter',
    icon: 'home-roof',
    hue: 'brown',
    goal: 'You can stay dry, find your way, call for help, and keep your group safe.',
    steps: [
      { card: 'shelter', why: 'Cold and wet can kill faster than hunger or thirst.' },
      { card: 'lost', why: 'What to do the moment you realise you are lost.' },
      { card: 'find-way', why: 'Find north and walk a straight line with no compass.' },
      { card: 'signal', why: 'Make yourself easy to find.' },
      { card: 'watch', why: 'A group stays safe with a watch and a few fair rules.' },
      { card: 'mend', why: 'Sharp tools and mended clothes are how you last the year.' },
    ],
  },
  {
    id: 'medicine',
    title: 'First aid',
    icon: 'medical-bag',
    hue: 'red',
    goal: 'You can handle the injuries and sickness most likely to kill someone.',
    steps: [
      { card: 'bleeding', why: 'Bad bleeding kills in minutes. Learn this one first.' },
      { card: 'cpr', why: 'When someone is not breathing, you are their only chance.' },
      { card: 'choking', why: 'It happens at the table, and it is over in minutes.' },
      { card: 'wound', why: 'A small cut cleaned well never becomes a big problem.' },
      { card: 'burn', why: 'With open fires every day, burns will happen.' },
      { card: 'broken-bone', why: 'Hold it still and it can heal.' },
      { card: 'sick', why: 'Nursing someone through a fever is most of medicine.' },
    ],
  },
  {
    id: 'make',
    title: 'Make things',
    icon: 'hammer-wrench',
    hue: 'teal',
    goal: 'You can make the things that wear out: rope, pots, cloth, leather, walls and tools.',
    steps: [
      { card: 'rope', why: 'Start here. It needs nothing but your hands and some plants.' },
      { card: 'mend', why: 'Fixing what you have comes before making new.' },
      { card: 'soap', why: 'Worth the work. Soap prevents more sickness than any medicine.' },
      { card: 'charcoal', why: 'The hot, clean fuel that pots and metalwork need.' },
      { card: 'clay-pots', why: 'Containers for water, food and cooking, from dirt.' },
      { card: 'mud-brick', why: 'Walls and ovens from the ground under your feet.' },
      { card: 'tan', why: 'Skins become shoes, straps and warm clothes.' },
      { card: 'cloth', why: 'Clothes wear out in a few years. This is how new ones begin.' },
      { card: 'forge', why: 'Turn scrap steel into the tools everything else depends on.' },
    ],
  },
  {
    id: 'community',
    title: 'Live together',
    icon: 'account-group',
    hue: 'violet',
    goal: 'Your group stays healthy, fair and hopeful, and passes on what it knows.',
    steps: [
      { card: 'germs', why: 'Start here. These few habits prevent most sickness.' },
      { card: 'meeting', why: 'Fair decisions keep a group from tearing itself apart.' },
      { card: 'watch', why: 'Safety at night, shared out so nobody burns out.' },
      { card: 'calendar', why: 'Know the date, the seasons and what is in the stores.' },
      { card: 'morale', why: 'People who lose hope stop doing the things that keep them alive.' },
      { card: 'teach', why: 'What you know dies with you unless the children can read it.' },
      {
        card: 'death',
        why: 'Losing someone will happen. Know how to care for them and each other.',
      },
    ],
  },
];

export const findSkillPath = (id: string) => SKILL_PATHS.find((p) => p.id === id);
export const cardFor = (step: SkillStep): QuickHelp | undefined => findQuickHelp(step.card);

const FILE = new File(Paths.document, 'skills.json');
let cache: Record<string, true> | null = null;

function ticks(): Record<string, true> {
  if (cache) return cache;
  try {
    cache = FILE.exists ? (JSON.parse(FILE.textSync()) as Record<string, true>) : {};
  } catch {
    cache = {};
  }
  return cache;
}

export const isLearned = (path: string, card: string) => !!ticks()[`${path}/${card}`];

export function toggleLearned(path: string, card: string) {
  const all = { ...ticks() };
  const key = `${path}/${card}`;
  if (all[key]) delete all[key];
  else all[key] = true;
  cache = all;
  try {
    FILE.writeSync(JSON.stringify(all));
  } catch {
    // a lost tick is not worth interrupting anyone over
  }
}

export const learnedIn = (p: SkillPath) => p.steps.filter((s) => isLearned(p.id, s.card)).length;

/**
 * One thing to learn today. It walks the paths in turn, a new path each day,
 * and always offers the first step of that path not yet ticked.
 */
export function todaysSkill(now = new Date()): { path: SkillPath; step: SkillStep } | null {
  const day = Math.floor(now.getTime() / 86400000 - now.getTimezoneOffset() / 1440);
  for (let i = 0; i < SKILL_PATHS.length; i++) {
    const path = SKILL_PATHS[(day + i) % SKILL_PATHS.length];
    const step = path.steps.find((s) => !isLearned(path.id, s.card));
    if (step) return { path, step };
  }
  return null; // everything is learned
}
