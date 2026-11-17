// Small shared building blocks so every screen looks and feels the same.
import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DARK_HUES, useDark, useTheme } from '../lib/theme';

// Type. The phone's own typeface (San Francisco on iPhone, Roboto on Android) is the one
// people read all day, so it is the easiest to read here too.
//
// Two rules keep every screen legible without each screen having to think about it:
//   1. Nothing is smaller than 15pt, and everyday text is at least 16pt.
//   2. Only headlines are extra bold. Smaller text steps down a weight so pages don't shout.
const MIN_SIZE: Record<number, number> = { 12: 14, 12.5: 14, 13: 15, 14: 15, 15: 16 };
const CALMER: Record<string, string> = { '900': '700', '800': '700', '700': '600', bold: '600' };

/** Drop-in replacement for React Native's Text that applies the app's type rules. */
export function Text({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const asked = flat.fontSize ?? 16;
  const size = MIN_SIZE[asked] ?? asked;
  const weight = String(flat.fontWeight ?? '400');
  const headline = size >= 20;
  return (
    <RNText
      // If the phone is set to extra-large text, grow a little but never so
      // much that words spill out of their cards.
      maxFontSizeMultiplier={1.25}
      {...rest}
      style={[
        flat,
        {
          fontSize: size,
          fontWeight: (headline ? weight : (CALMER[weight] ?? weight)) as TextStyle['fontWeight'],
          // Keep the line height roomy when the size was bumped up.
          lineHeight: flat.lineHeight
            ? Math.max(flat.lineHeight, Math.round(size * 1.3))
            : undefined,
          letterSpacing: flat.letterSpacing ?? (headline ? -0.3 : 0),
        },
      ]}
    />
  );
}

export function Button(props: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const kind = props.kind ?? 'primary';
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        kind === 'primary' && { backgroundColor: t.accent },
        kind === 'secondary' && { backgroundColor: t.soft },
        (pressed || props.disabled) && { opacity: props.disabled ? 0.4 : 0.8 },
        props.style,
      ]}
    >
      <Text
        style={[
          s.btnText,
          {
            color: kind === 'primary' ? t.accentText : kind === 'secondary' ? t.text : t.muted,
          },
          kind === 'quiet' && { fontWeight: '700', fontSize: 16 },
        ]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

export function Card(props: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const t = useTheme();
  const isDark = useDark();
  // In dark mode a shadow can't be seen, so a thin edge separates the card from the page.
  const style = [
    s.card,
    { backgroundColor: t.card },
    isDark && { borderWidth: StyleSheet.hairlineWidth, borderColor: t.border, shadowOpacity: 0 },
    props.style,
  ];
  if (!props.onPress) return <View style={style}>{props.children}</View>;
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        ...style,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
    >
      {props.children}
    </Pressable>
  );
}

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** A drawn icon on a soft colored circle. Used instead of emoji so everything matches. */
export function IconTile(props: { name: IconName; color: string; tint: string; size?: number }) {
  const size = props.size ?? 48;
  const isDark = useDark();
  const look = (isDark && DARK_HUES[props.tint]) || props;
  return (
    <View
      style={[
        s.tile,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: look.tint,
        },
      ]}
    >
      <MaterialCommunityIcons name={props.name} size={size * 0.54} color={look.color} />
    </View>
  );
}

/** Fades and slides its children in. `delay` staggers a list nicely. */
export function FadeIn(props: {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 450,
      delay: props.delay ?? 0,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, props.delay]);
  return (
    <Animated.View
      style={[
        props.style,
        {
          opacity: v,
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [14, 0],
              }),
            },
          ],
        },
      ]}
    >
      {props.children}
    </Animated.View>
  );
}

/** A slow, gentle bob. Used on illustrations so the app feels alive. */
export function Float(props: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  return (
    <Animated.View
      style={[
        props.style,
        {
          transform: [
            {
              translateY: v.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
          ],
        },
      ]}
    >
      {props.children}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: 'center',
  },
  btnText: { fontSize: 17, fontWeight: '800', textAlign: 'center' },
  card: {
    padding: 16,
    borderRadius: 22,
    // A soft lift instead of an outline.
    shadowColor: '#0B1A15',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tile: { alignItems: 'center', justifyContent: 'center' },
});
