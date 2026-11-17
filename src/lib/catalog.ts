// The catalog describes every piece of content the app knows about,
// and which pack (small / medium / large) each piece belongs to.
//
// Packs are cumulative: Medium = Small + more, Large = Medium + more.
// Each item is downloaded as its own file, so a dropped connection only
// costs you the file you were on, not the whole pack.

import demoCatalog from './demo-catalog.json';

export type PackId = 'small' | 'medium' | 'large';
export type ItemType = 'article' | 'pdf' | 'video';

export type Pack = { id: PackId; title: string; summary: string };
export type Topic = { id: string; title: string; icon: string };

export type Item = {
  id: string;
  title: string;
  topic: string;
  tier: PackId;
  type: ItemType;
  url: string;
  bytes: number; // expected size, used for the size estimate + space check
  sha256?: string; // optional: if set, the download is verified
  source: string;
  license: string;
  sourceUrl?: string;
};

export type Catalog = {
  version: number;
  name: string;
  note?: string;
  packs: Pack[];
  topics: Topic[];
  items: Item[];
};

// Later this can be fetched from your own server so you can add content
// without shipping a new app version. For now it's bundled in the app.
export const catalog: Catalog = demoCatalog as Catalog;

const ORDER: PackId[] = ['small', 'medium', 'large'];

/** Everything that belongs in a pack (including the smaller packs it builds on). */
export function itemsForPack(pack: PackId, cat: Catalog = catalog): Item[] {
  const max = ORDER.indexOf(pack);
  return cat.items.filter((i) => ORDER.indexOf(i.tier) <= max);
}

export function packBytes(pack: PackId, cat: Catalog = catalog): number {
  return itemsForPack(pack, cat).reduce((sum, i) => sum + i.bytes, 0);
}

export function findItem(id: string, cat: Catalog = catalog): Item | undefined {
  return cat.items.find((i) => i.id === id);
}

export function findTopic(id: string, cat: Catalog = catalog): Topic | undefined {
  return cat.topics.find((t) => t.id === id);
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
