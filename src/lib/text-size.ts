// Remembers the reading size the person picked (the A− and A+ buttons in a guide).
import { PixelRatio } from 'react-native';
import { File, Paths } from './fs';

const FILE = new File(Paths.document, 'text-size.json');
export const TEXT_SIZES = [18, 21, 25, 30];
export const TEXT_SIZE_NAMES = ['Regular text', 'Large text', 'Extra large text', 'Biggest text'];
let current: number | null = null;

const clamp = (n: number) => Math.min(Math.max(Math.round(n), 0), TEXT_SIZES.length - 1);

export function getTextSize(): number {
  if (current === null) {
    // Until someone picks a size here, follow the text size set for the whole phone.
    const scale = PixelRatio.getFontScale();
    current = scale < 1.15 ? 0 : scale < 1.4 ? 1 : scale < 1.9 ? 2 : 3;
    try {
      if (FILE.exists) current = Number(JSON.parse(FILE.textSync()).size) || 0;
    } catch {
      // keep the default
    }
  }
  return clamp(current);
}

/** One size bigger (+1) or smaller (-1). Remembered for every guide. */
export function stepTextSize(by: 1 | -1): number {
  current = clamp(getTextSize() + by);
  try {
    FILE.writeSync(JSON.stringify({ size: current }));
  } catch {
    // not worth interrupting anyone over
  }
  return current;
}
