import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from '../components/ui';
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

const PACK_ART = {
  small: require('../../assets/illustrations/pack-small.png'),
  medium: require('../../assets/illustrations/pack-medium.png'),
  large: require('../../assets/illustrations/pack-large.png'),
} as const;

// Leave some room so the phone itself keeps working after the download.
const SAFETY_MARGIN = 500 * 1024 * 1024;

export default function Packs() {
  const t = useTheme();
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
      <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
        Each bigger pack includes everything in the smaller ones.
        {Number.isFinite(free) ? ` You have ${formatBytes(free)} free.` : ''}
      </Text>

      {catalog.packs.map((p) => {
        const isCurrent = state.pack === p.id;
        const count = itemsForPack(p.id).length;
        const locked = needsUnlock(p.id);
        const product = productFor(p.id);
        const done = isCurrent && state.complete && remainingBytes(p.id) === 0;
        return (
          <Card
            key={p.id}
            style={[
              s.card,
              {
                borderWidth: 2,
                borderColor: isCurrent ? t.accent : 'transparent',
              },
            ]}
          >
            <View style={s.cardHead}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Image source={PACK_ART[p.id]} style={{ width: 40, height: 43 }} />
                <Text style={[s.title, { color: t.text }]}>{p.title}</Text>
              </View>
              <View
                style={[
                  s.pill,
                  {
                    backgroundColor: p.id === 'small' ? t.soft : locked ? '#FCEFC9' : t.soft,
                  },
                ]}
              >
                <Text
                  style={{
                    color: p.id === 'small' || !locked ? t.accent : '#7A5200',
                    fontWeight: '700',
                    fontSize: 15,
                  }}
                >
                  {p.id === 'small' ? 'Free' : locked ? 'Premium' : 'Unlocked'}
                </Text>
              </View>
            </View>
            <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>{p.summary}</Text>
            <Text style={{ color: t.muted, fontSize: 15 }}>
              {count.toLocaleString()} guides · about {formatBytes(packBytes(p.id))}
            </Text>

            {isCurrent && downloading && progress ? (
              <View style={{ gap: 8 }}>
                <View style={[s.barBg, { backgroundColor: t.soft }]}>
                  <View style={[s.bar, { width: `${pct}%`, backgroundColor: t.accent }]} />
                </View>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                  {pct}% saved · {formatBytes(progress.doneBytes + progress.currentBytes)} of{' '}
                  {formatBytes(progress.totalBytes)}
                </Text>
                <Button label="Pause" onPress={pause} kind="secondary" />
              </View>
            ) : done ? (
              <View style={s.doneRow}>
                <Ionicons name="checkmark-circle" size={22} color={t.good} />
                <Text style={{ color: t.good, fontWeight: '700', fontSize: 16 }}>
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
              />
            ) : (
              <Button
                label={state.pack ? `Switch to ${p.title}` : `Save ${p.title} to my phone`}
                onPress={() => choose(p.id)}
                disabled={downloading}
              />
            )}
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

      {tier !== 'large' && (
        <>
          <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
            {tier === 'medium'
              ? `You own Medium, so Large is just ${priceOf('upgrade')} more. `
              : `Small is free forever. Medium is ${priceOf('medium')} and Large is ${priceOf('large')}, one time each. Buy Medium first and Large is ${priceOf('upgrade')} more later. `}
            Updates included. No subscription, ever.
          </Text>
          <Button
            label="I already paid. Restore my purchase"
            onPress={restorePurchase}
            kind="quiet"
          />
        </>
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

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 12, paddingBottom: 32 },
  card: { gap: 10 },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '800' },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  barBg: { height: 12, borderRadius: 6, overflow: 'hidden' },
  bar: { height: 12, borderRadius: 6 },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
});
