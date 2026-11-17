import { useColorScheme } from 'react-native';

// High-contrast, simple colors. In an emergency people may be reading
// in the dark, with a cracked screen, or stressed. Keep it plain.
const light = {
  bg: '#F7F5F0',
  card: '#FFFFFF',
  text: '#1C1B19',
  muted: '#6B675F',
  border: '#E3DFD6',
  accent: '#C2410C', // signal orange
  accentText: '#FFFFFF',
  good: '#15803D',
  warn: '#B45309',
  bad: '#B91C1C',
};

const dark: typeof light = {
  bg: '#141311',
  card: '#1F1E1B',
  text: '#F3F1EC',
  muted: '#A8A399',
  border: '#33312C',
  accent: '#F97316',
  accentText: '#141311',
  good: '#4ADE80',
  warn: '#FBBF24',
  bad: '#F87171',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
