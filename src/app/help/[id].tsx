import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { minutesIn, StepTimer } from '../../components/StepTimer';
import { Bullets, Card, Go, IconName, IconTile, Steps, Text, TitleBar } from '../../components/ui';
import { DiagramId, DIAGRAMS } from '../../lib/diagrams';
import { findQuickHelp } from '../../lib/quick-help';
import { readNext } from '../../lib/read-next';
import { stepPicture } from '../../lib/step-pictures';
import { useLibrary } from '../../lib/LibraryContext';
import { noteOpened } from '../../lib/recent';
import { hasShowMe, SHOW_ME } from '../../lib/show-me';
import { HUES, useDark, useHues, useTheme } from '../../lib/theme';

function Diagram({ id, source }: { id?: DiagramId; source?: number }) {
  // The drawings are on a light panel. In dark mode they are dimmed a little so they don't glare.
  const dim = useDark() ? 0.86 : 1;
  return (
    <View style={s.diagram}>
      <Image
        source={id ? DIAGRAMS[id].image : source}
        accessibilityLabel={id ? DIAGRAMS[id].alt : undefined}
        accessibilityIgnoresInvertColors
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
  const hues = useHues();
  // So this card is one tap away from Home next time.
  useEffect(() => {
    if (id && findQuickHelp(id)) noteOpened(id);
  }, [id]);
  const dark = useDark();
  const { version } = useLibrary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const after = useMemo(() => readNext(id ?? ''), [id, version]);
  if (!h) return null;
  const hue = hues[h.hue];
  const show = hasShowMe(h.id) ? SHOW_ME[h.id] : null;
  const facts = (h.know ?? '').split(/(?<=[.?!])\s+/).filter(Boolean);

  const NEXT = h.next ? (
    <Card style={{ paddingBottom: 6 }}>
      <Text style={[s.label, { color: t.accent }]}>
        {h.group === 'rebuild' ? 'After that' : 'Over the next hours and days'}
      </Text>
      {h.nextPicture && (
        <View style={{ marginTop: 8 }}>
          <Diagram id={h.nextPicture} />
        </View>
      )}
      <Bullets items={h.next} kind={h.group === 'rebuild' ? 'tip' : 'do'} />
    </Card>
  ) : null;

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
        {/* The top of the card: how to know it's the right one, and the picture walk-through. */}
        {show ? (
          <Pressable
            onPress={() => router.push(`/show/${h.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Show me how, in ${show.length} pictures, read aloud`}
            style={({ pressed }) => [
              s.hero,
              { backgroundColor: hue.tint },
              pressed && { opacity: 0.88 },
            ]}
          >
            <Text style={[s.when, { color: t.text }]}>{h.when}</Text>
            <View style={[s.heroRow, { backgroundColor: t.card }]}>
              <View style={s.thumb}>
                <Image source={show[0].pics[0]} style={s.thumbPic} resizeMode="cover" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 18, fontWeight: '700' }}>Show me how</Text>
                <Text style={{ color: t.text, fontSize: 15, lineHeight: 20 }}>
                  {show.length} pictures, read aloud
                </Text>
              </View>
              <View style={[s.play, { backgroundColor: hue.color }]}>
                <Ionicons
                  name="play"
                  size={20}
                  color={dark ? '#0B1210' : '#FFFFFF'}
                  style={{ marginLeft: 2 }}
                />
              </View>
            </View>
          </Pressable>
        ) : h.group === 'rebuild' ? (
          <View style={[s.hero, { backgroundColor: hue.tint }]}>
            <Text style={[s.when, { color: t.text }]}>{h.when}</Text>
          </View>
        ) : (
          <Text style={[s.when, { color: t.text }]}>{h.when}</Text>
        )}

        {h.level && (
          <View style={s.levelRow}>
            <View style={[s.levelPill, { borderColor: t.border, backgroundColor: t.card }]}>
              <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>
                {h.level === 'basic' ? 'Basic' : 'Advanced'}
              </Text>
            </View>
            <Text style={{ color: t.muted, fontSize: 15, lineHeight: 20, flex: 1 }}>
              {h.level === 'basic'
                ? 'Anyone can start today.'
                : 'Takes practice, tools or a helper.'}
            </Text>
          </View>
        )}
        {h.risky && (
          <Card
            style={{ backgroundColor: t.dangerTint, flexDirection: 'row', gap: 10, marginTop: 6 }}
          >
            <Ionicons name="warning" size={22} color={t.bad} />
            <Text style={{ color: t.text, fontSize: 16, lineHeight: 23, flex: 1 }}>{h.risky}</Text>
          </Card>
        )}

        <Text style={[s.label, { color: t.accent, marginTop: h.group === 'rebuild' ? 12 : 4 }]}>
          {h.group === 'rebuild' ? 'How to do it' : 'Do this now'}
        </Text>
        <Steps
          steps={h.steps}
          extra={(i) => (
            <>
              {minutesIn(h.steps[i]) !== null && <StepTimer minutes={minutesIn(h.steps[i])!} />}
              {h.pictures?.[i] ? (
                <Diagram id={h.pictures[i]} />
              ) : stepPicture(h.id, i) ? (
                <Diagram source={stepPicture(h.id, i)} />
              ) : null}
            </>
          )}
        />

        {h.group === 'rebuild' && NEXT}
        {h.dont && (
          <Card style={{ paddingBottom: 6 }}>
            <Text style={[s.label, { color: t.bad }]}>Don’t</Text>
            <Bullets items={h.dont} kind="dont" />
          </Card>
        )}

        {h.group !== 'rebuild' && NEXT}
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
            {/* Several facts read better as a list than as one block. */}
            {facts.length > 2 ? (
              <Bullets items={facts} kind="note" />
            ) : (
              <Text style={[s.body, { color: t.text }]}>{h.know}</Text>
            )}
          </Card>
        )}

        {after.cards.length + after.guides.length > 0 && (
          <Card style={{ paddingBottom: 4 }}>
            <Text style={[s.label, { color: t.accent }]}>Read next</Text>
            {after.cards.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/help/${c.id}`)}
                accessibilityRole="button"
                style={({ pressed }) => [s.nextRow, pressed && { opacity: 0.7 }]}
              >
                <IconTile name={c.icon as IconName} {...HUES[c.hue]} size={40} />
                <Text style={[s.nextTitle, { color: t.text }]}>{c.title}</Text>
                <Go />
              </Pressable>
            ))}
            {after.guides.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => router.push(`/item/${g.id}`)}
                accessibilityRole="button"
                style={({ pressed }) => [s.nextRow, pressed && { opacity: 0.7 }]}
              >
                <IconTile name="book-open-variant" {...HUES.teal} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.nextTitle, { color: t.text, flex: 0 }]} numberOfLines={2}>
                    {g.title}
                  </Text>
                  <Text style={{ color: t.text, fontSize: 15 }}>Full guide</Text>
                </View>
                <Go />
              </Pressable>
            ))}
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
          {h.group === 'rebuild'
            ? 'General information, not expert training. Start small, and practice before you depend on it.'
            : 'Steps for when you’re on your own. If phones work or help is nearby, get help first. General information, not medical advice.'}
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 4, gap: 10, paddingBottom: 40 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 31, flex: 1 },
  when: { fontSize: 17, lineHeight: 24 },
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
    aspectRatio: 720 / 520,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hero: { borderRadius: 24, padding: 14, gap: 12 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    paddingRight: 12,
    borderRadius: 18,
  },
  thumb: {
    width: 84,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E9EFEC',
  },
  thumbPic: { width: '100%', height: '100%' },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
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
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  levelPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  nextTitle: { flex: 1, fontSize: 17, fontWeight: '700', lineHeight: 22 },
  bullet: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 9 },
});
