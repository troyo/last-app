import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Bullets, Card, IconName, IconTile, Steps, Text, TitleBar } from '../../components/ui';
import { findHazard } from '../../lib/hazards';
import { HUES, useTheme } from '../../lib/theme';

const PARTS = [
  { key: 'before', label: 'Get ready', head: 'Do these on a calm day' },
  { key: 'during', label: 'It’s happening', head: 'Do this now' },
  { key: 'after', label: 'Afterwards', head: 'The hours and days after' },
] as const;

// One "what can happen here" guide, in three parts you flip between.
export default function HazardScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [part, setPart] = useState<(typeof PARTS)[number]['key']>('before');
  const h = findHazard(id);
  if (!h) return null;
  const now = PARTS.find((p) => p.key === part)!;
  const lines = h[part];

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TitleBar
              title={h.title}
              icon={<IconTile name={h.icon as IconName} {...HUES[h.hue]} size={44} />}
            />
          ),
        }}
      />
      <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
        <Text style={{ color: t.muted, fontSize: 16, lineHeight: 23 }}>{h.blurb}</Text>

        <View style={[s.tabs, { backgroundColor: t.soft }]}>
          {PARTS.map((p) => {
            const on = p.key === part;
            return (
              <Pressable
                key={p.key}
                onPress={() => setPart(p.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[s.tab, on && { backgroundColor: t.accent }]}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: on ? t.accentText : t.text,
                    fontSize: 15,
                    fontWeight: on ? '800' : '600',
                  }}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[s.label, { color: t.accent, marginTop: 4 }]}>{now.head}</Text>
        <Steps steps={lines} />

        <Card style={{ paddingBottom: 6 }}>
          <Text style={[s.label, { color: t.bad }]}>Don’t</Text>
          <Bullets items={h.dont} kind="dont" />
        </Card>

        <Card
          onPress={() => router.push({ pathname: '/search', params: { q: h.search } })}
          style={[s.more, { backgroundColor: t.soft }]}
        >
          <Ionicons name="search" size={20} color={t.accent} />
          <Text style={{ color: t.text, fontSize: 15, fontWeight: '700', flex: 1 }}>
            Find more guides about this
          </Text>
          <Ionicons name="chevron-forward" size={18} color={t.muted} />
        </Card>

        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>
          Steps for when you’re on your own. If officials tell you to leave, leave. General
          information, not professional advice.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 4, gap: 10, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 31, flex: 1 },
  tabs: { flexDirection: 'row', borderRadius: 999, padding: 4, marginTop: 4 },
  tab: { flex: 1, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  num: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1, fontSize: 16, lineHeight: 24, paddingTop: 3 },
  label: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  more: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
