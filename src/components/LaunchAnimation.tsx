import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { Text } from './ui';

const BG = '#21614F';
const SUN = '#FBCB58';
const RAY = '#F5D273';
// The picture is drawn on a 1024 grid (same as the app icon) and scaled down.
const S = 230;
const k = S / 1024;

// Plays every time the app opens: the sun comes up behind the book, the name
// fades in, then it gets out of the way. About two seconds. Tap to skip.
export function LaunchAnimation({ onDone }: { onDone: () => void }) {
  const t = useRef(new Animated.Value(0)).current; // 0 → 1 over the show
  const out = useRef(new Animated.Value(1)).current; // whole screen fading away
  const [gone, setGone] = useState(false);
  const finished = useRef(false);

  const leave = (ms: number) => {
    if (finished.current) return;
    finished.current = true;
    Animated.timing(out, { toValue: 0, duration: ms, useNativeDriver: true }).start(() => {
      setGone(true);
      onDone();
    });
  };

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((calm) => {
        if (!alive) return;
        if (calm) {
          // No movement for people who asked for less: show it still, then fade.
          t.setValue(1);
          setTimeout(() => leave(300), 700);
          return;
        }
        Animated.timing(t, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => setTimeout(() => leave(380), 420));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  const span = (from: number, to: number, a: number, b: number) =>
    t.interpolate({ inputRange: [from, to], outputRange: [a, b], extrapolate: 'clamp' });
  const rise = t.interpolate({
    inputRange: [0.05, 0.3, 0.62],
    outputRange: [330 * k, 150 * k, 0],
    extrapolate: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const ray = (i: number) => span(0.55 + i * 0.07, 0.72 + i * 0.07, 0, 1);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, s.wrap, { opacity: out }]}>
      <Pressable style={s.fill} onPress={() => leave(200)} accessibilityLabel="Last App is opening">
        <View style={{ width: S, height: S }}>
          {/* Everything above the "horizon" (the middle of the book). */}
          <View style={s.sky}>
            <Animated.View
              style={[
                s.halo,
                { opacity: span(0.2, 0.6, 0, 0.2), transform: [{ translateY: rise }] },
              ]}
            />
            <Animated.View style={[s.sun, { transform: [{ translateY: rise }] }]} />
          </View>
          <Animated.View style={[s.ray, { left: 499 * k, top: 157 * k, opacity: ray(1) }]} />
          <Animated.View
            style={[
              s.ray,
              { left: 270 * k, top: 249 * k, opacity: ray(0), transform: [{ rotate: '-45deg' }] },
            ]}
          />
          <Animated.View
            style={[
              s.ray,
              { left: 728 * k, top: 249 * k, opacity: ray(2), transform: [{ rotate: '45deg' }] },
            ]}
          />
          <Animated.Image
            source={require('../../assets/launch-book.png')}
            style={{
              position: 'absolute',
              width: S,
              height: S,
              opacity: span(0, 0.18, 0, 1),
              transform: [{ scale: span(0, 0.25, 0.92, 1) }],
            }}
          />
        </View>
        <Animated.View
          style={{
            opacity: span(0.5, 0.75, 0, 1),
            transform: [{ translateY: span(0.5, 0.75, 14, 0) }],
          }}
        >
          <Text style={s.name}>Last App</Text>
        </Animated.View>
        <Animated.View style={{ opacity: span(0.68, 0.95, 0, 1) }}>
          <Text style={s.line}>Ready when nothing else works</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: BG, zIndex: 100 },
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  sky: { position: 'absolute', left: 0, top: 0, width: S, height: 560 * k, overflow: 'hidden' },
  halo: {
    position: 'absolute',
    left: 212 * k,
    top: 220 * k,
    width: 600 * k,
    height: 600 * k,
    borderRadius: 300 * k,
    backgroundColor: '#FFFFFF',
  },
  sun: {
    position: 'absolute',
    left: 307 * k,
    top: 315 * k,
    width: 410 * k,
    height: 410 * k,
    borderRadius: 205 * k,
    backgroundColor: SUN,
  },
  ray: {
    position: 'absolute',
    width: 26 * k,
    height: 86 * k,
    borderRadius: 13 * k,
    backgroundColor: RAY,
  },
  name: { color: '#FFFFFF', fontSize: 34, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  line: { color: '#E4F1EA', fontSize: 17, fontWeight: '600', marginTop: 4, textAlign: 'center' },
});
