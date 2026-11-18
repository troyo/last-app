import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Bullets, Card, IconName, IconTile, Text, TitleBar } from '../components/ui';
import { HUES, useHues, useTheme } from '../lib/theme';
import { currentPhase, doneIn, isDone, PlanJob, toggleDone, YEAR_PLAN } from '../lib/year-plan';

// Splits "Do this. Here is how." into the job and the detail.
const split = (text: string) => {
  const m = text.match(/^(.{8,90}?[.?!])\s+(.+)$/);
  return m ? [m[1], m[2]] : [text, ''];
};

export default function PlanScreen() {
  const t = useTheme();
  const hues = useHues();
  const [phaseId, setPhaseId] = useState(() => currentPhase().id);
  const [, bump] = useState(0);
  const page = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const phase = YEAR_PLAN.find((p) => p.id === phaseId) ?? YEAR_PLAN[0];
  const hue = hues[phase.hue];
  const done = doneIn(phase);

  const tick = (job: PlanJob) => {
    toggleDone(phase.id, job.id);
    Haptics.selectionAsync().catch(() => {});
    bump((n) => n + 1);
  };
  const open = (job: PlanJob) => {
    if (job.open?.href) router.push(job.open.href as never);
    else if (job.open?.search)
      router.push({ pathname: '/search', params: { q: job.open.search } } as never);
  };

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TitleBar
              title="Your one-year plan"
              icon={<IconTile name="map-marker-path" {...HUES.green} size={44} />}
            />
          ),
        }}
      />
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabs}
          >
            {YEAR_PLAN.map((p) => {
              const on = p.id === phase.id;
              const complete = doneIn(p) === p.jobs.length;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setPhaseId(p.id);
                    page.current?.scrollTo({ y: 0, animated: false });
                  }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  style={[
                    s.tab,
                    on
                      ? { backgroundColor: t.accent, borderColor: t.accent }
                      : { backgroundColor: t.card, borderColor: t.border },
                  ]}
                >
                  {complete && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={on ? t.accentText : t.accent}
                    />
                  )}
                  <Text
                    style={{ color: on ? t.accentText : t.text, fontSize: 16, fontWeight: '700' }}
                  >
                    {p.tab}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView ref={page} contentContainerStyle={s.wrap}>
          <View style={[s.hero, { backgroundColor: hue.tint }]}>
            <View style={s.heroTop}>
              <IconTile name={phase.icon as IconName} color={hue.color} tint={t.card} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', lineHeight: 30 }}>
                  {phase.title}
                </Text>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>
                  {done} of {phase.jobs.length} done
                </Text>
              </View>
            </View>
            <View style={[s.track, { backgroundColor: t.card }]}>
              <View
                style={{
                  width: `${(done / phase.jobs.length) * 100}%`,
                  backgroundColor: hue.color,
                  height: '100%',
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ color: t.text, fontSize: 16, lineHeight: 23 }}>
              <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>The goal: </Text>
              {phase.goal}
            </Text>
          </View>

          <Card style={{ paddingVertical: 4 }}>
            {phase.jobs.map((job, i) => {
              const [lead, rest] = split(job.text);
              const ticked = isDone(phase.id, job.id);
              return (
                <View
                  key={job.id}
                  style={[
                    s.job,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                  ]}
                >
                  <Pressable
                    onPress={() => tick(job)}
                    hitSlop={10}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: ticked }}
                    accessibilityLabel={lead}
                    style={[
                      s.box,
                      ticked
                        ? { backgroundColor: t.accent, borderColor: t.accent }
                        : { borderColor: t.text },
                    ]}
                  >
                    {ticked && <Ionicons name="checkmark" size={20} color={t.accentText} />}
                  </Pressable>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Pressable onPress={() => tick(job)}>
                      <Text
                        style={{
                          color: t.text,
                          fontSize: 17,
                          lineHeight: 24,
                          fontWeight: '700',
                          textDecorationLine: ticked ? 'line-through' : 'none',
                        }}
                      >
                        {lead}
                      </Text>
                      {!!rest && (
                        <Text style={{ color: t.text, fontSize: 16, lineHeight: 23 }}>{rest}</Text>
                      )}
                    </Pressable>
                    {job.open && (
                      <Pressable
                        onPress={() => open(job)}
                        accessibilityRole="button"
                        hitSlop={6}
                        style={({ pressed }) => [
                          s.open,
                          { backgroundColor: t.soft },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Ionicons
                          name={job.open.search ? 'search' : 'book'}
                          size={16}
                          color={t.accent}
                        />
                        <Text
                          style={{ color: t.accent, fontSize: 15, fontWeight: '700', flex: 1 }}
                          numberOfLines={1}
                        >
                          {job.open.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={t.accent} />
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </Card>

          {phase.notes && (
            <>
              <Text style={[s.label, { color: t.accent }]}>{phase.notesTitle}</Text>
              <Bullets items={phase.notes} kind="note" />
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  tabs: { paddingHorizontal: 18, paddingVertical: 8, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
  },
  wrap: { paddingHorizontal: 18, paddingTop: 4, gap: 12, paddingBottom: 40 },
  hero: { borderRadius: 24, padding: 16, gap: 12 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  job: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  box: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  open: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginTop: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
