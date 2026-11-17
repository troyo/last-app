import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from '../../components/ui';
import { findChecklist, isDone, itemKey, progressOf, toggle } from '../../lib/checklists';
import { useTheme } from '../../lib/theme';

// One checklist. Tap a line to tick it; it's remembered on this phone.
export default function ChecklistScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, refresh] = useState(0);
  const list = findChecklist(id);
  if (!list) return null;
  const p = progressOf(list);

  return (
    <>
      <Stack.Screen options={{ title: `Ready for ${list.title}` }} />
      <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>{list.blurb}</Text>
        <View style={[s.barBg, { backgroundColor: t.soft }]}>
          <View
            style={[s.bar, { width: `${(p.done / p.total) * 100}%`, backgroundColor: t.accent }]}
          />
        </View>
        <Text style={{ color: t.muted, fontSize: 13, fontWeight: '700' }}>
          {p.done} of {p.total} done
        </Text>

        {list.groups.map((g) => (
          <View key={g.title} style={{ gap: 8 }}>
            <Text style={[s.group, { color: t.text }]}>{g.title}</Text>
            <Card style={{ paddingVertical: 4 }}>
              {g.items.map((item, i) => {
                const key = itemKey(list.id, item);
                const on = isDone(key);
                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      toggle(key);
                      refresh((n) => n + 1);
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    style={[
                      s.item,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                    ]}>
                    <View
                      style={[
                        s.box,
                        { borderColor: on ? t.accent : t.muted },
                        on && { backgroundColor: t.accent },
                      ]}>
                      {on && <Ionicons name="checkmark" size={18} color={t.accentText} />}
                    </View>
                    <Text
                      style={[
                        s.itemText,
                        { color: on ? t.muted : t.text },
                        on && { textDecorationLine: 'line-through' },
                      ]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </Card>
          </View>
        ))}
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
          General guidelines, per person unless it says otherwise. Adjust for your household.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 6, gap: 12, paddingBottom: 40 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
  group: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  item: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1, fontSize: 16, lineHeight: 22 },
});
