// The friendly "there's more" card. Free people see what Medium adds; Medium owners see what
// Large adds for the upgrade price. It shows real books they'd get and points to My packs,
// where the buying happens. Never shown to people who own everything.
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTier } from '../lib/purchases';
import { useTheme } from '../lib/theme';
import { Pitch, pitchFor } from '../lib/upgrade';
import { Button, Card, Text } from './ui';

export const UPGRADE_ART = {
  medium: require('../../assets/illustrations/upgrade-medium.png'),
  large: require('../../assets/illustrations/upgrade-large.png'),
} as const;

export const packName = (p: Pitch) => (p.target === 'medium' ? 'Medium' : 'Large');

/** "Unlock 1,862 more guides" / "Go Large: 1,563 more guides" */
export function headline(p: Pitch) {
  const n = p.extra.toLocaleString();
  return p.target === 'medium' ? `Unlock ${n} more guides` : `Go Large: ${n} more guides`;
}

/** "Medium pack · $15 one time" / "Just $15 for Medium owners" */
export function priceLine(p: Pitch) {
  return p.target === 'medium'
    ? `Medium pack · ${p.price} one time`
    : `Just ${p.price} for Medium owners`;
}

/**
 * The big card with the illustration (home screen and More). `onNotNow` adds a quiet
 * "Not now" so it can be put away.
 */
export function UpgradeCard(props: { onNotNow?: () => void }) {
  const t = useTheme();
  // Home has 20pt margins; the picture fills the card's width.
  const { width } = useWindowDimensions();
  const tier = useTier();
  const p = pitchFor(tier);
  if (!p || p.extra === 0) return null;
  return (
    <Card style={s.card}>
      <Pressable
        onPress={() => router.push('/packs')}
        accessibilityRole="button"
        accessibilityLabel={`${headline(p)}. ${priceLine(p)}. See the packs.`}
        style={({ pressed }) => pressed && { opacity: 0.9 }}
      >
        <View style={[s.art, { height: Math.round((Math.min(width, 700) - 40) * 0.56) }]}>
          <Image
            source={UPGRADE_ART[p.target]}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <View style={s.body}>
          <View style={[s.pill, { backgroundColor: t.soft }]}>
            <MaterialCommunityIcons name="star-four-points" size={15} color={t.accent} />
            <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700' }}>{priceLine(p)}</Text>
          </View>
          <Text style={[s.h, { color: t.text }]}>{headline(p)}</Text>
          <Highlights p={p} />
        </View>
      </Pressable>
      <View style={[s.body, { paddingTop: 0 }]}>
        <Button label={`See what’s in ${packName(p)}`} onPress={() => router.push('/packs')} />
        {props.onNotNow && (
          <Button label="Not now" kind="quiet" onPress={props.onNotNow} style={s.notNow} />
        )}
      </View>
    </Card>
  );
}

/** A few real books from the bigger pack, so the value is concrete. */
export function Highlights({ p }: { p: Pick<Pitch, 'highlights'> }) {
  const t = useTheme();
  if (p.highlights.length === 0) return null;
  return (
    <View style={{ gap: 6 }}>
      {p.highlights.map((h) => (
        <View key={h} style={s.hl}>
          <MaterialCommunityIcons name="book-open-variant" size={18} color={t.accent} />
          <Text style={{ color: t.text, fontSize: 16, flex: 1 }} numberOfLines={1}>
            {h}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The biggest topics in the bigger pack, with how many guides each adds. */
export function Chips({
  p,
  max = 4,
  plus = true,
}: {
  p: Pick<Pitch, 'topics'>;
  max?: number;
  plus?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={s.chips}>
      {p.topics.slice(0, max).map((tp) => (
        <View key={tp.id} style={[s.chip, { backgroundColor: t.bg, borderColor: t.border }]}>
          <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }}>
            {plus ? '+' : ''}
            {tp.count.toLocaleString()}{' '}
            <Text style={{ color: t.text, fontSize: 15, fontWeight: '400' }}>{tp.title}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

/** A one-line version for the bottom of a topic list: "412 more guides on this topic". */
export function UpgradeRow(props: { count: number }) {
  const t = useTheme();
  const tier = useTier();
  const p = pitchFor(tier);
  if (!p || props.count === 0) return null;
  return (
    <Card onPress={() => router.push('/packs')} style={[s.row, { backgroundColor: t.soft }]}>
      <Image source={UPGRADE_ART[p.target]} style={s.thumb} resizeMode="cover" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: t.text, fontSize: 17, fontWeight: '800', lineHeight: 22 }}>
          {props.count.toLocaleString()} more guides on this topic
        </Text>
        <Text style={{ color: t.text, fontSize: 15, lineHeight: 20 }}>
          {tier === 'free'
            ? `In the bigger packs, from ${p.price} one time`
            : `In Large, ${p.price} more for Medium owners`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={t.accent} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden', gap: 0 },
  art: { width: '100%', overflow: 'hidden' },
  body: { padding: 16, gap: 10 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  h: { fontSize: 22, fontWeight: '800', lineHeight: 27 },
  hl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  notNow: { marginTop: -4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 64, height: 48, borderRadius: 10 },
});
