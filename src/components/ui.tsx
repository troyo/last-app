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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  kind?: 'primary' | 'secondary' | 'quiet' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const isDark = useDark();
  const kind = props.kind ?? 'primary';
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        // Primary sits up off the page with a soft green glow, so it reads as
        // something to press, not a colored label.
        kind === 'primary' && {
          backgroundColor: t.accent,
          boxShadow: isDark ? undefined : '0px 4px 12px rgba(11, 107, 79, 0.3)',
        },
        // Secondary gets a clear green edge.
        kind === 'secondary' && {
          backgroundColor: t.soft,
          borderWidth: 1.5,
          borderColor: t.accent,
        },
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        props.disabled && { opacity: 0.4 },
        props.style,
      ]}
    >
      <Text
        style={[
          s.btnText,
          {
            color:
              kind === 'primary'
                ? t.accentText
                : kind === 'danger'
                  ? t.bad
                  : // Secondary and quiet buttons use the link green, never gray,
                    // so they don't look like plain text.
                    t.accent,
          },
          (kind === 'quiet' || kind === 'danger') && { fontWeight: '700', fontSize: 16 },
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

/**
 * The top of a page: back arrow, title and (optionally) the page's icon, all on one line,
 * so the page's own content starts right underneath instead of below an empty bar.
 */
/**
 * The "this opens something" sign at the end of a tappable row: a chevron in a
 * small green circle. Testers missed that plain chevrons meant "tap me".
 * Use `inverse` on a green background.
 */
export function Go(props: { inverse?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const isDark = useDark();
  return (
    <View
      style={[
        s.go,
        {
          backgroundColor: props.inverse
            ? isDark
              ? 'rgba(0,0,0,0.14)'
              : 'rgba(255,255,255,0.22)'
            : t.soft,
        },
        props.style,
      ]}
    >
      <Ionicons
        name="chevron-forward"
        size={18}
        color={props.inverse ? t.accentText : t.accent}
        style={{ marginLeft: 2 }}
      />
    </View>
  );
}

export function TitleBar(props: { title: string; icon?: ReactNode }) {
  const t = useTheme();
  const top = useSafeAreaInsets().top;
  return (
    <View style={[s.bar, { backgroundColor: t.bg, paddingTop: top + 4 }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={8}
        style={({ pressed }) => [s.back, { backgroundColor: t.soft }, pressed && { opacity: 0.7 }]}
      >
        <Ionicons name="chevron-back" size={24} color={t.accent} />
      </Pressable>
      <Text
        style={{ color: t.text, fontSize: 24, fontWeight: '800', lineHeight: 29, flex: 1 }}
        numberOfLines={2}
        accessibilityRole="header"
      >
        {props.title}
      </Text>
      {props.icon}
    </View>
  );
}

/** Splits a step into the thing to do (first sentence) and the detail after it. */
function leadOf(step: string): [string, string] {
  const m = step.match(/^(.{8,90}?[.?!])\s+(.+)$/);
  return m ? [m[1], m[2]] : [step, ''];
}

/**
 * Steps to follow in order. One card, a big plain number down the left with a line joining
 * each step to the next, the action in bold and the detail in regular type under it.
 */
export function Steps(props: {
  steps: string[];
  /** Anything that belongs under a step: a timer, a drawing. */
  extra?: (index: number) => ReactNode;
  /** Use inside another card: drops this one's own card. */
  bare?: boolean;
}) {
  const t = useTheme();
  const rows = props.steps.map((step, i) => {
    const [lead, rest] = leadOf(step);
    const last = i === props.steps.length - 1;
    return (
      <View key={i} style={s.stepRow} accessible accessibilityLabel={`Step ${i + 1}. ${step}`}>
        <View style={s.stepRail}>
          <Text style={[s.stepNum, { color: t.accent }]}>{i + 1}</Text>
          {!last && <View style={[s.stepLine, { backgroundColor: t.border }]} />}
        </View>
        <View style={[s.stepBody, !last && { paddingBottom: 20 }]}>
          <Text style={[s.stepLead, { color: t.text }]}>{lead}</Text>
          {!!rest && <Text style={[s.stepRest, { color: t.text }]}>{rest}</Text>}
          {props.extra?.(i)}
        </View>
      </View>
    );
  });
  if (props.bare) return <View>{rows}</View>;
  return <Card style={{ paddingVertical: 18 }}>{rows}</Card>;
}

const BULLET = {
  do: { icon: 'checkmark-circle', bad: false },
  dont: { icon: 'close-circle', bad: true },
  warn: { icon: 'alert-circle', bad: true },
  note: { icon: 'information-circle', bad: false },
  // A tip, not something done or safe: a plain arrow.
  tip: { icon: 'arrow-forward-circle-outline', bad: false },
} as const;

/** A list where order doesn't matter. Each line gets a clear icon and its own row. */
export function Bullets(props: { items: string[]; kind?: keyof typeof BULLET }) {
  const t = useTheme();
  const look = BULLET[props.kind ?? 'do'];
  return (
    <View>
      {props.items.map((item, i) => (
        <View
          key={item}
          style={[
            s.bulletRow,
            i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
          ]}
        >
          <Ionicons
            name={look.icon}
            size={22}
            color={look.bad ? t.bad : t.accent}
            style={{ marginTop: 1 }}
          />
          <Text style={{ color: t.text, fontSize: 16, lineHeight: 24, flex: 1 }}>{item}</Text>
        </View>
      ))}
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
  go: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
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
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepRail: { width: 30, alignItems: 'center' },
  stepNum: { fontSize: 26, fontWeight: '800', lineHeight: 30, fontVariant: ['tabular-nums'] },
  stepLine: { width: 2, flex: 1, borderRadius: 1, marginTop: 6, marginBottom: 6 },
  stepBody: { flex: 1, gap: 4 },
  stepLead: { fontSize: 18, fontWeight: '700', lineHeight: 26, paddingTop: 2 },
  stepRest: { fontSize: 17, lineHeight: 25 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 10 },
});
