import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Alert, Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Card, Text } from '../components/ui';
import { Chips, Highlights, UPGRADE_ART } from '../components/UpgradeCard';
import { formatBytes, getCatalog, itemsForPack, packBytes, PackId } from '../lib/catalog';
import { freeSpaceBytes, remainingBytes } from '../lib/library';
import { useLibrary, useProgress } from '../lib/LibraryContext';
import {
  buy,
  initPurchases,
  needsUnlock,
  priceOf,
  ProductKey,
  productFor,
  resetForTesting,
  restore,
  TEST_MODE,
  useTier,
} from '../lib/purchases';
import { useTheme } from '../lib/theme';
import { pitchFor, whatPackAdds } from '../lib/upgrade';

const PACK_ART = {
  small: require('../../assets/illustrations/pack-small.png'),
  medium: require('../../assets/illustrations/pack-medium.png'),
  large: require('../../assets/illustrations/pack-large.png'),
} as const;

// Leave some room so the phone itself keeps working after the download.
const SAFETY_MARGIN = 500 * 1024 * 1024;

export default function Packs() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { state, downloading, lastFailed, start, pause, removeAll, version } = useLibrary();
  const progress = useProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const free = useMemo(() => freeSpaceBytes(), [version]);

  const catalog = getCatalog();
  const tier = useTier();
  useEffect(() => {
    initPurchases();
  }, []);

  const unlock = async (key: ProductKey) => {
    const r = await buy(key);
    if (r === 'offline')
      Alert.alert(
        'No connection to the App Store',
        'Buying a pack needs internet for a moment. Once it’s yours, it works offline forever.',
      );
    else if (r === 'failed')
      Alert.alert('That didn’t go through', 'You were not charged. Please try again in a moment.');
    else if (r === 'pending')
      Alert.alert(
        'Waiting for approval',
        'Your purchase is waiting to be approved. The pack unlocks by itself once it is.',
      );
  };
  const restorePurchase = async () => {
    const r = await restore();
    if (r === 'offline')
      Alert.alert('No connection', 'Restoring needs internet for a moment. Please try again.');
    else if (r === 'nothing')
      Alert.alert('Nothing to restore', 'We couldn’t find an earlier purchase on this account.');
    else Alert.alert('All set', 'Your packs are unlocked again.');
  };

  const choose = (pack: PackId) => {
    const need = remainingBytes(pack);
    if (need + SAFETY_MARGIN > free) {
      Alert.alert(
        'Not quite enough room',
        `This pack needs about ${formatBytes(need)}, and your phone has ${formatBytes(free)} free. Clearing a little space, or choosing a smaller pack, will do it.`,
      );
      return;
    }
    start(pack);
  };

  const pct = progress
    ? Math.round(
        // By size, not by file count, so one big manual doesn't make the bar look stuck.
        (Math.min(progress.doneBytes + progress.currentBytes, progress.totalBytes) /
          Math.max(progress.totalBytes, 1)) *
          100,
      )
    : 0;

  const pitch = pitchFor(tier);
  // The picture fills the card's width (page padding is 18 on each side).
  const artHeight = Math.round((Math.min(width, 700) - 36) * 0.56);
  const onPhone = state.pack ? catalog.packs.find((p) => p.id === state.pack) : undefined;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
      {/* Where you stand, in one glance. */}
      <View style={{ gap: 4, marginBottom: 2 }}>
        <Text style={[s.h1, { color: t.text }]}>
          {onPhone ? `You have the ${onPhone.title} pack` : 'Pick your pack'}
        </Text>
        <Text style={{ color: t.text, fontSize: 16, lineHeight: 22 }}>
          Each bigger pack includes everything in the smaller ones.
          {Number.isFinite(free) ? ` Your phone has ${formatBytes(free)} free.` : ''}
        </Text>
      </View>

      {catalog.packs.map((p) => {
        const isCurrent = state.pack === p.id;
        const count = itemsForPack(p.id).length;
        const locked = needsUnlock(p.id);
        const product = productFor(p.id);
        const done = isCurrent && state.complete && remainingBytes(p.id) === 0;
        // The next pack up gets the spotlight: the picture, and real books you'd get.
        const featured = pitch?.target === p.id;
        const adds = whatPackAdds(p.id, PREVIOUS[p.id]);
        return (
          <Card
            key={p.id}
            style={[
              s.card,
              {
                borderWidth: 2,
                borderColor: isCurrent ? t.accent : featured ? t.sun : t.card,
              },
            ]}
          >
            {featured && (
              <View>
                <View style={[s.art, { height: artHeight }]}>
                  <Image
                    source={UPGRADE_ART[p.id as 'medium' | 'large']}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <View style={[s.ribbon, { backgroundColor: t.sun }]}>
                  <MaterialCommunityIcons name="star-four-points" size={15} color="#3A2A00" />
                  <Text style={{ color: '#3A2A00', fontSize: 15, fontWeight: '700' }}>
                    {tier === 'medium' ? 'Your next step' : 'Recommended'}
                  </Text>
                </View>
              </View>
            )}
            <View style={s.inner}>
              <View style={s.cardHead}>
                <Image source={PACK_ART[p.id]} style={s.packArt} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.title, { color: t.text }]}>{p.title}</Text>
                  <Text style={{ color: t.text, fontSize: 15 }}>
                    {count.toLocaleString()} guides · {formatBytes(packBytes(p.id))}
                  </Text>
                </View>
                <PriceTag pack={p.id} locked={locked} product={product} />
              </View>

              <Text style={{ color: t.text, fontSize: 16, lineHeight: 22 }}>{p.summary}</Text>

              {adds.topics.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={[s.label, { color: t.text }]}>
                    {PREVIOUS[p.id]
                      ? `Adds ${adds.extra.toLocaleString()} guides to ${PREVIOUS_NAME[p.id]}`
                      : 'What’s inside'}
                  </Text>
                  <Chips p={adds} max={featured ? 6 : 4} plus={!!PREVIOUS[p.id]} />
                </View>
              )}
              {featured && adds.highlights.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text style={[s.label, { color: t.text }]}>Books you’d get</Text>
                  <Highlights p={adds} />
                </View>
              )}

              {isCurrent && downloading && progress ? (
                <View style={{ gap: 8 }}>
                  <View style={[s.barBg, { backgroundColor: t.soft }]}>
                    <View style={[s.bar, { width: `${pct}%`, backgroundColor: t.accent }]} />
                  </View>
                  <Text
                    style={{ color: t.text, fontSize: 15, fontWeight: '700' }}
                    numberOfLines={1}
                  >
                    {pct}% saved · {formatBytes(progress.doneBytes + progress.currentBytes)} of{' '}
                    {formatBytes(progress.totalBytes)}
                  </Text>
                  <Button label="Pause" onPress={pause} kind="secondary" />
                </View>
              ) : done ? (
                <View style={[s.doneRow, { backgroundColor: t.soft }]}>
                  <Ionicons name="checkmark-circle" size={22} color={t.good} />
                  <Text style={{ color: t.good, fontWeight: '700', fontSize: 16, flex: 1 }}>
                    On your phone and ready offline
                  </Text>
                </View>
              ) : isCurrent ? (
                <Button
                  label={
                    state.complete
                      ? `Get the latest guides (${formatBytes(remainingBytes(p.id))})`
                      : 'Finish saving'
                  }
                  onPress={() => choose(p.id)}
                />
              ) : locked && product ? (
                <Button
                  label={
                    product === 'upgrade'
                      ? `Upgrade to Large · ${priceOf('upgrade')}`
                      : `Unlock ${p.title} · ${priceOf(product)}`
                  }
                  onPress={() => unlock(product)}
                  kind={featured ? 'primary' : 'secondary'}
                />
              ) : (
                <Button
                  label={state.pack ? `Switch to ${p.title}` : `Save ${p.title} to my phone`}
                  onPress={() => choose(p.id)}
                  disabled={downloading}
                  kind={state.pack && !featured ? 'secondary' : 'primary'}
                />
              )}
              {p.id === 'large' && tier === 'free' && (
                <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                  Or start with Medium. Large is then just {priceOf('upgrade')} more, whenever you
                  like.
                </Text>
              )}
            </View>
          </Card>
        );
      })}

      {lastFailed.length > 0 && !downloading && (
        <Card style={{ backgroundColor: t.soft }}>
          <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
            A few guides didn’t make it this time, probably a shaky connection. Nothing is lost. Tap
            “Finish saving” when you have signal again.
          </Text>
        </Card>
      )}

      {/* The plain promise, so nobody wonders about the catch. */}
      <Card style={{ gap: 14 }}>
        {PROMISES.map((r) => (
          <View key={r.title} style={s.promise}>
            <View style={[s.promiseIcon, { backgroundColor: t.soft }]}>
              <MaterialCommunityIcons name={r.icon} size={22} color={t.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>{r.title}</Text>
              <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>{r.body}</Text>
            </View>
          </View>
        ))}
      </Card>

      {tier !== 'large' && (
        <Button
          label="I already paid. Restore my purchase"
          onPress={restorePurchase}
          kind="quiet"
        />
      )}

      {TEST_MODE && (
        <Text
          style={{ color: t.warn, fontSize: 14 }}
          onPress={tier !== 'free' ? resetForTesting : undefined}
        >
          Test mode (web preview): unlocking is free and nobody is charged.
          {tier !== 'free' ? ' Tap here to lock the packs again.' : ''}
        </Text>
      )}

      {state.pack && (
        <Button
          label="Remove all downloads from this phone"
          kind="danger"
          onPress={() =>
            Alert.alert('Remove all downloads?', 'You’ll need internet to save them again.', [
              { text: 'Keep them', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: removeAll },
            ])
          }
        />
      )}
    </ScrollView>
  );
}

