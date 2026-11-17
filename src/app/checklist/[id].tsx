import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from '../../components/ui';
import { findChecklist, isDone, itemKey, progressOf, toggle } from '../../lib/checklists';
import { getProfile } from '../../lib/place';
import { useTheme } from '../../lib/theme';

// One checklist. Tap a line to tick it; it's remembered on this phone.
// "Why?" under a line opens a short, plain explanation.
export default function ChecklistScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [, refresh] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const list = findChecklist(id);
  if (!list) return null;
  const p = progressOf(list);
  const profile = getProfile();

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

        {/* Says who the list was written for, or offers to tailor it. */}
        <Pressable
          onPress={() => router.push('/place')}
          style={[s.fit, { backgroundColor: t.soft }]}
        >
          <Ionicons name="location" size={18} color={t.accent} />
          <Text style={{ color: t.text, fontSize: 14, lineHeight: 19, flex: 1 }}>
            {profile
              ? `Written for ${profile.people} ${profile.people === 1 ? 'person' : 'people'} in ${profile.place}.`
              : 'Tell us where you live and this list will fit your home.'}
          </Text>
          <Text style={{ color: t.accent, fontSize: 14, fontWeight: '800' }}>
            {profile ? 'Change' : 'Set up'}
          </Text>
        </Pressable>

        {list.groups.map((g) => (
          <View key={g.title} style={{ gap: 8 }}>
            <View style={s.groupHead}>
              <Text style={[s.group, { color: t.text }]}>{g.title}</Text>
              {g.forYou && (
                <View style={[s.badge, { backgroundColor: t.sun }]}>
                  <Text style={s.badgeText}>For your area</Text>
                </View>
              )}
            </View>
            {g.note && (
              <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20 }}>{g.note}</Text>
            )}
            <Card style={{ paddingVertical: 4 }}>
              {g.items.map((item, i) => {
                const key = itemKey(list.id, item.id);
                const on = isDone(key);
                const showWhy = open === key;
                return (
                  <View
                    key={item.id}
                    style={[
                      i > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: t.border,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        toggle(key);
                        refresh((n) => n + 1);
                      }}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}
                      style={s.item}
                    >
                      <View
                        style={[
                          s.box,
                          { borderColor: on ? t.accent : t.muted },
                          on && { backgroundColor: t.accent },
                        ]}
                      >
                        {on && <Ionicons name="checkmark" size={18} color={t.accentText} />}
                      </View>
                      <Text
                        style={[
                          s.itemText,
                          { color: on ? t.muted : t.text },
                          on && { textDecorationLine: 'line-through' },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </Pressable>
                    {item.why && (
                      <Pressable
                        onPress={() => setOpen(showWhy ? null : key)}
                        hitSlop={6}
                        accessibilityRole="button"
                        accessibilityLabel={`Why: ${item.text}`}
                        style={s.whyRow}
                      >
                        <Text style={{ color: t.accent, fontSize: 14, fontWeight: '700' }}>
                          {showWhy ? 'Hide' : 'Why?'}
                        </Text>
                        <Ionicons
                          name={showWhy ? 'chevron-up' : 'chevron-down'}
                          size={14}
                          color={t.accent}
                        />
                      </Pressable>
                    )}
                    {showWhy && (
                      <View style={[s.why, { backgroundColor: t.soft }]}>
                        <Text style={{ color: t.text, fontSize: 15, lineHeight: 22 }}>
                          {item.why}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          </View>
        ))}
        <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
          General guidelines. Adjust for children, health needs and what you already have.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 6, gap: 12, paddingBottom: 40 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10, borderRadius: 5 },
  fit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  group: { fontSize: 18, fontWeight: '800' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#3D2A00' },
  item: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingTop: 12, paddingBottom: 10 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1, fontSize: 16, lineHeight: 22 },
  whyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 38,
    marginTop: -4,
    paddingBottom: 10,
    alignSelf: 'flex-start',
  },
  why: { marginLeft: 38, marginBottom: 12, padding: 12, borderRadius: 14 },
});
