// Remembers whether this phone has seen the welcome explainer.
import { File, Paths } from './fs';

const FLAG = new File(Paths.document, 'welcome-seen.json');

export function hasSeenWelcome(): boolean {
  try {
    return FLAG.exists;
  } catch {
    return true; // never trap someone on the welcome screen
  }
}

export function markWelcomeSeen() {
  try {
    FLAG.writeSync('{"seen":true}');
  } catch {
    // not worth interrupting anyone over
  }
}
