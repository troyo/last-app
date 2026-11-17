import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { formatBytes, packBytes } from '../../lib/catalog';
import { getProfile } from '../../lib/place';
import { useLibrary } from '../../lib/LibraryContext';
import { HUES, Hue, useTheme } from '../../lib/theme';

// Everything you set up once and rarely touch: your packs, and the fine print.
export default function More() {
  const t = useTheme();
  // Your place may have changed while this tab was out of view.
  const [, refresh] = useState(0);
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));
  const { state, downloading } = useLibrary();
  const profile = getProfile();
  const packName = state.pack ? state.pack[0].toUpperCase() + state.pack.slice(1) : '';

  const rows: { icon: IconName; hue: Hue; title: string; sub: string; to: string }[] = [
    {
      icon: 'bag-personal',
      hue: 'brown',
      title: 'My packs',
      sub: downloading
        ? 'Saving your guides…'
        : state.pack
          ? `${packName} pack · ${formatBytes(packBytes(state.pack))} on this phone`
          : 'Get the free guides',
      to: '/packs',
    },
    {
      icon: 'map-marker-radius',
      hue: 'green',
      title: 'My place and household',
      sub: profile
        ? `${profile.place[0].toUpperCase()}${profile.place.slice(1)} · ${profile.people} ${profile.people === 1 ? 'person' : 'people'}`
        : 'Fit the guides to your area',
      to: '/place',
    },
    {
      icon: 'clipboard-check',
      hue: 'coral',
      title: 'Get ready checklists',
      sub: '3 days, 2 weeks and 1 year',
      to: '/prep',
    },
    {
      icon: 'information',
      hue: 'blue',
      title: 'How Last App works',
      sub: 'And why you can trust it',
      to: '/about',
    },
    {
      icon: 'shield-check',
      hue: 'sun',
      title: 'Safety and terms',
      sub: 'The agreement you accepted',
      to: '/legal',
    },
    {
      icon: 'bookshelf',
      hue: 'teal',
      title: 'Where the guides come from',
      sub: 'Every source and its license',
      to: '/sources',
    },
    {
      icon: 'hand-wave',
      hue: 'violet',
      title: 'Show the welcome tour',
      sub: 'A 30-second refresher',
      to: '/welcome',
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={[s.h1, { color: t.text }]}>More</Text>
        {rows.map((r) => (
          <Card key={r.to} onPress={() => router.push(r.to as never)} style={s.row}>
            <IconTile name={r.icon} {...HUES[r.hue]} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>{r.title}</Text>
              <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }} numberOfLines={1}>
                {r.sub}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 10, paddingBottom: 32 },
  h1: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
