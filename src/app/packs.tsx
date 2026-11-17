import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      Alert.alert('Purchase not completed', 'You were not charged. Please try again.');
    }
  };
  const restorePurchase = async () => {
    const ok = await restore().catch(() => false);
    if (!ok) Alert.alert('Nothing to restore', 'No earlier purchase was found on this account.');
  };

  const choose = (pack: PackId) => {
    const need = remainingBytes(pack);
    if (need + SAFETY_MARGIN > free) {
      Alert.alert(
        'Not enough space',
        `This pack needs about ${formatBytes(need)} more, and your phone has ${formatBytes(free)} free. Free up some space or pick a smaller pack.`,
      );
      return;
    }
    start(pack);
  };

  const pct = progress
    ? Math.round(
        ((progress.doneItems +
          (progress.currentTotal ? progress.currentBytes / progress.currentTotal : 0)) /
          Math.max(progress.totalItems, 1)) *
          100,
      )
    : 0;

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
      <Text style={{ color: t.muted, fontSize: 15 }}>
        Free on this phone: {Number.isFinite(free) ? formatBytes(free) : 'unknown'}. Bigger packs
        include everything in the smaller ones.
      </Text>

      {catalog.packs.map((p) => {
        const isCurrent = state.pack === p.id;
        const count = itemsForPack(p.id).length;
        return (
          <View
            key={p.id}
            style={[
              s.card,
              { backgroundColor: t.card, borderColor: isCurrent ? t.accent : t.border },
            ]}>
            <View style={s.cardHead}>
              <Text style={[s.title, { color: t.text }]}>
                {p.title}
                {p.id === 'small' ? '  · Free' : unlocked ? '' : '  🔒'}
              </Text>
              <Text style={{ color: t.muted, fontWeight: '600' }}>
                ~{formatBytes(packBytes(p.id))}
              </Text>
            </View>
            <Text style={{ color: t.muted, fontSize: 15 }}>{p.summary}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>{count.toLocaleString()} guides</Text>

            {isCurrent && downloading && progress ? (
              <View style={{ gap: 8 }}>
                <View style={[s.barBg, { backgroundColor: t.border }]}>
                  <View style={[s.bar, { width: `${pct}%`, backgroundColor: t.accent }]} />
                </View>
                <Text style={{ color: t.text }}>
                  {pct}% · {progress.doneItems}/{progress.totalItems}
                  {progress.currentTitle ? ` · ${progress.currentTitle}` : ''}
                </Text>
                <Btn label="Pause" onPress={pause} t={t} secondary />
              </View>
            ) : isCurrent && state.complete && remainingBytes(p.id) === 0 ? (
              <Text style={{ color: t.good, fontWeight: '600' }}>
                ✓ On your phone, ready offline
              </Text>
            ) : isCurrent ? (
              <Btn
                label={
                  state.complete
                    ? `Download update (${formatBytes(remainingBytes(p.id))})`
                    : 'Resume download'
                }
                onPress={() => choose(p.id)}
                t={t}
              />
            ) : needsUnlock(p.id) ? (
              <Btn label={`Unlock all packs · ${PRICE_LABEL}`} onPress={buy} t={t} />
            ) : (
              <Btn
                label={state.pack ? `Switch to ${p.title}` : `Download ${p.title}`}
                onPress={() => choose(p.id)}
                t={t}
                disabled={downloading}
              />
            )}
          </View>
        );
      })}

      {!unlocked && (
        <Text style={{ color: t.muted, fontSize: 14 }}>
          Small is free forever. One payment of {PRICE_LABEL} unlocks Medium and Large, including
          future updates. No subscription.
        </Text>
      )}
      {!unlocked && <Btn label="Restore purchase" onPress={restorePurchase} t={t} secondary />}
      {TEST_MODE && (
        <Text
          style={{ color: t.warn, fontSize: 12 }}
          onPress={unlocked ? resetForTesting : undefined}>
          Test mode: unlocking is free and nobody is charged.
          {unlocked ? ' Tap here to lock the packs again.' : ''}
        </Text>
      )}

      {lastFailed.length > 0 && !downloading && (
        <Text style={{ color: t.bad }}>
          {lastFailed.length} guide(s) didn't download (no signal?). Tap Resume to try again.
        </Text>
      )}

      {state.pack && (
        <Btn
          label="Delete everything from this phone"
          t={t}
          secondary
          onPress={() =>
            Alert.alert('Delete all downloads?', 'You will need internet to get them back.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: removeAll },
            ])
          }
        />
      )}

      {catalog.note && <Text style={{ color: t.muted, fontSize: 12 }}>{catalog.note}</Text>}
      <Btn label="Sources & licenses" onPress={() => router.push('/sources')} t={t} secondary />
    </ScrollView>
  );
}

function Btn(props: {
  label: string;
  onPress: () => void;
  t: ReturnType<typeof useTheme>;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const { t } = props;
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      style={[
        s.btn,
        props.secondary ? { borderWidth: 1, borderColor: t.border } : { backgroundColor: t.accent },
        props.disabled && { opacity: 0.4 },
      ]}>
      <Text
        style={{ color: props.secondary ? t.text : t.accentText, fontWeight: '700', fontSize: 16 }}>
        {props.label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 14 },
  card: { padding: 16, borderRadius: 14, borderWidth: 2, gap: 8 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontSize: 22, fontWeight: '700' },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10 },
});
