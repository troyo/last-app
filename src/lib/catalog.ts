// The catalog describes every guide the app knows about, which pack
// (small / medium / large) it belongs to, and which file to download for it.
//
// Packs are cumulative: Medium = Small + more, Large = Medium + more.
//
// Two kinds of things:
//   - items: what people read (an article, a PDF, a video)
//   - downloads: what the phone fetches. A PDF is one download. Articles are
//     grouped into "bundles" (~20 MB JSON files) so a pack is a few dozen
//     downloads instead of thousands.
//
// The real catalog is built by tools/build-packs.mjs and published with the
// packs. The app ships with a small demo catalog so it works out of the box.

import demoCatalog from './demo-catalog.json';

export type PackId = 'small' | 'medium' | 'large';
export type ItemType = 'article' | 'pdf' | 'video';

export type Pack = { id: PackId; title: string; summary: string; bytes?: number };
export type Topic = { id: string; title: string; icon: string };

export type Download = {
  id: string;
  tier: PackId;
  // bundle: JSON file of { itemId: html } (cleaned articles)
  // file:   one PDF / video, saved as-is
  // html:   one raw web page, cleaned on the phone (used by the demo)
  kind: 'bundle' | 'file' | 'html';
  url: string;
  bytes: number;
  sha256?: string;
};

export type Item = {
  id: string;
  title: string;
  topic: string;
  tier: PackId;
  type: ItemType;
  download: string; // id of the Download that contains this item
  source: string;
  license: string;
  sourceUrl?: string;
  summary?: string; // first sentence or two, for search
};

export type Catalog = {
  version: number;
  generated?: string;
  name: string;
  note?: string;
  packs: Pack[];
  topics: Topic[];
  downloads: Download[];
  items: Item[];
};

export const DEMO_CATALOG = demoCatalog as Catalog;

// The catalog currently in use. Starts as the demo; replaced by the
// published one once the phone has fetched it (see library.ts).
let current: Catalog = DEMO_CATALOG;
export const getCatalog = () => current;
export const setCatalog = (c: Catalog) => {
  current = { ...c, items: c.items.filter(looksEnglish).map(tidyTitle) };
};

// A safety net on the phone: packs are built English-only, but an older pack
// may still list translated pages. Hide anything that isn't English.
const NON_LATIN =
  /[\u0370-\u03FF\u0400-\u052F\u0590-\u08FF\u0900-\u0DFF\u0E00-\u0FFF\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/;
const EN_WORDS = new Set(
  'the of and to in is for that with as are on be by it this or from an can at which not have you your when if will should was these'.split(
    ' ',
  ),
);
const OTHER_WORDS = new Set(
  'el la los las del que y en un una por para con es se le les des et est une du pour dans der die das und ist nicht ein eine von mit zu den auf o os do da em um uma não com il di che per è della sono van het een op te zijn na się w z jest nie și în'.split(
    ' ',
  ),
);
function looksEnglish(item: Item): boolean {
  const text = `${item.title} ${item.summary ?? ''}`;
  if (NON_LATIN.test(text) || /\/[a-z]{2,3}$/.test(item.title)) return false;
  let en = 0;
  let other = 0;
  for (const w of text.toLowerCase().match(/[a-zà-ÿ']+/g) ?? []) {
    if (EN_WORDS.has(w)) en++;
    else if (OTHER_WORDS.has(w)) other++;
  }
  return !(other >= 3 && other > en);
}
const tidyTitle = (item: Item): Item =>
  item.title.includes('&')
    ? {
        ...item,
        title: item.title
          .replace(/&amp;/g, '&')
          .replace(/&#0?39;/g, "'")
          .replace(/&quot;/g, '"'),
      }
    : item;

const ORDER: PackId[] = ['small', 'medium', 'large'];
const inPack = (tier: PackId, pack: PackId) => ORDER.indexOf(tier) <= ORDER.indexOf(pack);

/** Everything readable in a pack (including the smaller packs it builds on). */
export function itemsForPack(pack: PackId, cat: Catalog = current): Item[] {
  return cat.items.filter((i) => inPack(i.tier, pack));
}

export function downloadsForPack(pack: PackId, cat: Catalog = current): Download[] {
  return cat.downloads.filter((d) => inPack(d.tier, pack));
}

export function packBytes(pack: PackId, cat: Catalog = current): number {
  return downloadsForPack(pack, cat).reduce((sum, d) => sum + d.bytes, 0);
}

export function findItem(id: string, cat: Catalog = current): Item | undefined {
  return cat.items.find((i) => i.id === id);
}

export function findTopic(id: string, cat: Catalog = current): Topic | undefined {
  return cat.topics.find((t) => t.id === id);
}

export function isValidCatalog(c: unknown): c is Catalog {
  const x = c as Catalog;
  return (
    !!x &&
    x.version >= 2 &&
    Array.isArray(x.packs) &&
    Array.isArray(x.topics) &&
    Array.isArray(x.downloads) &&
    Array.isArray(x.items)
  );
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = n / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[u]}`;
}
