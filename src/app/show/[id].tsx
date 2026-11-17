import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepTimer } from '../../components/StepTimer';
import { Text } from '../../components/ui';
import { findQuickHelp } from '../../lib/quick-help';
import { SHOW_ME } from '../../lib/show-me';
import { useDark, useTheme } from '../../lib/theme';

const tap = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
};

// One step per screen: a big moving picture, a few words, and a voice.
export default function ShowMe() {
  const t = useTheme();
  const dark = useDark();
  useKeepAwake(); // the screen must not go dark in the middle of CPR
  const { id } = useLocalSearchParams<{ id: string }>();
  const help = findQuickHelp(id);
  const steps = SHOW_ME[id ?? ''];
  const [at, setAt] = useState(0);
  const [tick, setTick] = useState(0);
  const [voice, setVoice] = useState(true);
  const step = steps?.[at];
  const voiceOn = useRef(voice);
  voiceOn.current = voice;

  // Swap the pictures, in time with the beat when there is one.
  useEffect(() => {
    setTick(0);
    if (!step || (step.pics.length < 2 && !step.beat)) return;
    const every = step.beat ? 60000 / step.beat / 2 : (step.holdMs ?? 900);
    const timer = setInterval(() => {
      setTick((n) => {
        // With a beat, every second tick is the push itself: feel it.
        if (step.beat && n % 2 === 0) tap();
        return n + 1;
      });
    }, every);
    return () => clearInterval(timer);
  }, [step]);

  // Read each step out loud.
  useEffect(() => {
    Speech.stop().catch(() => {});
    if (step && voice) Speech.speak(step.say, { rate: 0.92, language: 'en-US' });
  }, [step, voice]);
  useEffect(
    () => () => {
      Speech.stop().catch(() => {});
    },
    [],
  );

  if (!help || !steps || !step) return null;
  const last = at === steps.length - 1;
  const pic = step.pics[tick % step.pics.length];
  // 1, 2, 3 … up to the count, then round again.
  const moves = step.beat ? Math.floor((tick + 1) / 2) : Math.floor(tick / step.pics.length);
  const counted = step.count ? (moves % step.count) + 1 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.top}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Close"
          style={[s.round, { backgroundColor: t.card }]}
        >
          <Ionicons name="close" size={26} color={t.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }} numberOfLines={1}>
            {help.title}
          </Text>
          <View style={s.dots}>
            {steps.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dot,
                  { backgroundColor: i <= at ? t.accent : t.border, width: i === at ? 26 : 10 },
                ]}
              />
            ))}
          </View>
        </View>
        <Pressable
          onPress={() => setVoice((v) => !v)}
          hitSlop={12}
          accessibilityLabel={voice ? 'Turn the voice off' : 'Turn the voice on'}
          style={[s.round, { backgroundColor: voice ? t.accent : t.card }]}
        >
          <Ionicons
            name={voice ? 'volume-high' : 'volume-mute'}
            size={24}
            color={voice ? t.accentText : t.text}
          />
        </Pressable>
      </View>

      <View style={s.body}>
        <View style={s.picture}>
          <Image
            source={pic}
            style={{ width: '100%', height: '100%', opacity: dark ? 0.86 : 1 }}
            resizeMode="contain"
          />
          {counted > 0 && (
            <View style={[s.count, { backgroundColor: t.accent }]}>
              <Text style={{ color: t.accentText, fontSize: 34, fontWeight: '800' }}>
                {counted}
              </Text>
            </View>
          )}
        </View>
        <View style={s.words}>
          <View style={[s.num, { backgroundColor: t.accent }]}>
            <Text style={{ color: t.accentText, fontSize: 20, fontWeight: '800' }}>{at + 1}</Text>
          </View>
          <Text style={[s.say, { color: t.text }]}>{step.say}</Text>
        </View>
        {step.minutes ? <StepTimer key={at} minutes={step.minutes} /> : null}
      </View>

      <View style={s.nav}>
        <Pressable
          onPress={() => setAt((n) => Math.max(0, n - 1))}
          disabled={at === 0}
          accessibilityLabel="Step before"
          style={[s.back, { backgroundColor: t.card, opacity: at === 0 ? 0.35 : 1 }]}
        >
          <Ionicons name="arrow-back" size={28} color={t.text} />
        </Pressable>
        <Pressable
          onPress={() => (last ? router.back() : setAt((n) => n + 1))}
          accessibilityRole="button"
          style={({ pressed }) => [
            s.next,
            { backgroundColor: t.accent },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={{ color: t.accentText, fontSize: 21, fontWeight: '800' }}>
            {last ? 'Done' : 'Next'}
          </Text>
          <Ionicons name={last ? 'checkmark' : 'arrow-forward'} size={26} color={t.accentText} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 5, marginTop: 8 },
  dot: { height: 8, borderRadius: 4 },
  body: { flex: 1, paddingHorizontal: 18, paddingVertical: 12, gap: 22, justifyContent: 'center' },
  picture: { width: '100%', aspectRatio: 720 / 520, borderRadius: 28, overflow: 'hidden' },
  count: {
    position: 'absolute',
    right: 14,
    top: 14,
    minWidth: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  words: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  num: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  say: { flex: 1, fontSize: 25, lineHeight: 33, fontWeight: '800' },
  nav: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingBottom: 12, paddingTop: 8 },
  back: { width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  next: {
    flex: 1,
    height: 68,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
