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

  return (
    <Pressable
      onPress={running ? () => setEndsAt(null) : start}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.pill,
        { backgroundColor: running ? t.accent : t.soft },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Ionicons
        name={running ? 'stop-circle' : done ? 'checkmark-circle' : 'timer-outline'}
        size={22}
        color={running ? t.accentText : t.accent}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: running ? t.accentText : t.accent, fontSize: 16, fontWeight: '800' }}>
          {running
            ? `${clock(left)} left · tap to stop`
            : done
              ? 'Time’s up. Tap to go again'
              : `Start ${minutes}-minute timer`}
        </Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    minHeight: 46,
    borderRadius: 14,
    marginTop: 10,
  },
});
