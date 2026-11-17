// Small shared building blocks so every screen looks and feels the same.
import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../lib/theme';

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
      ]}>
      <Text
        style={[
          s.btnText,
          { color: kind === 'primary' ? t.accentText : kind === 'secondary' ? t.text : t.muted },
          kind === 'quiet' && { fontWeight: '600', fontSize: 15 },
        ]}>
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
  const style = [s.card, { backgroundColor: t.card, borderColor: t.border }, props.style];
  if (!props.onPress) return <View style={style}>{props.children}</View>;
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        ...style,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}>
      {props.children}
    </Pressable>
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
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}>
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
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
        },
      ]}>
      {props.children}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 16, alignItems: 'center' },
  btnText: { fontSize: 17, fontWeight: '700' },
  card: { padding: 16, borderRadius: 20, borderWidth: 1 },
});
