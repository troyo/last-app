// Everything that touches the phone's storage lives here:
// where files go, which pack is installed, the catalog, and the download loop.

import {
  Catalog,
  DEMO_CATALOG,
  Download,
  downloadsForPack,
  getCatalog,
  isValidCatalog,
  Item,
  itemsForPack,
  PackId,
  setCatalog,
} from './catalog';
import { CATALOG_URL } from './config';
import type { DownloadTask } from './fs';
import { Directory, File, Paths } from './fs';

const ROOT = new Directory(Paths.document, 'library');
const STATE_FILE = new File(Paths.document, 'library-state.json');
const CATALOG_FILE = new File(Paths.document, 'catalog.json');

export type LibraryState = {
  pack: PackId | null; // the pack the user chose
  complete: boolean; // true once every file in that pack is on the phone
};

const EXT: Record<Item['type'], string> = { article: 'html', pdf: 'pdf', video: 'mp4' };

export function fileFor(item: Item): File {
  return new File(ROOT, `${item.id}.${EXT[item.type]}`);
}

export function isDownloaded(item: Item): boolean {
  return fileFor(item).exists;
}

// A small marker file says "this download finished and was unpacked".
const markerFor = (d: Download) => new File(ROOT, `${d.id}.done`);
const isDownloadDone = (d: Download) => markerFor(d).exists;

// ---------- Saved state ----------

export function readState(): LibraryState {
  try {
    if (STATE_FILE.exists) return JSON.parse(STATE_FILE.textSync());
  } catch {
    // corrupted state file: fall through to the default
  }
  return { pack: null, complete: false };
}

export function writeState(state: LibraryState) {
  STATE_FILE.writeSync(JSON.stringify(state));
}

// ---------- Catalog ----------

/** Use the catalog saved on the phone (if any). Call once at startup. */
export function loadSavedCatalog(): Catalog {
  try {
    if (CATALOG_FILE.exists) {
      const c = JSON.parse(CATALOG_FILE.textSync());
      if (isValidCatalog(c)) setCatalog(c);
    }
  } catch {
    // ignore: keep the built-in demo catalog
  }
  return getCatalog();
}

/**
 * Try to get the newest published catalog. Needs internet; quietly does
 * nothing without it. Returns true if a newer catalog was saved.
 */
export async function refreshCatalog(): Promise<boolean> {
  try {
    const res = await fetch(CATALOG_URL, { cache: 'no-store' });
    if (!res.ok) return false;
    const c = await res.json();
    if (!isValidCatalog(c)) return false;
    const cur = getCatalog();
    if (cur !== DEMO_CATALOG && cur.generated && c.generated && c.generated <= cur.generated) {
      return false; // already have this one
    }
    CATALOG_FILE.writeSync(JSON.stringify(c));
    setCatalog(c);
    return true;
  } catch {
    return false;
  }
}

// ---------- Space ----------

export function freeSpaceBytes(): number {
  try {
    return Paths.availableDiskSpace;
  } catch {
    return Number.POSITIVE_INFINITY; // not available on web
  }
}

/** How many bytes still need downloading to finish this pack. */
export function remainingBytes(pack: PackId): number {
  return downloadsForPack(pack)
    .filter((d) => !isDownloadDone(d))
    .reduce((s, d) => s + d.bytes, 0);
}

/** Delete every file not in the given pack (or everything, if null). */
export function removeExtras(keep: PackId | null) {
  const keepNames = new Set<string>();
  if (keep) {
    for (const i of itemsForPack(keep)) keepNames.add(fileFor(i).name);
    for (const d of downloadsForPack(keep)) keepNames.add(markerFor(d).name);
  }
  if (!ROOT.exists) return;
  for (const entry of ROOT.list()) {
    if (entry instanceof File && !keepNames.has(entry.name)) entry.delete();
  }
}

// ---------- Downloading ----------

