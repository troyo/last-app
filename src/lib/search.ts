// Search that understands everyday words. Typing "cut" finds bleeding,
// "thirsty" finds water, and several words narrow the results down.
// It looks through every guide in the catalog (title, summary and topic),
// plus the built-in emergency cards, and puts the best matches first.

import { Catalog, getCatalog, Item, PackId } from './catalog';
import { File, Paths } from './fs';
import { Hazard, HAZARDS } from './hazards';
import { isDownloaded } from './library';
import { helpText, QUICK_HELP, QuickHelp } from './quick-help';

// Everyday word -> the words guides actually use.
export const SYNONYMS: Record<string, string[]> = {
  cut: ['bleeding', 'wound', 'laceration'],
  blood: ['bleeding', 'wound'],
  bleed: ['bleeding', 'tourniquet'],
  stitch: ['suture', 'wound'],
  burn: ['burn', 'scald'],
  burnt: ['burn'],
  choke: ['choking'],
  cpr: ['cardiopulmonary', 'resuscitation', 'breathing'],
  heart: ['cardiac', 'cardiopulmonary', 'chest'],
  broke: ['fracture', 'broken', 'splint'],
  broken: ['fracture', 'splint'],
  sprain: ['sprain', 'splint'],
  cold: ['hypothermia', 'frostbite', 'cold'],
  freezing: ['hypothermia', 'frostbite'],
  hot: ['heat', 'hyperthermia'],
  heatstroke: ['heat', 'hyperthermia'],
  thirsty: ['water', 'dehydration'],
  drink: ['water', 'drinking'],
  dirty: ['purification', 'sanitation', 'filter'],
  purify: ['purification', 'filter', 'boil', 'water'],
  filter: ['filtration', 'purification'],
  hungry: ['food', 'foraging', 'ration'],
  eat: ['food', 'edible', 'cooking'],
  cook: ['cooking', 'stove', 'cookbook'],
  can: ['canning', 'preserving'],
  store: ['storage', 'preservation'],
  grow: ['garden', 'gardening', 'seed', 'agriculture'],
  garden: ['gardening', 'vegetable', 'seed'],
  hunt: ['hunting', 'trapping', 'snare'],
  fish: ['fishing'],
  lost: ['navigation', 'compass', 'map', 'signal'],
  map: ['navigation', 'map', 'compass'],
  dark: ['flashlight', 'lantern', 'candle', 'lighting'],
  power: ['electricity', 'generator', 'battery', 'solar'],
  blackout: ['power', 'outage', 'electricity'],
  electricity: ['electricity', 'generator', 'solar', 'battery'],
  radio: ['radio', 'amateur', 'communication'],
  phone: ['radio', 'communication', 'signal'],
  sick: ['fever', 'infection', 'diarrhea', 'illness'],
  poop: ['sanitation', 'toilet', 'latrine', 'diarrhea'],
  toilet: ['sanitation', 'latrine', 'toilet'],
  bite: ['snakebite', 'bite', 'sting', 'rabies'],
  snake: ['snakebite', 'snake'],
  poison: ['poisoning', 'toxic', 'venom'],
  storm: ['hurricane', 'tornado', 'flood', 'storm'],
  quake: ['earthquake'],
  nuke: ['nuclear', 'fallout', 'radiation'],
  bomb: ['nuclear', 'fallout', 'shelter'],
  tent: ['shelter', 'tent', 'tarp'],
  camp: ['shelter', 'camping', 'bivouac'],
  rope: ['knot', 'rope', 'cordage'],
  tie: ['knot'],
  gun: ['firearm', 'marksmanship'],
  safe: ['safety', 'security'],
  baby: ['infant', 'childbirth', 'pediatric'],
  birth: ['childbirth', 'labor'],
  teeth: ['dental', 'tooth'],
  tooth: ['dental', 'toothache'],
  bugout: ['bug-out', 'evacuation', 'kit'],
  kit: ['kit', 'bag', 'supplies'],
  prep: ['preparedness', 'survival', 'kit'],
};

const PACK_ORDER: PackId[] = ['small', 'medium', 'large'];

export type GuideHit = { item: Item; score: number };
export type SearchResults = {
  help: QuickHelp[];
  hazards: Hazard[];
  guides: GuideHit[];
  total: number;
};

// One lowercase "haystack" per guide, built once per catalog.
let indexedFor: Catalog | null = null;
let index: { item: Item; title: string; rest: string; manual: boolean }[] = [];

