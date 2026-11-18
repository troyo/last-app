import { File, Paths } from './fs';
import { getProfile, waterPerDay } from './place';

// The leader's notebook: how many people, how much water and food is left,
// who is sick and who does which job. Kept on the phone, never sent anywhere.

export type SickEntry = { id: string; name: string; note: string; since: number };

export type Group = {
  people: number;
  /** Gallons of safe water on hand, as last counted. */
  water: number;
  /** Days of food for ONE adult, as last counted. */
  food: number;
  /** When water and food were last counted (ms). 0 = never. */
  countedAt: number;
  sick: SickEntry[];
  /** Job id to the name of whoever does it. */
  jobs: Record<string, string>;
};

export const JOBS: { id: string; title: string; icon: string }[] = [
  { id: 'water', title: 'Water', icon: 'water' },
  { id: 'fire', title: 'Fire and cooking', icon: 'fire' },
  { id: 'food', title: 'Food store', icon: 'scale-balance' },
  { id: 'latrine', title: 'Latrine and hand washing', icon: 'hand-wash' },
  { id: 'sick', title: 'Caring for the sick', icon: 'bed' },
  { id: 'children', title: 'Children', icon: 'human-male-child' },
  { id: 'watch', title: 'Night watch', icon: 'shield-account' },
  { id: 'garden', title: 'Garden and animals', icon: 'sprout' },
];

const FILE = new File(Paths.document, 'group.json');
let cache: Group | null = null;

export function getGroup(): Group {
  if (cache) return cache;
  const blank: Group = {
    people: getProfile()?.people ?? 1,
    water: 0,
    food: 0,
    countedAt: 0,
    sick: [],
    jobs: {},
  };
  try {
    cache = FILE.exists ? { ...blank, ...(JSON.parse(FILE.textSync()) as Partial<Group>) } : blank;
  } catch {
    cache = blank;
  }
  return cache;
}

export function saveGroup(change: Partial<Group>): Group {
  cache = { ...getGroup(), ...change };
  try {
    FILE.writeSync(JSON.stringify(cache));
  } catch {
    // keep going with what is in memory
  }
  return cache;
}

const DAY = 24 * 60 * 60 * 1000;
export const daysSince = (ms: number, now = Date.now()) =>
  ms ? Math.max(0, Math.floor((now - ms) / DAY)) : 0;

/** How long the water and food last for this many people, from the day they were counted. */
export function supply(g: Group, now = Date.now()) {
  const people = Math.max(1, g.people);
  const perDay = waterPerDay(getProfile());
  const waterDays = g.water / (people * perDay);
  const foodDays = g.food / people;
  const gone = daysSince(g.countedAt, now);
  return {
    waterPerDay: perDay,
    waterDays: Math.max(0, Math.floor(waterDays - gone)),
    foodDays: Math.max(0, Math.floor(foodDays - gone)),
    /** Days of food if everyone eats half shares. */
    foodDaysHalf: Math.max(0, Math.floor((foodDays - gone) * 2)),
    counted: g.countedAt > 0,
    daysSinceCount: gone,
  };
}
