// Remembers that we already offered the free guides during setup,
// so the offer is made once and never nags.
import { File, Paths } from './fs';

const FILE = new File(Paths.document, 'first-pack.json');

// Checked once, then remembered: Home asks this every time it draws.
let offered = false;
export function packOffered(): boolean {
  if (offered) return true;
  try {
    offered = FILE.exists;
  } catch {
    offered = true; // if we can't tell, don't get in the way
  }
  return offered;
}

export function recordPackOffered() {
  try {
    FILE.writeSync(JSON.stringify({ at: new Date().toISOString() }));
    offered = true;
  } catch {
    // worst case we offer once more next time
  }
}
