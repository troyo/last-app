// "Your one-year plan": what a group has to get done, in order, to last a year with no power
// and no outside help. It is the map over everything else in the app. Each job points at the
// card or guides that show how. Ticks are saved on the phone.
import { File, Paths } from './fs';
import type { Hue } from './theme';

export type PlanJob = {
  id: string;
  /** First sentence is the job. The rest says how or why. */
  text: string;
  /** Where the how-to lives: a screen in the app, or words to search the guides for. */
  open?: { label: string; href?: string; search?: string };
};

export type PlanPhase = {
  id: string;
  /** Short name for the row of tabs. */
  tab: string;
  title: string;
  icon: string; // MaterialCommunityIcons name
  hue: Hue;
  /** What "done" looks like for this stretch of time. */
  goal: string;
  jobs: PlanJob[];
  /** Extra notes shown under the jobs. */
  notesTitle?: string;
  notes?: string[];
};

export const YEAR_PLAN: PlanPhase[] = [
  {
    id: 'hour',
    tab: 'First hour',
    title: 'The first hour',
    icon: 'timer-sand',
    hue: 'red',
    goal: 'Everyone is found, safe from the danger, and the worst injuries are being treated.',
    jobs: [
      {
        id: 'heads',
        text: 'Get everyone together and count heads. Treat the worst injury first.',
        open: { label: 'Someone’s hurt', href: '/situation/hurt' },
      },
      {
        id: 'danger',
        text: 'Move away from danger. That means fire, rising water, a gas smell, fallen wires and cracked buildings.',
      },
      {
        id: 'fill',
        text: 'Fill every pot, jug and the bathtub while the taps still run. They may stop within hours.',
        open: { label: 'Save water before taps stop', href: '/help/store-water' },
      },
      {
        id: 'light',
        text: 'Find your flashlights before it gets dark. Put one where everyone can reach it.',
        open: { label: 'Make light', href: '/help/light' },
      },
      {
        id: 'phone',
        text: 'Put this phone in Low Power Mode. It is your guide, your map and your light.',
        open: { label: 'Make your phone last', href: '/help/phone' },
      },
    ],
  },
  {
    id: 'day',
    tab: 'First day',
    title: 'The first day',
    icon: 'white-balance-sunny',
    hue: 'sun',
    goal: 'You know what you have, everyone has safe water, and there is a toilet and a warm, dry place to sleep.',
    jobs: [
      {
        id: 'count',
        text: 'Write down what you have. Count water, food, medicine, fuel, batteries and blankets.',
        open: { label: '3-day checklist', href: '/checklist/3-days' },
      },
      {
        id: 'water',
        text: 'Make today’s water safe. Each person needs about 1 gallon a day to drink and cook.',
        open: { label: 'Make water safe to drink', href: '/help/water' },
      },
      {
        id: 'food',
        text: 'Eat in the right order. Fridge food first, then the freezer, then cans and dry food.',
        open: { label: 'Keep food from spoiling', href: '/help/food-cold' },
      },
      {
        id: 'toilet',
        text: 'Set up a toilet and a hand washing spot now. Do it before anyone needs them.',
        open: { label: 'Toilet with no water', href: '/help/toilet' },
      },
      {
        id: 'room',
        text: 'Pick one room for everyone to live and sleep in. One room is easier to keep warm, lit and safe.',
        open: { label: 'Stay warm with no heat', href: '/help/warm' },
      },
      {
        id: 'stay',
        text: 'Decide to stay or go. Stay unless home is unsafe. Agree on a spot to meet if you get split up.',
        open: { label: 'Have to leave', href: '/situation/leave' },
      },
    ],
  },
  {
    id: 'week',
    tab: 'First week',
    title: 'The first week',
    icon: 'calendar-week',
    hue: 'teal',
    goal: 'Everyone has a job, you have water that keeps coming, and you know how many days of food are left.',
    jobs: [
      {
        id: 'jobs',
        text: 'Give everyone a job. People cope better when they have something to do. Children too.',
      },
      {
        id: 'source',
        text: 'Find water that keeps coming. Rain, a stream, a spring or a well. Treat every drop before drinking.',
        open: { label: 'Find water', href: '/help/find-water' },
      },
      {
        id: 'ration',
        text: 'Count the days of food you have. Divide it up and plan each meal. Feed children, the sick and hard workers first.',
        open: { label: 'Ration your food', href: '/help/ration' },
      },
      {
        id: 'cook',
        text: 'Cook safely outside. Use lids and soak dry food first so your fuel lasts.',
        open: { label: 'Cook with no power', href: '/help/cook' },
      },
      {
        id: 'clean',
        text: 'Keep hands and water clean. From now on dirty hands and dirty water are the biggest killers.',
        open: { label: 'Diarrhea and vomiting', href: '/help/dehydration' },
      },
      {
        id: 'neighbors',
        text: 'Meet the people around you. Share skills and tools, and agree to look out for each other.',
        open: { label: 'Night watch and group rules', href: '/help/watch' },
      },
      {
        id: 'rhythm',
        text: 'Set a daily rhythm. Wake with the sun, work, eat together, and talk things over every evening.',
      },
    ],
    notesTitle: 'Jobs to hand out',
    notes: [
      'Water: fetches it, treats it, and guards the clean supply.',
      'Food: counts it, cooks it, and stops waste and theft.',
      'Health: looks after the sick and hurt, and keeps the medicine.',
      'Fire and fuel: gathers wood, keeps the fire, and watches for fire danger.',
      'Clean team: looks after the toilet, hand washing and trash.',
      'Watch: keeps an eye out, day and night, in turns.',
      'Children and morale: teaches, tells stories, and gives small jobs to the young.',
    ],
  },
  {
    id: 'month',
    tab: 'First month',
    title: 'The first month',
    icon: 'calendar-month',
    hue: 'blue',
    goal: 'You are no longer living off the cupboard alone. Water, a toilet, fuel and some fresh food are set up to last.',
    jobs: [
      {
        id: 'latrine',
        text: 'Dig a real latrine. Put it downhill and at least 200 feet from any water.',
        open: { label: 'Dig a latrine', href: '/help/latrine' },
      },
      {
        id: 'rain',
        text: 'Catch and store rain. Build up two weeks of treated water.',
        open: { label: 'Guides on catching rain', search: 'rainwater harvesting' },
      },
      {
        id: 'wild',
        text: 'Find food beyond the cupboard. Fish, set traps, and gather only the wild plants you are sure of.',
        open: { label: 'Wild food you can trust', href: '/help/forage' },
      },
      {
        id: 'plant',
        text: 'Plant fast crops if the season allows. Radishes, lettuce, beans and potatoes come quickly.',
        open: { label: 'Start a food garden', href: '/help/garden' },
      },
      {
        id: 'wood',
        text: 'Cut and stack firewood now. It needs months to dry, and you need far more than you think.',
        open: { label: 'Firewood for winter', href: '/help/firewood' },
      },
      {
        id: 'soap',
        text: 'Make soap and keep washing. Clean bodies, clothes and dishes keep sickness away.',
        open: { label: 'Make soap', href: '/help/soap' },
      },
      {
        id: 'small',
        text: 'Treat small problems early. A small cut, a sore tooth or a blister can turn deadly with no doctor.',
        open: { label: 'Clean and cover a cut', href: '/help/wound' },
      },
      {
        id: 'morale',
        text: 'Look after spirits. Give everyone rest, a say in decisions, and something to look forward to.',
        open: { label: 'Guides on morale', search: 'morale' },
      },
    ],
  },
  {
    id: 'spring',
    tab: 'Spring',
    title: 'Spring',
    icon: 'sprout',
    hue: 'green',
    goal: 'The crops that will feed you next winter are in the ground.',
    jobs: [
      {
        id: 'staples',
        text: 'Plant filling crops first. Potatoes, beans, corn and squash give the most food for the work.',
        open: { label: 'Start a food garden', href: '/help/garden' },
      },
      {
        id: 'soil',
        text: 'Feed the soil. Dig in compost and old manure before you plant.',
        open: { label: 'Guides on compost', search: 'compost' },
      },
      {
        id: 'greens',
        text: 'Pick spring greens. Dandelion and nettle are easy to know and full of vitamins after winter.',
        open: { label: 'Wild food you can trust', href: '/help/forage' },
      },
      {
        id: 'animals',
        text: 'Start small animals if you can. Chickens and rabbits turn scraps and weeds into eggs and meat.',
        open: { label: 'Keep chickens', href: '/help/chickens' },
      },
      {
        id: 'repair',
        text: 'Fix what winter broke. Mend the roof, clear drains, and clean the water tanks.',
      },
    ],
  },
  {
    id: 'summer',
    tab: 'Summer',
    title: 'Summer',
    icon: 'weather-sunny',
    hue: 'coral',
    goal: 'Every bit of extra food is being saved for winter, and nobody gets sick from heat or bad water.',
    jobs: [
      {
        id: 'preserve',
        text: 'Save all extra food. Dry it, salt it, smoke it or ferment it. Nothing fresh will last on its own.',
        open: { label: 'Keep food without a fridge', href: '/help/keep-food' },
      },
      {
        id: 'waterplan',
        text: 'Plan for dry weeks. Store more water and water the garden early in the morning.',
        open: { label: 'Guides on storing water', search: 'water storage' },
      },
      {
        id: 'heat',
        text: 'Do heavy work at dawn and dusk. Rest in the shade in the hot hours and keep drinking.',
        open: { label: 'Stay cool with no AC', href: '/help/cool' },
      },
      {
        id: 'seed',
        text: 'Save seed from your best plants. Next year’s food depends on it.',
        open: { label: 'Guides on saving seed', search: 'seed saving' },
      },
      {
        id: 'bugs',
        text: 'Keep flies and mosquitoes down. Cover food and the toilet, and empty standing water.',
        open: { label: 'Guides on mosquitoes', search: 'mosquito control' },
      },
    ],
  },
  {
    id: 'fall',
    tab: 'Fall',
    title: 'Fall',
    icon: 'leaf-maple',
    hue: 'brown',
    goal: 'The harvest is stored, the wood is stacked, and the house is ready for cold.',
    jobs: [
      {
        id: 'harvest',
        text: 'Bring in the harvest and store it well. Keep roots cool and dark, and keep grain and beans dry.',
        open: { label: 'Guides on root cellars', search: 'root cellar' },
      },
      {
        id: 'count2',
        text: 'Count your winter food. Work out how much each person can eat each day until spring.',
        open: { label: '1-year checklist', href: '/checklist/1-year' },
      },
      {
        id: 'woodpile',
        text: 'Finish the woodpile. Keep it dry and off the ground, near the door.',
        open: { label: 'Firewood for winter', href: '/help/firewood' },
      },
      {
        id: 'seal',
        text: 'Seal the house. Block drafts, hang thick covers over windows, and pick the winter room.',
        open: { label: 'Stay warm with no heat', href: '/help/warm' },
      },
      {
        id: 'clothes',
        text: 'Get winter clothes ready. Mend them, and make sure everyone has dry socks, a hat and gloves.',
        open: { label: 'Mend and sharpen', href: '/help/mend' },
      },
      {
        id: 'chimney',
        text: 'Clean the chimney and check the stove before the first fire. A blocked chimney fills the room with deadly fumes.',
        open: { label: 'Guides on chimneys', search: 'chimney' },
      },
    ],
  },
  {
    id: 'winter',
    tab: 'Winter',
    title: 'Winter',
    icon: 'snowflake',
    hue: 'violet',
    goal: 'Everyone stays warm, fed and in good spirits until the ground thaws.',
    jobs: [
      {
        id: 'oneroom',
        text: 'Live in one warm room. Share body heat, sleep off the floor, and keep everyone dry.',
        open: { label: 'Too cold', href: '/help/cold' },
      },
      {
        id: 'stick',
        text: 'Stick to the ration. Check the food store every week for rot, damp and mice.',
        open: { label: 'Guides on storing food', search: 'food storage' },
      },
      {
        id: 'vitc',
        text: 'Eat something fresh every day. Sprouted seeds, stored cabbage and potatoes stop scurvy.',
        open: { label: 'Guides on scurvy', search: 'scurvy' },
      },
      {
        id: 'fumes',
        text: 'Watch every fire. Let fresh air in, and never burn a grill or camp stove indoors.',
        open: { label: 'Guides on fumes', search: 'carbon monoxide' },
      },
      {
        id: 'mend',
        text: 'Use the dark months to mend and make. Sharpen tools, fix clothes, and teach skills to the young.',
        open: { label: 'Mend and sharpen', href: '/help/mend' },
      },
      {
        id: 'planspring',
        text: 'Plan the spring. Decide what to plant and where, and sort your seed.',
        open: { label: 'Guides on planning crops', search: 'crop rotation' },
      },
    ],
  },
  {
    id: 'rebuild',
    tab: 'Year two on',
    title: 'Year two and after',
    icon: 'hammer-wrench',
    hue: 'teal',
    goal: 'You stop living off what was left behind and start making what you need. The skills are written down and taught, so they outlast you.',
    jobs: [
      {
        id: 'teach',
        text: 'Start a school. Every child learns to read, write and count, and every adult teaches one skill.',
        open: { label: 'Teach children to read and count', href: '/help/teach' },
      },
      {
        id: 'records',
        text: 'Write things down. Keep a record of births, deaths, stores, seed and what worked.',
        open: { label: 'Guides on paper and ink', search: 'papermaking ink' },
      },
      {
        id: 'rules',
        text: 'Agree how you decide things. Hold a regular meeting, write the rules down, and settle fights in the open.',
        open: { label: 'Decide things as a group', href: '/help/meeting' },
      },
      {
        id: 'seed',
        text: 'Save your own seed every year. Bought seed runs out, and saved seed gets better suited to your land.',
        open: { label: 'Save seed for next year', href: '/help/save-seed' },
      },
      {
        id: 'animals',
        text: 'Breed your animals. Keep the best for breeding, and learn to use an ox, horse or donkey for heavy work.',
        open: { label: 'Keep goats for milk', href: '/help/goats' },
      },
      {
        id: 'grain',
        text: 'Grow a grain field and learn to thresh, store and grind it. Grain is what feeds a village through winter.',
        open: { label: 'Grain to bread', href: '/help/grain' },
      },
      {
        id: 'cloth',
        text: 'Make cloth and leather. Old clothes wear out in a few years, so learn to spin, weave and tan.',
        open: { label: 'Make thread and cloth', href: '/help/cloth' },
      },
      {
        id: 'build',
        text: 'Build to last. Learn lime mortar, brick, timber frames and a roof that sheds water.',
        open: { label: 'Build with mud bricks', href: '/help/mud-brick' },
      },
      {
        id: 'pots',
        text: 'Make pots and charcoal. Fired clay holds water and food, and charcoal burns hot enough to work metal.',
        open: { label: 'Make clay pots', href: '/help/clay-pots' },
      },
      {
        id: 'metal',
        text: 'Set up a forge. Start by reshaping scrap steel into tools, nails and blades before trying to smelt ore.',
        open: { label: 'Simple forge: shape steel', href: '/help/forge' },
      },
      {
        id: 'mill',
        text: 'Put water and wind to work. A wheel on a stream can grind grain and saw wood all day.',
        open: { label: 'Guides on mills', search: 'water wheel windmill' },
      },
      {
        id: 'health',
        text: 'Train healers. Pick two people to learn birth, wounds, teeth and fevers, and to keep everyone washing hands.',
        open: { label: 'Guides on health', search: 'midwifery public health' },
      },
      {
        id: 'trade',
        text: 'Find your neighbors and trade. Other groups have skills, seed and animals you lack.',
        open: { label: 'Guides on trade', search: 'barter trade' },
      },
    ],
    notesTitle: 'Keep in mind',
    notes: [
      'Scrap comes first. For many years it is easier to reuse steel, glass, wire and cloth from empty buildings than to make them new.',
      'Teach every skill to at least two people. A skill only one person knows is one accident from being lost.',
      'These guides are encyclopedia pages. They explain how a thing is done, but expect to practice and fail a few times.',
    ],
  },
];

const FILE = new File(Paths.document, 'year-plan.json');
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

export const isDone = (phase: string, job: string) => !!ticks()[`${phase}/${job}`];

export function toggleDone(phase: string, job: string) {
  const all = { ...ticks() };
  const key = `${phase}/${job}`;
  if (all[key]) delete all[key];
  else all[key] = true;
  cache = all;
  try {
    FILE.writeSync(JSON.stringify(all));
  } catch {
    // a lost tick is not worth interrupting anyone over
  }
}

export const doneIn = (p: PlanPhase) => p.jobs.filter((j) => isDone(p.id, j.id)).length;

/** Jobs ticked and jobs in total, across the whole year. */
export function planProgress() {
  const total = YEAR_PLAN.reduce((n, p) => n + p.jobs.length, 0);
  const done = YEAR_PLAN.reduce((n, p) => n + doneIn(p), 0);
  return { done, total };
}

/** The first phase with something still to do: where to open the plan. */
export const currentPhase = () => YEAR_PLAN.find((p) => doneIn(p) < p.jobs.length) ?? YEAR_PLAN[0];
