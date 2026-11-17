import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { findTopic } from '../../lib/catalog';
import { Hazard } from '../../lib/hazards';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { QuickHelp } from '../../lib/quick-help';
import { GuideHit, recentSearches, rememberSearch, search, SUGGESTED } from '../../lib/search';
import { HUES, TOPIC_LOOK, useTheme } from '../../lib/theme';

type Row =
  | { kind: 'help'; help: QuickHelp }
  | { kind: 'hazard'; hazard: Hazard }
  | { kind: 'guide'; hit: GuideHit };
const PACK_NAME = { small: 'Small', medium: 'Medium', large: 'Large' } as const;

// Search everything: emergency cards first, then every guide in every pack.
// Guides that aren't on the phone yet still show up, marked with their pack.
export default function Search() {
  const t = useTheme();
  const { version } = useLibrary();
  const [query, setQuery] = useState('');
  const [, bump] = useState(0);
  // Other screens can open Search with words already typed in.
  const { q } = useLocalSearchParams<{ q?: string }>();
  useEffect(() => {
    if (q) setQuery(q);
  }, [q]);

  const results = useMemo(
    () => search(query),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, version],
  );
  const rows: Row[] = [
    ...results.help.map((help) => ({ kind: 'help', help }) as Row),
    ...results.hazards.map((hazard) => ({ kind: 'hazard', hazard }) as Row),
    ...results.guides.map((hit) => ({ kind: 'guide', hit }) as Row),
  ];
  const typing = query.trim().length > 1;
  const found = results.total + results.help.length + results.hazards.length;
  const recent = recentSearches();

  const open = (go: () => void) => {
    rememberSearch(query);
    bump((n) => n + 1);
    go();
  };

  const chip = (label: string) => (
    <Pressable
      key={label}
      onPress={() => setQuery(label)}
      style={({ pressed }) => [s.chip, { backgroundColor: t.card }, pressed && { opacity: 0.7 }]}
    >
      <Text style={{ color: t.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={s.top}>
        <Text style={[s.h1, { color: t.text }]}>Search</Text>
        <View style={[s.box, { backgroundColor: t.card, borderColor: t.border }]}>
          <Ionicons name="search" size={20} color={t.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Try “cut”, “no water” or “knots”"
            placeholderTextColor={t.muted}
            style={[s.input, { color: t.text }]}
            clearButtonMode="while-editing"
            returnKeyType="search"
            autoCorrect={false}
            onSubmitEditing={() => rememberSearch(query)}
          />
        </View>
      </View>

      {!typing ? (
        <View style={s.idle}>
          {recent.length > 0 && (
            <>
              <Text style={[s.label, { color: t.muted }]}>Recent</Text>
              <View style={s.chips}>{recent.map(chip)}</View>
            </>
          )}
          <Text style={[s.label, { color: t.muted }]}>People often look for</Text>
          <View style={s.chips}>{SUGGESTED.map(chip)}</View>
          <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20, marginTop: 8 }}>
            Use everyday words. Search looks through every guide and the emergency steps, and works
            with no signal.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) =>
            r.kind === 'help'
              ? `h-${r.help.id}`
              : r.kind === 'hazard'
                ? `z-${r.hazard.id}`
                : r.hit.item.id
          }
          contentContainerStyle={s.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <Text style={{ color: t.muted, fontSize: 14, marginBottom: 2 }}>
              {rows.length === 0
                ? ''
                : `${found.toLocaleString()} ${found === 1 ? 'result' : 'results'}`}
            </Text>
          }
          ListEmptyComponent={
            <Text style={{ color: t.muted, fontSize: 16, lineHeight: 23, paddingTop: 8 }}>
              Nothing matches “{query.trim()}”. Try a simpler word, like “burn”, “water” or “fire”.
            </Text>
          }
          renderItem={({ item: row }) => {
            if (row.kind === 'help') {
              const h = row.help;
              return (
                <Card onPress={() => open(() => router.push(`/help/${h.id}`))} style={s.row}>
                  <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.title, { color: t.text }]}>{h.title}</Text>
                    <Text style={{ color: t.bad, fontSize: 13, fontWeight: '700' }}>
                      Emergency steps
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.muted} />
                </Card>
              );
            }
            if (row.kind === 'hazard') {
              const h = row.hazard;
              return (
                <Card onPress={() => open(() => router.push(`/hazard/${h.id}`))} style={s.row}>
                  <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={42} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.title, { color: t.text }]}>{h.title}</Text>
                    <Text style={{ color: t.accent, fontSize: 13, fontWeight: '700' }}>
                      Before, during and after
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.muted} />
                </Card>
              );
            }
            const { item } = row.hit;
            const saved = isDownloaded(item);
            const look = TOPIC_LOOK[item.topic] ?? { icon: 'book-open-variant', hue: 'teal' };
            return (
              <Card
                onPress={() => open(() => router.push(saved ? `/item/${item.id}` : '/packs'))}
                style={[s.row, { alignItems: 'flex-start' }]}
              >
                <IconTile name={look.icon as IconName} {...HUES[look.hue]} size={42} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {!!item.summary && (
                    <Text
                      style={{ color: t.muted, fontSize: 14, lineHeight: 19 }}
                      numberOfLines={2}
                    >
                      {item.summary}
                    </Text>
                  )}
                  <Text style={{ color: saved ? t.good : t.warn, fontSize: 13, fontWeight: '700' }}>
                    {saved
                      ? 'On this phone'
                      : `In the ${PACK_NAME[item.tier]} pack · tap to get it`}
                    <Text style={{ color: t.muted, fontWeight: '400' }}>
                      {'  ·  '}
                      {findTopic(item.topic)?.title ?? ''}
                    </Text>
                  </Text>
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  top: { paddingHorizontal: 18, paddingTop: 18, gap: 12 },
  h1: { fontSize: 28, fontWeight: '800' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    height: 50,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 0, fontFamily: 'Nunito_400Regular' },
  idle: { padding: 18, gap: 10 },
  label: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  list: { padding: 18, gap: 10, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 16, fontWeight: '800', lineHeight: 21 },
});
