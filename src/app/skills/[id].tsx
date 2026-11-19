import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Card, IconName, IconTile, Text, TitleBar } from '../../components/ui';
import { cardFor, findSkillPath, isLearned, learnedIn, toggleLearned } from '../../lib/skills';
import { HUES, useHues, useTheme } from '../../lib/theme';

// One skill path: a short list of cards in the order to learn them.
export default function SkillPathScreen() {
  const t = useTheme();
  const hues = useHues();
  const { id } = useLocalSearchParams<{ id: string }>();
  const path = findSkillPath(id ?? '');
  const [, bump] = useState(0);
  useFocusEffect(useCallback(() => bump((n) => n + 1), []));
  if (!path) return null;
  const hue = hues[path.hue];
  const done = learnedIn(path);
  // The first step not ticked yet is the one to do now.
  const nextUp = path.steps.find((s) => !isLearned(path.id, s.card))?.card;

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TitleBar
              title={path.title}
              icon={<IconTile name={path.icon as IconName} {...HUES[path.hue]} size={44} />}
            />
          ),
        }}
      />
      <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
        <View style={[s.hero, { backgroundColor: hue.tint }]}>
          <Text style={{ color: t.text, fontSize: 17, lineHeight: 24 }}>{path.goal}</Text>
          <View style={[s.track, { backgroundColor: t.card }]}>
            <View
              style={{
                width: `${(done / path.steps.length) * 100}%`,
                backgroundColor: hue.color,
                height: '100%',
                borderRadius: 4,
              }}
            />
          </View>
          <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }}>
            {done === path.steps.length
              ? 'All learned. Go over them now and then so they stick.'
              : `${done} of ${path.steps.length} learned`}
          </Text>
        </View>

        <Card style={{ paddingVertical: 4 }}>
          {path.steps.map((step, i) => {
            const card = cardFor(step);
            if (!card) return null;
            const ticked = isLearned(path.id, step.card);
            return (
              <View
                key={step.card}
                style={[
                  s.step,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                ]}
              >
                <Pressable
                  onPress={() => {
                    toggleLearned(path.id, step.card);
                    Haptics.selectionAsync().catch(() => {});
                    bump((n) => n + 1);
                  }}
                  hitSlop={10}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: ticked }}
                  accessibilityLabel={`I know this: ${card.title}`}
                  style={[
                    s.box,
                    ticked
                      ? { backgroundColor: t.accent, borderColor: t.accent }
                      : { borderColor: t.text },
                  ]}
                >
                  {ticked ? (
                    <Ionicons name="checkmark" size={20} color={t.accentText} />
                  ) : (
                    <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>{i + 1}</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => router.push(`/help/${card.id}`)}
                  accessibilityRole="button"
                  style={({ pressed }) => [s.open, pressed && { opacity: 0.7 }]}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    {step.card === nextUp && (
                      <Text style={[s.now, { color: t.accent }]}>Start here</Text>
                    )}
                    <Text
                      style={{ color: t.text, fontSize: 17, fontWeight: '800', lineHeight: 22 }}
                    >
                      {card.title}
                    </Text>
                    <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                      {card.level && (
                        <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>
                          {card.level === 'basic' ? 'Basic. ' : 'Advanced. '}
                        </Text>
                      )}
                      {step.why}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={t.text} />
                </Pressable>
              </View>
            );
          })}
        </Card>
        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, textAlign: 'center' }}>
          Open a card, read it, try it if you can. Then tick the number.
        </Text>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 4, gap: 12, paddingBottom: 40 },
  hero: { borderRadius: 24, padding: 16, gap: 12 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  box: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  now: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
});
