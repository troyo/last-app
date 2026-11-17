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

// Soft tint behind each topic's icon.
export const TOPIC_TINTS = [
  '#FDE7E0',
  '#DDEFF7',
  '#FCEFC9',
  '#FFE3CC',
  '#E2F1E3',
  '#E8E4F6',
  '#DDEBF0',
  '#F9DFE5',
  '#E6F0D8',
  '#F3E6D6',
];
