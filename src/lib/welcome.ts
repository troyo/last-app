// Remembers whether this phone has seen the welcome explainer.
import { File, Paths } from './fs';

const FLAG = new File(Paths.document, 'welcome-seen.json');

// Checked once, then remembered: Home asks this every time it draws.
let seen = false;
export function hasSeenWelcome(): boolean {
  if (seen) return true;
  try {
    seen = FLAG.exists;
  } catch {
    seen = true; // never trap someone on the welcome screen
  }
  return seen;
}

export function markWelcomeSeen() {
  try {
    FLAG.writeSync('{"seen":true}');
    seen = true;
  } catch {
    // not worth interrupting anyone over
  }
}
