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

  const total = minutes * 60;
  const gone = running ? 1 - left / total : 0;

  // Part of the step it belongs to: a small clock face, what it will do, and one round button.
  return (
    <Pressable
      onPress={running ? () => setEndsAt(null) : start}
      accessibilityRole="button"
      accessibilityLabel={
        running ? `${clock(left)} left. Stop timer` : `Start ${minutes}-minute timer`
      }
      style={({ pressed }) => [
        s.row,
        { backgroundColor: t.soft, borderColor: running ? t.accent : 'transparent' },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[s.dial, { borderColor: t.accent, backgroundColor: t.card }]}>
        {done ? (
          <Ionicons name="checkmark" size={26} color={t.accent} />
        ) : (
          <>
            <Text style={[s.dialNum, { color: t.text }]}>
              {running ? Math.ceil(left / 60) : minutes}
            </Text>
            <Text style={[s.dialUnit, { color: t.text }]}>min</Text>
          </>
        )}
      </View>
      <View style={{ flex: 1 }}>
        {running ? (
          <>
            <Text style={[s.clock, { color: t.text }]}>{clock(left)}</Text>
            <Text style={{ color: t.text, fontSize: 15 }}>Buzzes at zero</Text>
            <View style={[s.track, { backgroundColor: t.border }]}>
              <View style={[s.fill, { backgroundColor: t.accent, width: `${gone * 100}%` }]} />
            </View>
          </>
        ) : (
          <>
            <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>
              {done ? 'Time’s up' : `${minutes}-minute timer`}
            </Text>
            <Text style={{ color: t.text, fontSize: 15 }}>
              {done ? 'Tap to time it again' : 'Tap to start'}
            </Text>
          </>
        )}
      </View>
      <View
        style={[
          s.go,
          { backgroundColor: running ? 'transparent' : t.accent, borderColor: t.accent },
        ]}
      >
        <Ionicons
          name={running ? 'stop' : done ? 'refresh' : 'play'}
          size={20}
          color={running ? t.accent : t.accentText}
          style={!running && !done ? { marginLeft: 2 } : undefined}
        />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    paddingRight: 12,
    borderRadius: 18,
    borderWidth: 2,
    marginTop: 10,
  },
  dial: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  fill: { height: 6, borderRadius: 3 },
  dialNum: { fontSize: 18, fontWeight: '800', lineHeight: 20, fontVariant: ['tabular-nums'] },
  dialUnit: { fontSize: 11, lineHeight: 12, fontWeight: '600' },
  clock: { fontSize: 28, fontWeight: '800', lineHeight: 32, fontVariant: ['tabular-nums'] },
  go: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
