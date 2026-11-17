import { useColorScheme } from 'react-native';

// Calm and warm, like a friend who has your back. Cream paper, deep green,
// a little sunshine. Nothing alarming: red is saved for real problems.
const light = {
  bg: '#FBF7EF', // warm cream
  card: '#FFFFFF',
  soft: '#EAF3EC', // pale sage, for gentle highlights
  text: '#17352C', // deep green-black
  muted: '#5F7269',
  border: '#E6E0D2',
  accent: '#1F5C4A', // deep green: buttons and links
  accentText: '#FFFFFF',
  header: '#1F5C4A', // the green band at the top of home
  dangerTint: '#FBE9E4', // soft red behind "needs more than home care"
  sun: '#F6B93B', // highlights
  coral: '#F08A6B',
  good: '#1F7A55',
  warn: '#A8690A',
  bad: '#B4412F',
};

const dark: typeof light = {
  bg: '#12241E', // deep forest, not black
  card: '#1B3129',
  soft: '#223B32',
  text: '#F4EFE3',
  muted: '#A9BBB1',
  border: '#2B4439',
  accent: '#8FD3B3',
  accentText: '#10221C',
  header: '#1B3F33',
  dangerTint: '#3A2622',
  sun: '#F6B93B',
  coral: '#F4A088',
  good: '#8FD3B3',
  warn: '#F3C567',
  bad: '#F2A08F',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

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
