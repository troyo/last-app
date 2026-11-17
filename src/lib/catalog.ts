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
  current = c;
};

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
