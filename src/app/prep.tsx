import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, IconName, IconTile, Text } from '../components/ui';
import { getChecklists, progressOf } from '../lib/checklists';
import { getProfile } from '../lib/place';
import { HUES, useTheme } from '../lib/theme';

// "Get ready": three checklists that build on each other. Progress is saved.
export default function Prep() {
  const t = useTheme();
  const [, refresh] = useState(0);
  // Re-count the ticks every time this tab comes back into view.
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
      <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, marginBottom: 4 }}>
        How long could your home run with no power, taps or shops? Tick things off as you get them.
      </Text>
      {getChecklists().map((list) => {
        const p = progressOf(list);
        const pct = Math.round((p.done / p.total) * 100);
        return (
          <Card
            key={list.id}
            onPress={() => router.push(`/checklist/${list.id}`)}
            style={{ gap: 12 }}
          >
            <View style={s.row}>
              <IconTile name={list.icon as IconName} {...HUES[list.hue]} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 19, fontWeight: '800' }}>
                  Ready for {list.title}
                </Text>
                <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>{list.blurb}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.muted} />
            </View>
            <View style={[s.barBg, { backgroundColor: t.soft }]}>
              <View style={[s.bar, { width: `${pct}%`, backgroundColor: t.accent }]} />
            </View>
            <Text style={{ color: t.muted, fontSize: 15, fontWeight: '700' }}>
              {p.done === p.total ? 'All done. Nice work.' : `${p.done} of ${p.total} done`}
            </Text>
          </Card>
        );
      })}
      <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
        General guidelines. Tap the ⓘ on any line for a plain explanation.
        {getProfile()
          ? ''
          : ' Set your place and household under More to get amounts that fit your home.'}
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 12, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
});
