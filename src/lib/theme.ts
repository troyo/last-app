import { useColorScheme } from 'react-native';

// Clean and calm: a bright, neutral page, crisp near-black text and one confident green.
// Every text color here passes the strictest contrast test (AAA) on its background,
// so nothing is faint. Red is saved for real problems.
const light = {
  bg: '#F4F6F5', // soft neutral, so white cards stand out
  card: '#FFFFFF',
  soft: '#E6F2EC', // pale green, for gentle highlights
  text: '#0B1A15', // near-black
  // Secondary text. Dark on purpose: nothing in this app should be faint or hard to read.
  muted: '#33443D',
  border: '#DDE4E0',
  accent: '#0B6B4F', // green: buttons and links
  accentText: '#FFFFFF',
  header: '#0B5A43', // the green band at the top of home
  dangerTint: '#FDECE8', // soft red behind "needs more than home care"
  sun: '#F6B93B', // highlights
  coral: '#F08A6B',
  good: '#0B6B4F',
  warn: '#8A5300',
  bad: '#B3311F',
};

// Follows the phone: when it is set to dark, so is the app. True dark, easy on the eyes
// at night and kind to the battery, with text that is bright but not glaring.
const dark: typeof light = {
  bg: '#0B1210',
  card: '#161F1C',
  soft: '#1F2D28',
  text: '#F1F5F3',
  muted: '#C6D2CC',
  border: '#2A3833',
  accent: '#63D6A8',
  accentText: '#06231A',
  header: '#0E3B2E',
  dangerTint: '#3A1F1B',
  sun: '#F6B93B',
  coral: '#F4A088',
  good: '#63D6A8',
  warn: '#F3C567',
  bad: '#FF9C8A',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** True when the phone is in dark mode. */
export const useDark = () => useColorScheme() === 'dark';

// The soft circles behind icons, re-tuned for dark mode: a deep tint with a bright drawing.
export const DARK_HUES: Record<string, { color: string; tint: string }> = {
  '#FBE3DC': { color: '#FF9C8A', tint: '#3B211D' },
  '#FDE9DF': { color: '#FFA988', tint: '#3A261D' },
  '#FCEFC9': { color: '#F3C567', tint: '#372C12' },
  '#DFF1E4': { color: '#63D6A8', tint: '#173227' },
  '#D9EFEC': { color: '#5FD0C6', tint: '#143230' },
  '#DCEBF8': { color: '#8EC1F5', tint: '#17293B' },
  '#E9E3F7': { color: '#BBA6F2', tint: '#2A2340' },
  '#F3E6D6': { color: '#E0B487', tint: '#33271A' },
};

// Icon colors: a strong color for the drawing and a soft tint behind it.
export const HUES = {
  red: { color: '#C2452F', tint: '#FBE3DC' },
  coral: { color: '#D9643F', tint: '#FDE9DF' },
  sun: { color: '#B97A06', tint: '#FCEFC9' },
  green: { color: '#1F7A55', tint: '#DFF1E4' },
  teal: { color: '#12766F', tint: '#D9EFEC' },
  blue: { color: '#2B6CB0', tint: '#DCEBF8' },
  violet: { color: '#6B4FB3', tint: '#E9E3F7' },
  brown: { color: '#8A5A2B', tint: '#F3E6D6' },
} as const;
export type Hue = keyof typeof HUES;

// How each topic looks on the home screen. Unknown topics get a book.
export const TOPIC_LOOK: Record<string, { icon: string; hue: Hue }> = {
  'first-aid': { icon: 'bandage', hue: 'red' },
  water: { icon: 'water', hue: 'blue' },
  food: { icon: 'food-apple', hue: 'coral' },
  shelter: { icon: 'campfire', hue: 'brown' },
  power: { icon: 'flashlight', hue: 'sun' },
  prep: { icon: 'bag-personal', hue: 'blue' },
  manuals: { icon: 'book-open-variant', hue: 'teal' },
  grow: { icon: 'sprout', hue: 'green' },
  sanitation: { icon: 'hand-wash', hue: 'teal' },
  security: { icon: 'account-group', hue: 'violet' },
  diy: { icon: 'hammer-wrench', hue: 'sun' },
  books: { icon: 'bookshelf', hue: 'teal' },
};

/** The icon colors for the phone's current mode. Use this when a tint is a background. */
export function useHues(): Record<Hue, { color: string; tint: string }> {
  const isDark = useDark();
  if (!isDark) return HUES;
  const out = {} as Record<Hue, { color: string; tint: string }>;
  for (const k of Object.keys(HUES) as Hue[]) out[k] = DARK_HUES[HUES[k].tint] ?? HUES[k];
  return out;
}