/** Top right of each pack: Free, the price, or that it's already yours. */
function PriceTag(props: { pack: PackId; locked: boolean; product: ProductKey | null }) {
  const t = useTheme();
  if (props.pack !== 'small' && !props.locked)
    return (
      <View style={[s.tag, { backgroundColor: t.soft }]}>
        <Ionicons name="checkmark" size={16} color={t.accent} />
        <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700' }}>Yours</Text>
      </View>
    );
  if (props.pack === 'small' || !props.product)
    return (
      <View style={[s.tag, { backgroundColor: t.soft }]}>
        <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700' }}>Free</Text>
      </View>
    );
  return (
    <View style={{ alignItems: 'flex-end' }}>
      <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>
        {priceOf(props.product)}
      </Text>
      {props.product === 'upgrade' ? (
        <Text style={{ color: t.text, fontSize: 15, textDecorationLine: 'line-through' }}>
          {priceOf('large')}
        </Text>
      ) : (
        <Text style={{ color: t.text, fontSize: 15 }}>one time</Text>
      )}
    </View>
  );
}

const PREVIOUS: Record<PackId, PackId | undefined> = {
  small: undefined,
  medium: 'small',
  large: 'medium',
};
const PREVIOUS_NAME: Record<PackId, string> = { small: '', medium: 'Small', large: 'Medium' };

const PROMISES: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  body: string;
}[] = [
  {
    icon: 'cash-check',
    title: 'Pay once, keep it',
    body: 'No subscription, ever. Nobody pays more than the Large price in total.',
  },
  {
    icon: 'wifi-off',
    title: 'Works with no signal',
    body: 'Once saved, every guide opens with no internet, no power grid and no phone service.',
  },
  {
    icon: 'refresh',
    title: 'Free updates',
    body: 'When we add or improve guides, you get them at no cost.',
  },
];

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 14, paddingBottom: 36 },
  h1: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  card: { padding: 0, overflow: 'hidden' },
  inner: { padding: 16, gap: 12 },
  art: { width: '100%', overflow: 'hidden' },
  ribbon: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  packArt: { width: 44, height: 47 },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 27 },
  label: { fontSize: 16, fontWeight: '800' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  barBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  bar: { height: 12, borderRadius: 6 },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promiseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
