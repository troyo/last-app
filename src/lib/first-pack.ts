// Remembers that we already offered the free guides during setup,
// so the offer is made once and never nags.
import { File, Paths } from './fs';

const FILE = new File(Paths.document, 'first-pack.json');

export function packOffered(): boolean {
  try {
    return FILE.exists;
  } catch {
    return true; // if we can't tell, don't get in the way
  }
}

export function recordPackOffered() {
  try {
    FILE.writeSync(JSON.stringify({ at: new Date().toISOString() }));
  } catch {
    // worst case we offer once more next time
  }
}