export type Progress = {
  doneItems: number; // finished downloads
  totalItems: number; // downloads in the pack
  currentTitle: string | null;
  currentBytes: number; // bytes of the current file
  currentTotal: number;
  failed: string[]; // downloads that failed this run (will retry next time)
};

/** Web pages expect to load styles and images online. Strip those so the
 *  saved page is small, private, and renders cleanly with no internet. */
function cleanArticleHtml(html: string): string {
  // Keep only what's inside <body>; the app adds its own page wrapper.
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return (body ? body[1] : html)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '');
}

/** A friendly name for the progress bar. */
function labelFor(d: Download, items: Item[]): string {
  const inside = items.filter((i) => i.download === d.id);
  if (d.kind === 'bundle') return `${inside.length} guides`;
  return inside[0]?.title ?? d.id;
}

/**
 * Download everything in a pack that isn't on the phone yet.
 * Safe to stop and start again: finished downloads are skipped.
 */
export async function downloadPack(
  pack: PackId,
  onProgress: (p: Progress) => void,
  shouldStop: () => boolean,
  onTask?: (task: DownloadTask | null) => void,
): Promise<{ finished: boolean; failed: string[] }> {
  if (!ROOT.exists) ROOT.create({ intermediates: true });
  writeState({ pack, complete: false });

  const downloads = downloadsForPack(pack);
  const items = itemsForPack(pack);
  const failed: string[] = [];
  let done = downloads.filter(isDownloadDone).length;
  const report = (title: string | null, cur = 0, tot = 0) =>
    onProgress({
      doneItems: done,
      totalItems: downloads.length,
      currentTitle: title,
      currentBytes: cur,
      currentTotal: tot,
      failed: [...failed],
    });
  report(null);

  for (const d of downloads) {
    if (shouldStop()) return { finished: false, failed };
    if (isDownloadDone(d)) continue;

    const label = labelFor(d, items);
    // Download to a temporary name first so a half-finished file is never
    // mistaken for a finished one.
    const partial = new File(ROOT, `${d.id}.part`);
    if (partial.exists) partial.delete();
    report(label, 0, d.bytes);

    try {
      const task = File.createDownloadTask(d.url, partial, {
        onProgress: ({ bytesWritten, totalBytes }) => {
          try {
            report(label, bytesWritten, totalBytes > 0 ? totalBytes : d.bytes);
          } catch {
            // a progress hiccup must never stop the download
          }
        },
      });
      onTask?.(task);
      const result = await task.downloadAsync();
      onTask?.(null);
      if (!result) {
        // cancelled because the user tapped Pause
        if (partial.exists) partial.delete();
        return { finished: false, failed };
      }

      if (d.sha256) {
        const hash = await partial.digest('SHA-256');
        if (hash.toLowerCase() !== d.sha256.toLowerCase()) {
          throw new Error('File check failed (download was damaged)');
        }
      }

      const mine = items.filter((i) => i.download === d.id);
      if (d.kind === 'bundle') {
        // One JSON file holding many cleaned articles: split it into one
        // file per article so reading never has to load the whole bundle.
        const bundle: Record<string, string> = JSON.parse(await partial.text());
        for (const item of mine) {
          const html = bundle[item.id];
          if (html !== undefined) await fileFor(item).write(html);
        }
        partial.delete();
      } else if (d.kind === 'html') {
        await fileFor(mine[0]).write(cleanArticleHtml(await partial.text()));
        partial.delete();
      } else {
        const dest = fileFor(mine[0]);
        if (dest.exists) dest.delete();
        partial.move(dest);
      }
      markerFor(d).writeSync('ok');
      done++;
      report(label, d.bytes, d.bytes);
    } catch {
      onTask?.(null);
      if (partial.exists) partial.delete();
      if (shouldStop()) return { finished: false, failed };
      failed.push(label);
      report(null);
    }
  }

  const finished = failed.length === 0;
  writeState({ pack, complete: finished });
  return { finished, failed };
}
