import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getCatalog, Item, itemsForPack, Topic } from '../lib/catalog';
import { isDownloaded, remainingBytes } from '../lib/library';
import { useLibrary } from '../lib/LibraryContext';
import { useTheme } from '../lib/theme';

export default function Home() {
  const t = useTheme();
  const { state, downloading, progress, version } = useLibrary();
  const [query, setQuery] = useState('');

  // Only show what's actually on the phone, since that's what works offline.
  const onPhone = useMemo(
    () => (state.pack ? itemsForPack(state.pack).filter(isDownloaded) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pack, version],
  );

  if (!state.pack) {
    return (
      <View style={[s.center, { backgroundColor: t.bg }]}>
        <Text style={[s.big, { color: t.text }]}>
          Survival knowledge that works with no signal.
        </Text>
        <Text style={[s.body, { color: t.muted }]}>
          Pick a pack to save on this phone. Once it's downloaded, everything works offline, in
          airplane mode, with no internet at all.
        </Text>
        <Pressable
          onPress={() => router.push('/packs')}
          style={[s.button, { backgroundColor: t.accent }]}>
          <Text style={[s.buttonText, { color: t.accentText }]}>Choose a pack</Text>
        </Pressable>
      </View>
    );
  }

  const q = query.trim().toLowerCase();
  const results = q ? onPhone.filter((i) => i.title.toLowerCase().includes(q)) : [];
  const total = itemsForPack(state.pack).length;
  const ready = state.complete && remainingBytes(state.pack) === 0;
  const hasUpdate = state.complete && !ready;

  return (
    <FlatList
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={s.list}
      ListHeaderComponent={
        <View>
          <Pressable
            onPress={() => router.push('/packs')}
            style={[s.banner, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.text, fontWeight: '600' }}>
              {state.pack[0].toUpperCase() + state.pack.slice(1)} pack · {onPhone.length}/{total}{' '}
              saved
            </Text>
            <Text style={{ color: !downloading && ready ? t.good : t.warn }}>
              {downloading
                ? `Downloading${progress?.currentTitle ? `: ${progress.currentTitle}` : '…'}`
                : ready
                  ? '✓ Ready offline'
                  : hasUpdate
                    ? 'New guides available. Tap to update'
                    : 'Not finished. Tap to resume'}
            </Text>
          </Pressable>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search (e.g. burn, water, CPR)"
            placeholderTextColor={t.muted}
            style={[s.search, { color: t.text, backgroundColor: t.card, borderColor: t.border }]}
            clearButtonMode="while-editing"
          />
        </View>
      }
      data={(q ? results : getCatalog().topics) as (Item | Topic)[]}
      keyExtractor={(x) => x.id}
      ListEmptyComponent={
        <Text style={{ color: t.muted, padding: 16 }}>Nothing saved matches "{query}".</Text>
      }
      renderItem={({ item }) =>
        !('icon' in item) ? (
          <Pressable
            onPress={() => router.push(`/item/${item.id}`)}
            style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.text, fontSize: 17 }}>{item.title}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push(`/topic/${item.id}`)}
            style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ fontSize: 26 }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 18, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: t.muted }}>
                {onPhone.filter((i) => i.topic === item.id).length} saved
              </Text>
            </View>
            <Text style={{ color: t.muted, fontSize: 20 }}>›</Text>
          </Pressable>
        )
      }
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  big: { fontSize: 28, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 24 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 10 },
  banner: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 4, marginBottom: 10 },
  search: { padding: 14, borderRadius: 12, borderWidth: 1, fontSize: 17, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
