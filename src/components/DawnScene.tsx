// The opening picture, drawn and animated in code so it stays tiny and works
// offline: night turns to morning over a little cabin with a lit window.
// The message without words: however dark it gets, you'll be okay.
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

const STARS = [
  [0.1, 0.12, 3],
  [0.22, 0.3, 2],
  [0.35, 0.1, 2],
  [0.5, 0.22, 3],
  [0.63, 0.08, 2],
  [0.78, 0.2, 3],
  [0.9, 0.1, 2],
  [0.86, 0.36, 2],
  [0.06, 0.4, 2],
] as const;

export function DawnScene({ width }: { width: number }) {
  const height = width * 0.8;
  const u = width / 300; // everything is laid out on a 300-wide grid

  const dawn = useRef(new Animated.Value(0)).current; // 0 night -> 1 morning
  const pop = useRef(new Animated.Value(0)).current; // cabin and trees arrive
  const loop = useRef(new Animated.Value(0)).current; // endless gentle motion

  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, friction: 6, tension: 60, useNativeDriver: false }),
      Animated.timing(dawn, {
        toValue: 1,
        duration: 2600,
        delay: 250,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
    const forever = Animated.loop(
      Animated.timing(loop, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    forever.start();
    return () => forever.stop();
  }, [dawn, pop, loop]);

  const sky = dawn.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#1B3A4E', '#F2A77B', '#CDE9F2'],
  });
  const sunY = dawn.interpolate({ inputRange: [0, 1], outputRange: [150 * u, 34 * u] });
  const glow = loop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] });
  const starFade = dawn.interpolate({
    inputRange: [0, 0.45],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const twinkle = loop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.35, 1] });
  const backHill = dawn.interpolate({ inputRange: [0, 1], outputRange: ['#1E4A3C', '#7CC29A'] });
  const frontHill = dawn.interpolate({ inputRange: [0, 1], outputRange: ['#163A2F', '#3F9A6F'] });
  const windowGlow = loop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.75, 1] });

  // Three puffs of chimney smoke, each a third of a loop behind the last.
  const puff = (offset: number) => {
    const p = Animated.modulo(Animated.add(loop, offset), 1);
    return {
      opacity: p.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.75, 0] }),
      transform: [
        { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -46 * u] }) },
        { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, 16 * u] }) },
        { scale: p.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) },
      ],
    };
  };

  const tree = (left: number, bottom: number, size: number, delayScale: number) => (
    <Animated.View
      style={{
        position: 'absolute',
        left: left * u,
        bottom: bottom * u,
        alignItems: 'center',
        transform: [
          {
            scale: pop.interpolate({
              inputRange: [0, delayScale, 1],
              outputRange: [0, 0, 1],
            }),
          },
        ],
      }}
    >
      <View
        style={[
          s.tri,
          {
            borderLeftWidth: size * 0.42 * u,
            borderRightWidth: size * 0.42 * u,
            borderBottomWidth: size * 0.7 * u,
            borderBottomColor: '#1F6B4F',
            marginBottom: -size * 0.32 * u,
          },
        ]}
      />
      <View
        style={[
          s.tri,
          {
            borderLeftWidth: size * 0.55 * u,
            borderRightWidth: size * 0.55 * u,
            borderBottomWidth: size * 0.8 * u,
            borderBottomColor: '#1B5C45',
          },
        ]}
      />
      <View
        style={{ width: size * 0.18 * u, height: size * 0.28 * u, backgroundColor: '#6B4426' }}
      />
    </Animated.View>
  );

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Morning arriving over a small cabin with a lit window"
      style={[s.frame, { width, height, borderRadius: 32 * u, backgroundColor: sky }]}
    >
      {STARS.map(([x, y, r], i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: x * width,
            top: y * height,
            width: r * u * 1.4,
            height: r * u * 1.4,
            borderRadius: r * u,
            backgroundColor: '#FFFFFF',
            opacity: Animated.multiply(starFade, i % 2 ? twinkle : 1),
          }}
        />
      ))}

      {/* Sun, with a soft breathing halo */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 190 * u,
          width: 64 * u,
          height: 64 * u,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateY: sunY }],
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            width: 104 * u,
            height: 104 * u,
            borderRadius: 52 * u,
            backgroundColor: '#FFE9A8',
            opacity: dawn.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.45, 0.45] }),
            transform: [{ scale: glow }],
          }}
        />
        <View
          style={{
            width: 64 * u,
            height: 64 * u,
            borderRadius: 32 * u,
            backgroundColor: '#F6B93B',
          }}
        />
      </Animated.View>

      {/* Hills */}
      <Animated.View
        style={{
          position: 'absolute',
          left: -60 * u,
          bottom: -150 * u,
          width: 300 * u,
          height: 260 * u,
          borderRadius: 150 * u,
          backgroundColor: backHill,
        }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          right: -110 * u,
          bottom: -190 * u,
          width: 400 * u,
          height: 290 * u,
          borderRadius: 200 * u,
          backgroundColor: frontHill,
        }}
      />

      {tree(26, 96, 34, 0.3)}
      {tree(62, 88, 26, 0.5)}
      {tree(238, 82, 30, 0.6)}

      {/* Cabin */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 118 * u,
          bottom: 72 * u,
          alignItems: 'center',
          transform: [
            { scale: pop },
            { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [30 * u, 0] }) },
          ],
        }}
      >
        {[0, 0.33, 0.66].map((o) => (
          <Animated.View
            key={o}
            style={[
              {
                position: 'absolute',
                left: 50 * u,
                top: -8 * u,
                width: 12 * u,
                height: 12 * u,
                borderRadius: 6 * u,
                backgroundColor: '#FFFFFF',
              },
              puff(o),
            ]}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            left: 50 * u,
            top: 6 * u,
            width: 11 * u,
            height: 22 * u,
            backgroundColor: '#7A3E2A',
            borderRadius: 2 * u,
          }}
        />
        <View
          style={[
            s.tri,
            {
              borderLeftWidth: 42 * u,
              borderRightWidth: 42 * u,
              borderBottomWidth: 34 * u,
              borderBottomColor: '#B4412F',
            },
          ]}
        />
        <View
          style={{
            width: 68 * u,
            height: 44 * u,
            backgroundColor: '#F7E3C4',
            borderBottomLeftRadius: 4 * u,
            borderBottomRightRadius: 4 * u,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            paddingHorizontal: 8 * u,
          }}
        >
          <View
            style={{
              width: 16 * u,
              height: 28 * u,
              backgroundColor: '#8A5A2B',
              borderTopLeftRadius: 8 * u,
              borderTopRightRadius: 8 * u,
            }}
          />
          <Animated.View
            style={{
              width: 20 * u,
              height: 18 * u,
              marginBottom: 12 * u,
              borderRadius: 3 * u,
              backgroundColor: '#FFC94D',
              borderWidth: 2 * u,
              borderColor: '#8A5A2B',
              opacity: windowGlow,
            }}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  frame: { overflow: 'hidden' },
  tri: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    backgroundColor: 'transparent',
  },
});
