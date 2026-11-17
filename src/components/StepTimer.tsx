import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';
import { useTheme } from '../lib/theme';
import { Text } from './ui';

/** Finds "10 minutes" or "1 minute" in a step, so the step can offer a timer. */
export function minutesIn(step: string): number | null {
  const m = step.match(/\b(\d{1,2}) minutes?\b/i);
  return m ? Number(m[1]) : null;
}

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// A one-tap countdown for steps like "keep pressing for 10 minutes". It works
// from the finish time, so it stays right even if the phone naps for a moment.
export function StepTimer({ minutes }: { minutes: number }) {
  const t = useTheme();
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (endsAt === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        setEndsAt(null);
        setDone(true);
        Vibration.vibrate([0, 600, 300, 600]);
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endsAt]);

  const running = endsAt !== null;
  const start = () => {
    setDone(false);
    setEndsAt(Date.now() + minutes * 60000);
  };

  if (running) {
    const total = minutes * 60;
    return (
      <View style={[s.panel, { backgroundColor: t.soft, borderColor: t.accent }]}>
        <View style={s.top}>
          <View style={{ flex: 1 }}>
            <Text style={[s.clock, { color: t.text }]} accessibilityLiveRegion="none">
              {clock(left)}
            </Text>
            <Text style={{ color: t.text, fontSize: 16 }}>left. Your phone will buzz.</Text>
          </View>
          <Pressable
            onPress={() => setEndsAt(null)}
            accessibilityRole="button"
            accessibilityLabel="Stop timer"
            hitSlop={8}
            style={({ pressed }) => [
              s.stop,
              { borderColor: t.accent },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="stop" size={18} color={t.accent} />
            <Text style={{ color: t.accent, fontSize: 16, fontWeight: '700' }}>Stop</Text>
          </Pressable>
        </View>
        <View style={[s.track, { backgroundColor: t.border }]}>
          <View
            style={[s.fill, { backgroundColor: t.accent, width: `${100 - (left / total) * 100}%` }]}
          />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={start}
      accessibilityRole="button"
      style={({ pressed }) => [s.btn, { backgroundColor: t.accent }, pressed && { opacity: 0.85 }]}
    >
      <Ionicons name={done ? 'refresh' : 'play'} size={22} color={t.accentText} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.accentText, fontSize: 17, fontWeight: '700' }}>
          {done ? 'Time’s up. Start again' : `Start ${minutes}-minute timer`}
        </Text>
        {!done && <Text style={{ color: t.accentText, fontSize: 15 }}>Buzzes when time is up</Text>}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 60,
    borderRadius: 18,
    marginTop: 10,
  },
  panel: { borderRadius: 18, borderWidth: 2, padding: 14, gap: 12, marginTop: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clock: { fontSize: 40, fontWeight: '800', lineHeight: 44, fontVariant: ['tabular-nums'] },
  stop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});
