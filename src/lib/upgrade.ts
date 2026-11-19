// What the next pack up would add for this person, so an upgrade prompt can show real guides
// instead of a sales line. Free people are shown Medium; Medium owners are shown Large.
//
// Also remembers "Not now" on the home screen, so the prompt steps aside for a while and
// never nags.

import { findTopic, getCatalog, Item, itemsForPack, PackId } from './catalog';
import { File, Paths } from './fs';
import { priceOf, ProductKey, Tier } from './purchases';

export type Pitch = {
  /** The pack being offered. */
  target: 'medium' | 'large';
  product: ProductKey;
  price: string;
  /** What Large costs on its own, to show a Medium owner what they save. */
  fullPrice?: string;
  /** Guides in the target pack that this person can't open yet. */
  extra: number;
  /** The biggest topics in those extra guides, largest first. `title` is a short label. */
  topics: { id: string; title: string; count: number }[];
  /** A few well-known books from those extra guides, e.g. the Army survival manual. */
  highlights: string[];
};

const OWNED_PACK: Record<Tier, PackId> = { free: 'small', medium: 'medium', large: 'large' };

// Topics people care about most go first when picking example books.
const TOPIC_ORDER = [
  'manuals',
  'first-aid',
  'food',
  'water',
  'grow',
  'power',
  'shelter',
  'diy',
  'sanitation',
  'prep',
  'security',
  'books',
];

// Topic names short enough for a chip.
const SHORT_TOPIC: Record<string, string> = {
  'first-aid': 'First aid',
  water: 'Water',
  sanitation: 'Staying clean',
  food: 'Food',
  grow: 'Growing food',
  shelter: 'Shelter',
  power: 'Power',
  prep: 'Getting ready',
  security: 'Staying safe',
  manuals: 'Field manuals',
  diy: 'Build & repair',
  books: 'Handbooks',
};

/**
 * "Survival, FM 21-76 (US Army)" -> "Survival, FM 21-76", and
 * "Survival, Evasion and Recovery, FM 3-50.3 (multi-service)" -> "Survival, Evasion and Recovery".
 * Keeps names short on a phone; the manual number stays only when the name needs it.
 */
export const shortTitle = (title: string) => {
  const name = title
    .replace(/(?:\s*\([^()]*\))+\s*$/, '')
    .replace(/:\s.*$/, '')
    .trim();
  const bare = name.replace(/,\s*(?:FM|ATP|TC|TM|MCRP|IN|MD)\s?[\w.-]+$/, '');
  return bare.length >= 12 ? bare : name;
};

let memo: { key: string; pitch: Pitch | null } | null = null;

/** The pitch for this tier, or null for people who already own everything. */
export function pitchFor(tier: Tier): Pitch | null {
  if (tier === 'large') return null;
  const cat = getCatalog();
  const target = tier === 'free' ? 'medium' : 'large';
  const key = `${tier}:${cat.version}:${cat.generated}:${cat.items.length}:${priceOf('upgrade')}:${priceOf('medium')}`;
  if (memo?.key === key) return memo.pitch;

  const adds = whatPackAdds(target, OWNED_PACK[tier]);
  const product: ProductKey = tier === 'free' ? 'medium' : 'upgrade';
  const pitch: Pitch = {
    target,
    product,
    price: priceOf(product),
    fullPrice: tier === 'medium' ? priceOf('large') : undefined,
    ...adds,
  };
  memo = { key, pitch };
  return pitch;
}

export type Adds = Pick<Pitch, 'extra' | 'topics' | 'highlights'>;
const addsMemo = new Map<string, Adds>();

/** What a pack has that a smaller one doesn't (or everything in it, with no `from`). */
export function whatPackAdds(pack: PackId, from?: PackId): Adds {
  const cat = getCatalog();
  const key = `${cat.version}:${cat.generated}:${cat.items.length}:${pack}:${from ?? ''}`;
  const hit = addsMemo.get(key);
  if (hit) return hit;
  const have = new Set(from ? itemsForPack(from, cat).map((i) => i.id) : []);
  const extra = itemsForPack(pack, cat).filter((i) => !have.has(i.id));
  const byTopic = new Map<string, number>();
  for (const i of extra) byTopic.set(i.topic, (byTopic.get(i.topic) ?? 0) + 1);
  const topics = [...byTopic.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      title: SHORT_TOPIC[id] ?? findTopic(id, cat)?.title ?? id,
      count,
    }));
  const adds = { extra: extra.length, topics, highlights: pickHighlights(extra) };
  addsMemo.set(key, adds);
  return adds;
}

// Books worth naming, with a plain name for each: "Survival, FM 21-76" means nothing to
// someone new to this. Shown first when a pack has them; anything else falls back to one
// full manual per topic under its own (shortened) title.
const STARS: [RegExp, string][] = [
  [/^Survival, FM 21-76/, 'The US Army survival manual'],
  [/Home Canning/, 'The USDA home canning guide'],
  [/Ranger Medic Handbook/, 'The Army Ranger medic handbook'],
  [/^Prolonged Casualty Care/, 'Caring for the badly hurt'],
  [/^Passive Solar Buildings/, 'Heating a home with no power'],
  [/^Wilderness Medicine/, 'Wilderness medicine course'],
  [/^Rigging: Rope, Knots/, 'Ropes, knots and heavy loads'],
  [/^First Aid for Soldiers/, 'The Army first aid manual'],
  [/^Map Reading and Land Navigation/, 'Map and compass navigation'],
];

/** Up to three books, favoring well-known manuals and then one per topic. */
function pickHighlights(extra: Item[]): string[] {
  const books = extra.filter((i) => i.type !== 'article');
  const pool = books.length >= 3 ? books : extra;
  const out: string[] = [];
  const usedTopics = new Set<string>();
  const take = (i: Item, name = shortTitle(i.title)) => {
    if (out.length === 3 || out.includes(name) || name.length < 6 || name.length > 48) return;
    usedTopics.add(i.topic);
    out.push(name);
  };
  for (const [star, name] of STARS) {
    const hit = pool.find((i) => star.test(i.title));
    if (hit) take(hit, name);
  }
  const rank = (t: string) => {
    const r = TOPIC_ORDER.indexOf(t);
    return r < 0 ? 99 : r;
  };
  for (const i of [...pool].sort((a, b) => rank(a.topic) - rank(b.topic)))
    if (!usedTopics.has(i.topic)) take(i);
  return out;
}

/** Locked guides in one topic that the next pack would open, for a topic page footer. */
export function lockedInTopic(tier: Tier, topic: string): number {
  if (tier === 'large') return 0;
  const cat = getCatalog();
  const have = new Set(itemsForPack(OWNED_PACK[tier], cat).map((i) => i.id));
  return cat.items.filter((i) => i.topic === topic && !have.has(i.id)).length;
}

// ---------------------------------------------------------------------------
// "Not now" on the home screen: hide the prompt for two weeks.

const SNOOZE_DAYS = 14;
const SNOOZE = new File(Paths.document, 'upgrade-snooze.json');

export function isSnoozed(): boolean {
  try {
    if (!SNOOZE.exists) return false;
    const until = JSON.parse(SNOOZE.textSync()).until;
    return typeof until === 'number' && Date.now() < until;
  } catch {
    return false;
  }
}

export function snooze() {
  try {
    SNOOZE.writeSync(JSON.stringify({ until: Date.now() + SNOOZE_DAYS * 24 * 3600 * 1000 }));
  } catch {
    // Can't save: it still hides for this visit.
  }
}
