import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Go, IconName, IconTile, Steps, Text, TitleBar } from '../../components/ui';
import { findChecklist } from '../../lib/checklists';
import { DIAGRAMS } from '../../lib/diagrams';
import { HAZARDS } from '../../lib/hazards';
import { findQuickHelp } from '../../lib/quick-help';
import { findSituation, Link } from '../../lib/situations';
import { HUES, Hue, useDark, useTheme } from '../../lib/theme';

type Row = { key: string; icon: string; hue: Hue; title: string; sub: string; href: string };

function rowFor(link: Link): Row | null {
  if (link.kind === 'help') {
    const h = findQuickHelp(link.id);
    return (
      (h && {
        key: `help-${h.id}`,
        icon: h.icon,
        hue: h.hue,
        title: h.title,
        sub: h.when,
        href: `/help/${h.id}`,
      }) ||
      null
    );
  }
  if (link.kind === 'hazard') {
    const h = HAZARDS.find((x) => x.id === link.id);
    return (
      (h && {
        key: `hazard-${h.id}`,
        icon: h.icon,
        hue: h.hue,
        title: h.title,
        sub: 'Before, during and after',
        href: `/hazard/${h.id}`,
      }) ||
      null
    );
  }
  const c = findChecklist(link.id);
  return (
    (c && {
      key: `list-${c.id}`,
      icon: 'checkbox-marked-outline',
      hue: c.hue,
      title: `Checklist: ready for ${c.title}`,
      sub: 'What to have in the house',
      href: `/checklist/${c.id}`,
    }) ||
    null
  );
}

// The three questions for "Someone's hurt". Each "worst" answer jumps straight to its card.
const QUESTIONS = [
  { ask: 'Are they breathing?', bad: 'No', good: 'Yes', go: '/help/cpr', goLabel: 'Start CPR' },
  {
    ask: 'Are they bleeding a lot?',
    bad: 'Yes',
    good: 'No',
    go: '/help/bleeding',
    goLabel: 'Stop the bleeding',
  },
  { ask: 'Are they awake?', bad: 'No', good: 'Yes', go: '', goLabel: '' },
] as const;

// One situation ("Power's out", "Someone's hurt"): what to do first, then the cards to open.
export default function SituationScreen() {
  const t = useTheme();
  const dark = useDark();
  // The urgent answer is filled red. In dark mode that red is light, so its words go dark.
  const onBad = dark ? '#2B0B07' : '#FFFFFF';
  const { id } = useLocalSearchParams<{ id: string }>();
  const sit = findSituation(id);
  // Which question we're on. 3 = all answered fine; 'side' = breathing but not awake.
  const [at, setAt] = useState<number | 'side'>(0);
  if (!sit) return null;

  const rows = sit.links.map(rowFor).filter((r): r is Row => !!r);
  const asking = sit.triage && typeof at === 'number' && at < QUESTIONS.length;
  const q = asking ? QUESTIONS[at as number] : null;

  const answer = (bad: boolean) => {
    if (!q) return;
    if (bad && q.go) router.push(q.go as never);
    else if (bad) setAt('side');
    else setAt((at as number) + 1);
  };

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TitleBar
              title={sit.title}
              icon={<IconTile name={sit.icon as IconName} {...HUES[sit.hue]} size={44} />}
            />
          ),
        }}
      />
      <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
        {!sit.triage && <Text style={[s.blurb, { color: t.text }]}>{sit.blurb}</Text>}

        {q && (
          <Card style={{ gap: 14, paddingVertical: 20 }}>
            <Text style={{ color: t.text, fontSize: 16, fontWeight: '600' }}>
              Question {(at as number) + 1} of {QUESTIONS.length}
            </Text>
            <Text style={[s.ask, { color: t.text }]}>{q.ask}</Text>
            <View style={s.answers}>
              {[q.good, q.bad]
                .sort()
                .reverse()
                .map((label) => {
                  const bad = label === q.bad;
                  return (
                    <Pressable
                      key={label}
                      onPress={() => answer(bad)}
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        s.answer,
                        bad
                          ? { backgroundColor: t.bad, borderColor: t.bad }
                          : { backgroundColor: t.card, borderColor: t.accent },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <Text
                        style={{
                          color: bad ? onBad : t.accent,
                          fontSize: 22,
                          fontWeight: '800',
                        }}
                      >
                        {label}
                      </Text>
                      {bad && !!q.goLabel && (
                        <Text style={{ color: onBad, fontSize: 15, textAlign: 'center' }}>
                          {q.goLabel}
                        </Text>
                      )}
                    </Pressable>
                  );
                })}
            </View>
            {at === 0 && (
              <Pressable onPress={() => router.push('/help/choking')} hitSlop={8}>
                <Text style={{ color: t.accent, fontSize: 16, fontWeight: '700' }}>
                  Choking on something? Open Choking
                </Text>
              </Pressable>
            )}
          </Card>
        )}

        {at === 'side' && (
          <Card style={{ gap: 12 }}>
            <Text style={[s.label, { color: t.accent }]}>Breathing but not awake</Text>
            <Steps
              bare
              steps={[
                'Roll them onto their side. Bend the top knee forward so they can’t roll back.',
                'Tilt the head back a little so the airway stays open.',
                'Keep them warm and stay with them. Check their breathing every minute.',
                'If the breathing stops, roll them onto their back and start CPR.',
              ]}
            />
            <View style={s.diagram}>
              <Image
                source={DIAGRAMS.recovery.image}
                accessibilityLabel={DIAGRAMS.recovery.alt}
                style={{ width: '100%', height: '100%', opacity: dark ? 0.86 : 1 }}
                resizeMode="contain"
              />
            </View>
          </Card>
        )}

        {sit.first && (
          <>
            <Text style={[s.label, { color: t.accent, marginTop: 4 }]}>Do these first</Text>
            <Steps steps={sit.first} />
          </>
        )}

        {(!sit.triage || !asking) && (
          <>
            <Text style={[s.label, { color: t.accent, marginTop: 4 }]}>
              {sit.triage
                ? at === 'side'
                  ? 'Then check for'
                  : 'What’s wrong?'
                : sit.first
                  ? 'Then open'
                  : 'Open what you need'}
            </Text>
            <Card style={{ paddingVertical: 4 }}>
              {(at === 'side' ? [rowFor({ kind: 'help', id: 'cpr' })!, ...rows] : rows).map(
                (r, i) => (
                  <Pressable
                    key={r.key}
                    onPress={() => router.push(r.href as never)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      s.row,
                      i > 0 && {
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderTopColor: t.border,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <IconTile name={r.icon as IconName} {...HUES[r.hue]} size={44} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>
                        {r.title}
                      </Text>
                      <Text
                        style={{ color: t.text, fontSize: 15, lineHeight: 20 }}
                        numberOfLines={3}
                      >
                        {r.sub}
                      </Text>
                    </View>
                    <Go />
                  </Pressable>
                ),
              )}
            </Card>
          </>
        )}

        {sit.triage && at !== 0 && (
          <Pressable onPress={() => setAt(0)} hitSlop={8} style={{ alignSelf: 'center' }}>
            <Text style={{ color: t.accent, fontSize: 16, fontWeight: '700' }}>
              Start the questions again
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 4, gap: 10, paddingBottom: 40 },
  blurb: { fontSize: 17, lineHeight: 24 },
  ask: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  answers: { flexDirection: 'row', gap: 10 },
  answer: {
    flex: 1,
    minHeight: 92,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 2,
  },
  label: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  diagram: { width: '100%', aspectRatio: 720 / 420, borderRadius: 16, overflow: 'hidden' },
});
