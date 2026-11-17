import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { findQuickHelp } from '../../lib/quick-help';
import { HUES, useTheme } from '../../lib/theme';

// One "what do I do right now" card: big type, numbered steps, nothing else.
export default function QuickHelpScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const h = findQuickHelp(id);
  if (!h) return null;

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
        <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={64} />
        <Text style={[s.title, { color: t.text }]}>{h.title}</Text>
        <Text style={[s.when, { color: t.muted }]}>{h.when}</Text>

        {h.call && (
          <View style={[s.call, { backgroundColor: t.bad }]}>
            <Text style={s.callText}>{h.call}</Text>
          </View>
        )}

        {h.steps.map((step, i) => (
          <Card key={i} style={s.step}>
            <View style={[s.num, { backgroundColor: t.accent }]}>
              <Text style={{ color: t.accentText, fontSize: 18, fontWeight: '800' }}>{i + 1}</Text>
            </View>
            <Text style={[s.stepText, { color: t.text }]}>{step}</Text>
          </Card>
        ))}

        {h.dont && (
          <Card style={{ gap: 6 }}>
            <Text style={[s.label, { color: t.bad }]}>Don’t</Text>
            {h.dont.map((d) => (
              <Text key={d} style={[s.body, { color: t.text }]}>
                ✕ {d}
              </Text>
            ))}
          </Card>
        )}

        {h.getHelp && (
          <Card style={{ gap: 6, backgroundColor: t.soft, borderColor: t.soft }}>
            <Text style={[s.label, { color: t.accent }]}>Good to know</Text>
            <Text style={[s.body, { color: t.text }]}>{h.getHelp}</Text>
          </Card>
        )}

        <Text
          style={{
            color: t.muted,
            fontSize: 13,
            lineHeight: 19,
            textAlign: 'center',
          }}
        >
          Quick steps for when help is far away. They don’t replace a doctor or emergency services.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: '800' },
  when: { fontSize: 17, lineHeight: 24, marginBottom: 4 },
  call: { borderRadius: 20, padding: 18 },
  callText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
  },
  step: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  num: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, fontSize: 19, lineHeight: 27 },
  label: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: { fontSize: 17, lineHeight: 25 },
});
