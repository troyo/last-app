import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LaunchAnimation } from '../components/LaunchAnimation';
import { LibraryProvider } from '../lib/LibraryContext';
import { TitleBar } from '../components/ui';
import { useTheme } from '../lib/theme';
import { hasSeenWelcome } from '../lib/welcome';

// Hold the splash screen until the first screen is ready to draw.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  // On the very first launch the welcome film is the opening; two in a row is too much.
  const [opening, setOpening] = useState(hasSeenWelcome);
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <LibraryProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          // One header everywhere: back arrow and title on the same line, in the app's own type.
          header: ({ options }) => (
            <TitleBar
              title={typeof options.title === 'string' ? options.title : ''}
              icon={options.headerRight?.({ canGoBack: true })}
            />
          ),
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="agree" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="ask" options={{ title: 'Ask anything' }} />
        <Stack.Screen name="place" options={{ headerShown: false }} />
        <Stack.Screen name="first-pack" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="hazard/[id]" options={{ title: '' }} />
        <Stack.Screen name="prep" options={{ title: 'Get ready' }} />
        <Stack.Screen name="plan" options={{ title: 'Your one-year plan' }} />
        <Stack.Screen name="group" options={{ title: 'Your group' }} />
        <Stack.Screen name="packs" options={{ title: 'My packs' }} />
        <Stack.Screen name="about" options={{ title: 'How Last App works' }} />
        <Stack.Screen name="legal" options={{ title: 'Safety and terms' }} />
        <Stack.Screen name="sources" options={{ title: 'Where the guides come from' }} />
        <Stack.Screen name="topic/[id]" options={{ title: '' }} />
        <Stack.Screen name="item/[id]" options={{ title: '' }} />
        <Stack.Screen name="checklist/[id]" options={{ title: '' }} />
        <Stack.Screen name="help/[id]" options={{ title: '' }} />
        <Stack.Screen name="situation/[id]" options={{ title: '' }} />
        <Stack.Screen name="show/[id]" options={{ headerShown: false }} />
      </Stack>
      {opening && <LaunchAnimation onDone={() => setOpening(false)} />}
    </LibraryProvider>
  );
}
