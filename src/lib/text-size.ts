// Remembers the reading size the person picked (the "Aa" button in a guide).
import { File, Paths } from './fs';

const FILE = new File(Paths.document, 'text-size.json');
export const TEXT_SIZES = [18, 21, 25]; // comfortable, large, extra large
let current: number | null = null;

export function getTextSize(): number {
  if (current === null) {
    current = 0;
    try {
      if (FILE.exists) current = Number(JSON.parse(FILE.textSync()).size) || 0;
    } catch {
      // keep the default
    }
  }
  return Math.min(Math.max(current, 0), TEXT_SIZES.length - 1);
}

/** Step to the next size (wraps around) and remember it. */
export function nextTextSize(): number {
  current = (getTextSize() + 1) % TEXT_SIZES.length;
  try {
    FILE.writeSync(JSON.stringify({ size: current }));
  } catch {
    // not worth interrupting anyone over
  }
  return current;
}
