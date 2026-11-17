import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { HAZARDS } from '../../lib/hazards';
import { getProfile } from '../../lib/place';
import { QUICK_HELP } from '../../lib/quick-help';
import { HUES, useTheme } from '../../lib/theme';

// Every "what do I do right now" card in one calm list. Built into the app,
// so it works with no download, no power and no signal.
export default function Emergency() {
  const t = useTheme();
  // Your place may have changed while this tab was out of view.
  const [, refresh] = useState(0);
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));
  // Disasters likely where you live come first; the rest are still one tap away.
  const mine = getProfile()?.hazards ?? [];
  const hazards = [...HAZARDS].sort(
    (a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)),
  );
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={[s.h1, { color: t.text }]}>Emergency</Text>
        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, marginBottom: 4 }}>
          What to do yourself, step by step, when help can’t come.
        </Text>
        {QUICK_HELP.map((h) => (
          <Card key={h.id} onPress={() => router.push(`/help/${h.id}`)} style={s.row}>
            <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>{h.title}</Text>
              <Text style={{ color: t.muted, fontSize: 14, lineHeight: 19 }} numberOfLines={2}>
                {h.when}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Card>
        ))}

        <Text style={[s.h2, { color: t.text }]}>Disasters</Text>
        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, marginBottom: 4 }}>
          What to do before, during and after.
        </Text>
        {hazards.map((h) => (
          <Card key={h.id} onPress={() => router.push(`/hazard/${h.id}`)} style={s.row}>
            <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={46} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>{h.title}</Text>
              <Text style={{ color: t.muted, fontSize: 14, lineHeight: 19 }} numberOfLines={2}>
                {h.blurb}
              </Text>
            </View>
            {mine.includes(h.id) && (
              <View style={[s.badge, { backgroundColor: t.sun }]}>
                <Text style={s.badgeText}>Your area</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 10, paddingBottom: 32 },
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 22, fontWeight: '800', marginTop: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#3D2A00' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
