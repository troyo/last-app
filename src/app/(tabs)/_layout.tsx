import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';

// The three tabs at the bottom. You can always get home from anywhere.
export default function TabsLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        // Enough room for icon + label on every phone, plus the home-bar area.
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopColor: t.border,
          height: 60 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontFamily: 'Nunito_700Bold' },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Guides',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              color={color as string}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="packs"
        options={{
          title: 'My packs',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'briefcase' : 'briefcase-outline'}
              color={color as string}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              color={color as string}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
