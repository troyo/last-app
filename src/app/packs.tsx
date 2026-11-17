import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from '../components/ui';
import { formatBytes, getCatalog, itemsForPack, packBytes, PackId } from '../lib/catalog';
import { freeSpaceBytes, remainingBytes } from '../lib/library';
import { useLibrary } from '../lib/LibraryContext';
import {
  needsUnlock,
  PRICE_LABEL,
  purchase,
  resetForTesting,
  restore,
  TEST_MODE,
  useUnlocked,
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
  const { state, downloading, progress, lastFailed, start, pause, removeAll, version } =
    useLibrary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const free = useMemo(() => freeSpaceBytes(), [version]);

  const catalog = getCatalog();
  const unlocked = useUnlocked();

  const buy = async () => {
    try {
      await purchase();
    } catch {
      Alert.alert('That didn’t go through', 'You were not charged. Please try again in a moment.');
    }
  };
  const restorePurchase = async () => {
    const ok = await restore().catch(() => false);
    if (!ok)
      Alert.alert('Nothing to restore', 'We couldn’t find an earlier purchase on this account.');
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
            ) : locked ? (
              <Button label={`Unlock everything · ${PRICE_LABEL}`} onPress={buy} />
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

      {!unlocked && (
        <>
          <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
            Small is free forever. One payment of {PRICE_LABEL} unlocks Medium and Large, including
            future updates. No subscription, ever.
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
          onPress={unlocked ? resetForTesting : undefined}
        >
          Test mode: unlocking is free and nobody is charged.
          {unlocked ? ' Tap here to lock the packs again.' : ''}
        </Text>
      )}

      {state.pack && (
        <Button
          label="Remove all downloads from this phone"
          kind="quiet"
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
