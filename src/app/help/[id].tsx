import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { minutesIn, StepTimer } from '../../components/StepTimer';
import { Bullets, Card, IconName, IconTile, Steps, Text, TitleBar } from '../../components/ui';
import { DiagramId, DIAGRAMS } from '../../lib/diagrams';
import { findQuickHelp } from '../../lib/quick-help';
import { hasShowMe } from '../../lib/show-me';
import { HUES, useDark, useTheme } from '../../lib/theme';

function Diagram({ id }: { id: DiagramId }) {
  // The drawings are on a light panel. In dark mode they are dimmed a little so they don't glare.
  const dim = useDark() ? 0.86 : 1;
  return (
    <View style={s.diagram}>
      <Image
        source={DIAGRAMS[id].image}
        accessibilityLabel={DIAGRAMS[id].alt}
        style={{ width: '100%', height: '100%', opacity: dim }}
        resizeMode="contain"
      />
    </View>
  );
}

// One "what do I do right now" card: big type, numbered steps, nothing else.
export default function QuickHelpScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const h = findQuickHelp(id);
  if (!h) return null;

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
        <Text style={[s.when, { color: t.muted }]}>{h.when}</Text>

        {hasShowMe(h.id) && (
          <Pressable
            onPress={() => router.push(`/show/${h.id}`)}
            accessibilityRole="button"
            style={({ pressed }) => [
              s.show,
              { backgroundColor: t.accent },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="play-circle" size={34} color={t.accentText} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.accentText, fontSize: 20, fontWeight: '800' }}>Show me</Text>
              <Text style={{ color: t.accentText, fontSize: 15 }}>
                Pictures, step by step, read aloud
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={t.accentText} />
          </Pressable>
        )}

        <Text style={[s.label, { color: t.accent, marginTop: 4 }]}>Do this now</Text>
        <Steps
          steps={h.steps}
          extra={(i) => (
            <>
              {minutesIn(h.steps[i]) !== null && <StepTimer minutes={minutesIn(h.steps[i])!} />}
              {h.pictures?.[i] && <Diagram id={h.pictures[i]} />}
            </>
          )}
        />

        {h.dont && (
          <Card style={{ paddingBottom: 6 }}>
            <Text style={[s.label, { color: t.bad }]}>Don’t</Text>
            <Bullets items={h.dont} kind="dont" />
          </Card>
        )}

        {h.next && (
          <Card style={{ paddingBottom: 6 }}>
            <Text style={[s.label, { color: t.accent }]}>Over the next hours and days</Text>
            {h.nextPicture && (
              <View style={{ marginTop: 8 }}>
                <Diagram id={h.nextPicture} />
              </View>
            )}
            <Bullets items={h.next} />
          </Card>
        )}

        {h.danger && (
          <Card style={{ backgroundColor: t.dangerTint, paddingBottom: 6 }}>
            <Text style={[s.label, { color: t.bad }]}>This needs more than home care</Text>
            <Text style={{ color: t.text, fontSize: 16, lineHeight: 23, marginTop: 6 }}>
              Do everything you can to reach trained help (a neighbor with medical training, a
              clinic, a radio, or travel to find signal) if you see:
            </Text>
            <Bullets items={h.danger} kind="warn" />
          </Card>
        )}

        {h.know && (
          <Card style={{ gap: 6, backgroundColor: t.soft }}>
            <Text style={[s.label, { color: t.accent }]}>Good to know</Text>
            <Text style={[s.body, { color: t.text }]}>{h.know}</Text>
          </Card>
        )}

        <Text
          style={{
            color: t.muted,
            fontSize: 15,
            lineHeight: 21,
            textAlign: 'center',
          }}
        >
          Steps for when you’re on your own. If phones work or help is nearby, get help first.
          General information, not medical advice.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 4, gap: 10, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 31, flex: 1 },
  when: { fontSize: 16, lineHeight: 23, marginBottom: 2 },
  call: { borderRadius: 20, padding: 18 },
  callText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
  },
  diagram: {
    marginTop: 10,
    width: '100%',
    aspectRatio: 720 / 420,
    borderRadius: 16,
    overflow: 'hidden',
  },
  show: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 22,
  },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  num: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 17, lineHeight: 25, paddingTop: 3 },
  label: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: { fontSize: 16, lineHeight: 24 },
  bullet: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9 },
});
