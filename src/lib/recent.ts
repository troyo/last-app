// Remembers the last few emergency cards you opened, so they are one tap away next time.
// Under stress people forget where they found something a minute ago.
import { File, Paths } from './fs';

const FILE = new File(Paths.document, 'recent-help.json');
let cache: string[] | null = null;

export function recentHelp(): string[] {
  if (cache) return cache;
  try {
    cache = FILE.exists ? (JSON.parse(FILE.textSync()) as string[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

export function noteOpened(id: string) {
  cache = [id, ...recentHelp().filter((r) => r !== id)].slice(0, 3);
  try {
    FILE.writeSync(JSON.stringify(cache));
  } catch {
    // not worth interrupting anyone over
  }
}
