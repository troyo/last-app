// Everything that touches the phone's storage lives here:
// where files go, which pack is installed, and the download loop.

import { Directory, File, Paths } from './fs';
import type { DownloadTask } from './fs';
import { catalog, Item, itemsForPack, PackId } from './catalog';

const ROOT = new Directory(Paths.document, 'library');
const STATE_FILE = new File(Paths.document, 'library-state.json');

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

export function freeSpaceBytes(): number {
  try {
    return Paths.availableDiskSpace;
  } catch {
    return Number.POSITIVE_INFINITY; // not available on web
  }
}

/** How many bytes still need downloading to finish this pack. */
export function remainingBytes(pack: PackId): number {
  return itemsForPack(pack)
    .filter((i) => !isDownloaded(i))
    .reduce((s, i) => s + i.bytes, 0);
}

/** Delete every file not in the given pack (or everything, if null). */
export function removeExtras(keep: PackId | null) {
  const keepIds = new Set(keep ? itemsForPack(keep).map((i) => fileFor(i).name) : []);
  if (!ROOT.exists) return;
  for (const entry of ROOT.list()) {
    if (entry instanceof File && !keepIds.has(entry.name)) entry.delete();
  }
}

export type Progress = {
  doneItems: number;
  totalItems: number;
  currentTitle: string | null;
  currentBytes: number; // bytes of the current file
  currentTotal: number;
  failed: string[]; // titles that failed this run (will retry next time)
};

/** Wikipedia's HTML expects to load styles and images online. Strip those so
 *  the saved page is small, private, and renders cleanly with no internet. */
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

/**
 * Download everything in a pack that isn't on the phone yet.
 * Safe to stop and start again: finished files are skipped.
 */
export async function downloadPack(
  pack: PackId,
  onProgress: (p: Progress) => void,
  shouldStop: () => boolean,
  onTask?: (task: DownloadTask | null) => void,
): Promise<{ finished: boolean; failed: string[] }> {
  if (!ROOT.exists) ROOT.create({ intermediates: true });
  writeState({ pack, complete: false });

  const items = itemsForPack(pack);
  const failed: string[] = [];
  let done = items.filter(isDownloaded).length;
  const report = (title: string | null, cur = 0, tot = 0) =>
    onProgress({
      doneItems: done,
      totalItems: items.length,
      currentTitle: title,
      currentBytes: cur,
      currentTotal: tot,
      failed: [...failed],
    });
  report(null);

  for (const item of items) {
    if (shouldStop()) return { finished: false, failed };
    if (isDownloaded(item)) continue;

    const dest = fileFor(item);
    // Download to a temporary name first so a half-finished file is never
    // mistaken for a finished one.
    const partial = new File(ROOT, `${dest.name}.part`);
    if (partial.exists) partial.delete();
    report(item.title, 0, item.bytes);

    try {
      const task = File.createDownloadTask(item.url, partial, {
        onProgress: ({ bytesWritten, totalBytes }) =>
          report(item.title, bytesWritten, totalBytes > 0 ? totalBytes : item.bytes),
      });
      onTask?.(task);
      const result = await task.downloadAsync();
      onTask?.(null);
      if (!result) {
        // cancelled because the user tapped Pause
        if (partial.exists) partial.delete();
        return { finished: false, failed };
      }

      if (item.sha256) {
        const hash = await partial.digest('SHA-256');
        if (hash.toLowerCase() !== item.sha256.toLowerCase()) {
          throw new Error('File check failed (download was damaged)');
        }
      }

      if (item.type === 'article') {
        const cleaned = cleanArticleHtml(await partial.text());
        await dest.write(cleaned);
        partial.delete();
      } else {
        partial.move(dest);
      }
      done++;
      report(item.title, item.bytes, item.bytes);
    } catch (e) {
      onTask?.(null);
      if (partial.exists) partial.delete();
      if (shouldStop()) return { finished: false, failed };
      failed.push(item.title);
      report(null);
    }
  }

  const finished = failed.length === 0;
  writeState({ pack, complete: finished });
  return { finished, failed };
}

export { catalog };
