// How saved guides are listed: one row per subject, with the step-by-step
// cards that go with a topic shown first.
//
// The library holds two versions of many guides: the full one, and a shorter
// "in simple words" one. Listing both doubles every list, so they share a row.

import { Item } from './catalog';
import { findQuickHelp, QuickHelp } from './quick-help';

const EASY = ' (in simple words)';
/** Shorter than this and an easy version is only a stub: not worth offering. */
const STUB_WORDS = 250;

export const isEasy = (i: Item) => i.title.endsWith(EASY);
/** The guide's name without the "(in simple words)" tail. */
export const plainTitle = (i: Item) => (isEasy(i) ? i.title.slice(0, -EASY.length) : i.title);
const isStub = (i: Item) => typeof i.words === 'number' && i.words < STUB_WORDS;

// "wp-heat-stroke" and "simple-heat-stroke" are the same subject.
export const slugOf = (i: Item) => 'id:' + i.id.replace(/^(wp|simple)-/, '');

export type GuideRow = { item: Item; easy?: Item };

/** One row per subject. The full guide leads; a decent easy version rides along. */
export function pairUp(items: Item[]): GuideRow[] {
  const rows: GuideRow[] = [];
  const byTitle = new Map<string, GuideRow>();
  for (const item of items) {
    if (isEasy(item)) continue;
    const row: GuideRow = { item };
    rows.push(row);
    if (item.type === 'article') {
      byTitle.set(`${item.topic}/${item.title}`, row);
      byTitle.set(slugOf(item), row);
    }
  }
  for (const item of items) {
    if (!isEasy(item)) continue;
    // The two versions can have different names ("Heat stroke" and "Hyperthermia"),
    // so match on where they came from first, then on the name.
    const full = byTitle.get(slugOf(item)) ?? byTitle.get(`${item.topic}/${plainTitle(item)}`);
    if (!full) rows.push({ item });
    else if (!isStub(item) && !full.easy) full.easy = item;
  }
  return rows;
}

/** The easy version of a full guide (or the full version of an easy one), if it is in this list. */
export function otherVersion(item: Item, all: Item[]): Item | undefined {
  const want = isEasy(item) ? plainTitle(item) : item.title + EASY;
  const slug = slugOf(item);
  const other =
    all.find((i) => i.id !== item.id && isEasy(i) !== isEasy(item) && slugOf(i) === slug) ??
    all.find((i) => i.title === want && i.type === 'article');
  return other && !(isEasy(other) && isStub(other)) ? other : undefined;
}

// The step-by-step cards that belong with each topic, most urgent first.
const TOPIC_CARDS: Record<string, string[]> = {
  'first-aid': [
    'bleeding',
    'cpr',
    'choking',
    'burn',
    'broken-bone',
    'wound',
    'allergy',
    'snake-bite',
    'seizure',
    'heat',
    'cold',
    'dehydration',
    'sick',
    'tooth',
    'birth',
    'remedies',
    'elders',
    'death',
  ],
  water: ['water', 'find-water', 'store-water', 'well'],
  sanitation: ['germs', 'toilet', 'latrine', 'soap'],
  food: ['ration', 'food-cold', 'cook', 'keep-food', 'meat', 'forage', 'trap', 'grain'],
  grow: ['garden', 'staples', 'soil', 'save-seed', 'chickens', 'goats'],
  shelter: ['shelter', 'fire', 'warm', 'cool', 'firewood', 'mud-brick', 'lime'],
  power: ['power', 'light', 'phone', 'mend'],
  prep: ['lost', 'find-way', 'signal', 'calendar'],
  security: ['watch', 'meeting', 'morale', 'teach'],
  diy: ['rope', 'cloth', 'tan', 'clay-pots', 'charcoal', 'forge', 'mend'],
};

export const cardsForTopic = (topic: string): QuickHelp[] =>
  (TOPIC_CARDS[topic] ?? []).map(findQuickHelp).filter((h): h is QuickHelp => !!h);

// Which card to offer at the top of a guide: "need to act now? open the steps".
const GUIDE_CARD: [RegExp, string][] = [
  // Water first: "disinfection" must never be read as an infected wound.
  [
    /water (purification|chlorination|filter|disinfection)|disinfection|make water safe|^boiling|waterborne/i,
    'water',
  ],
  [/rainwater|water well|spring \(/i, 'find-water'],
  [/bleed|tourniquet|h(a)?emorrhage|pressure bandage|^shock/i, 'bleeding'],
  [/cardiopulmonary|\bcpr\b|recovery position|drowning|cardiac arrest/i, 'cpr'],
  [/choking|heimlich|abdominal thrust/i, 'choking'],
  [/^burn|scald/i, 'burn'],
  [/fracture|splint|sprain|dislocat/i, 'broken-bone'],
  [/heat stroke|heat exhaustion|hyperthermia|heat illness/i, 'heat'],
  [/hypothermia|frostbite/i, 'cold'],
  [/space blanket|emergency blanket/i, 'warm'],
  [/anaphyla|epinephrine|allerg/i, 'allergy'],
  [/snakebite|snake bite/i, 'snake-bite'],
  [/seizure|epilep/i, 'seizure'],
  [
    /dehydration|rehydration|diarrh|cholera|foodborne|food poisoning|gastroenteritis/i,
    'dehydration',
  ],
  [/\bwound|bandage|dressing|\binfection/i, 'wound'],
  [/childbirth|midwi/i, 'birth'],
  [/tooth|dental/i, 'tooth'],
  [/fire.?making|firelighting|tinder/i, 'fire'],
  [/bivouac|shelter|lean-to/i, 'shelter'],
  [/food preservation|drying \(food|smoking \(cooking|curing/i, 'keep-food'],
  [/food storage|rationing/i, 'ration'],
  [/latrine|sanitation/i, 'latrine'],
  [/^soap|hand washing/i, 'soap'],
  [/power outage|blackout/i, 'power'],
  [/distress signal|signal mirror/i, 'signal'],
  [/compass|orienteering|navigation/i, 'find-way'],
];

export function cardForGuide(item: Item): QuickHelp | undefined {
  const title = plainTitle(item);
  const hit = GUIDE_CARD.find(([re]) => re.test(title));
  return hit ? findQuickHelp(hit[1]) : undefined;
}
