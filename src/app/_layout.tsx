import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '../lib/LibraryContext';
import { useTheme } from '../lib/theme';

export default function RootLayout() {
  const t = useTheme();
  return (
    <LibraryProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.accent,
          headerTitleStyle: { color: t.text, fontWeight: '700' },
          headerShadowVisible: false,
          // Just a clean back arrow, no "Back"/screen-name label next to it.
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: t.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="sources" options={{ title: 'Where this comes from' }} />
        <Stack.Screen name="topic/[id]" options={{ title: '' }} />
        <Stack.Screen name="item/[id]" options={{ title: '' }} />
        <Stack.Screen name="help/[id]" options={{ title: '' }} />
      </Stack>
    </LibraryProvider>
  );
}
