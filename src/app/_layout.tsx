import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '../lib/LibraryContext';
import { useTheme } from '../lib/theme';

// Hold the splash screen until the typeface is ready, so text never flickers.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const ready = loaded || !!error; // if the font can't load, carry on with the system one
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  if (!ready) return null;

  return (
    <LibraryProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.accent,
          headerTitleStyle: { color: t.text, fontFamily: 'Nunito_700Bold' },
          headerShadowVisible: false,
          // Just a clean back arrow, no "Back"/screen-name label next to it.
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: t.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="agree" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="legal" options={{ title: 'Safety and terms' }} />
        <Stack.Screen name="sources" options={{ title: 'Where this comes from' }} />
        <Stack.Screen name="topic/[id]" options={{ title: '' }} />
        <Stack.Screen name="item/[id]" options={{ title: '' }} />
        <Stack.Screen name="help/[id]" options={{ title: '' }} />
      </Stack>
    </LibraryProvider>
  );
}