/** Get the search index ready ahead of the first search, so typing never waits on it. */
export const warmSearch = () => ensureIndex();

function ensureIndex() {
  const cat = getCatalog();
  if (indexedFor === cat) return;
  const topicTitle = new Map(cat.topics.map((t) => [t.id, t.title.toLowerCase()]));
  index = cat.items.map((item) => ({
    item,
    title: item.title.toLowerCase(),
    rest: `${item.summary?.toLowerCase() ?? ''} ${topicTitle.get(item.topic) ?? ''}`,
    manual: item.type === 'pdf' || !/wikipedia/i.test(item.source),
  }));
  indexedFor = cat;
}

// Filler words that say nothing about the topic.
const STOP = new Set(
  'a an the to of in on for my me our your his her their friend someone somebody person bad really very please help should would could is are i we and or with without how do does can what when if it no not need get make have has out'.split(
    ' ',
  ),
);

/** Split what was typed into words, with plurals trimmed ("burns" -> "burn"). */
export function wordsOf(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w));
}

/** How well one typed word matches one guide (0 = not at all). */
function wordScore(word: string, title: string, rest: string): number {
  if (title.startsWith(word)) return 12;
  if (title.includes(word)) return 8;
  if (rest.includes(word)) return 3;
  let best = 0;
  for (const alt of SYNONYMS[word] ?? []) {
    if (title.includes(alt)) best = Math.max(best, 5);
    else if (rest.includes(alt)) best = Math.max(best, 2);
  }
  return best;
}

export function search(query: string, limit = 60): SearchResults {
  const words = wordsOf(query);
  if (words.length === 0) return { help: [], hazards: [], guides: [], total: 0 };
  ensureIndex();

  const help = QUICK_HELP.filter((h) => {
    const hay = helpText(h).toLowerCase();
    return words.every((w) => wordScore(w, hay, '') > 0);
  });

  const hazards = HAZARDS.filter((h) => {
    const hay = `${h.title} ${h.blurb} ${h.search}`.toLowerCase();
    return words.every((w) => wordScore(w, hay, '') > 0);
  });

  // First try guides that match every word. If there are none, fall back to
  // guides that match at least one, so a search never comes back empty-handed
  // just because of one unusual word.
  const collect = (needAll: boolean) => {
    const out: GuideHit[] = [];
    for (const entry of index) {
      let score = 0;
      let matched = 0;
      for (const w of words) {
        const ws = wordScore(w, entry.title, entry.rest);
        if (ws > 0) matched++;
        score += ws;
      }
      if (matched === 0 || (needAll && matched < words.length)) continue;
      // Small boosts: short, to-the-point titles and plain-language versions first;
      // guides from smaller packs before deep-cut ones.
      if (entry.title.length < 30) score += 1;
      if (entry.title.includes('simple words')) score += 1;
      // Real how-to manuals (Army, Peace Corps, USDA...) beat an encyclopedia page on the same thing.
      if (entry.manual) score += 3;
      score += (2 - PACK_ORDER.indexOf(entry.item.tier)) * 0.5 + matched * 4;
      out.push({ item: entry.item, score });
    }
    return out;
  };
  let hits = collect(true);
  if (hits.length === 0 && words.length > 1) hits = collect(false);
  // What is already on the phone comes first: that is what can help right now.
  const have = new Map(hits.map((h) => [h.item.id, isDownloaded(h.item) ? 1 : 0]));
  hits.sort(
    (a, b) =>
      have.get(b.item.id)! - have.get(a.item.id)! ||
      b.score - a.score ||
      a.item.title.localeCompare(b.item.title),
  );
  return { help, hazards, guides: hits.slice(0, limit), total: hits.length };
}

// ---------- Recent searches ----------

const RECENT = new File(Paths.document, 'recent-searches.json');
let recent: string[] | null = null;

export function recentSearches(): string[] {
  if (recent === null) {
    recent = [];
    try {
      if (RECENT.exists) recent = JSON.parse(RECENT.textSync());
    } catch {
      // start fresh
    }
  }
  return recent ?? [];
}

export function rememberSearch(query: string) {
  const q = query.trim();
  if (q.length < 2) return;
  recent = [q, ...recentSearches().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
  try {
    RECENT.writeSync(JSON.stringify(recent));
  } catch {
    // not worth interrupting anyone over
  }
}

export const SUGGESTED = [
  'clean water',
  'bleeding',
  'fire',
  'food storage',
  'power outage',
  'knots',
  'radio',
  'shelter',
];
