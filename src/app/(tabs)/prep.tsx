import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { CHECKLISTS, progressOf } from '../../lib/checklists';
import { HUES, useTheme } from '../../lib/theme';

// "Get ready": three checklists that build on each other. Progress is saved.
export default function Prep() {
  const t = useTheme();
  const [, refresh] = useState(0);
  // Re-count the ticks every time this tab comes back into view.
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={[s.h1, { color: t.text }]}>Get ready</Text>
        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, marginBottom: 4 }}>
          How long could your home run with no power, taps or shops? Tick things off as you get
          them.
        </Text>
        {CHECKLISTS.map((list) => {
          const p = progressOf(list);
          const pct = Math.round((p.done / p.total) * 100);
          return (
            <Card
              key={list.id}
              onPress={() => router.push(`/checklist/${list.id}`)}
              style={{ gap: 12 }}>
              <View style={s.row}>
                <IconTile name={list.icon as IconName} {...HUES[list.hue]} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontSize: 19, fontWeight: '800' }}>
                    Ready for {list.title}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 14, lineHeight: 19 }}>{list.blurb}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.muted} />
              </View>
              <View style={[s.barBg, { backgroundColor: t.soft }]}>
                <View style={[s.bar, { width: `${pct}%`, backgroundColor: t.accent }]} />
              </View>
              <Text style={{ color: t.muted, fontSize: 13, fontWeight: '700' }}>
                {p.done === p.total ? 'All done. Nice work.' : `${p.done} of ${p.total} done`}
              </Text>
            </Card>
          );
        })}
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
          Amounts are per person and are general guidelines. Adjust for children, health needs, pets
          and your climate.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 12, paddingBottom: 32 },
  h1: { fontSize: 28, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
});
