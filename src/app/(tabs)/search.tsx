import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { findTopic, getCatalog } from '../../lib/catalog';
import { Hazard } from '../../lib/hazards';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { QuickHelp } from '../../lib/quick-help';
import { GuideHit, recentSearches, rememberSearch, search, SUGGESTED } from '../../lib/search';
import { HUES, TOPIC_LOOK, useTheme } from '../../lib/theme';

type Row =
  | { kind: 'help'; help: QuickHelp }
  | { kind: 'hazard'; hazard: Hazard }
  | { kind: 'guide'; hit: GuideHit }
  | { kind: 'locked'; count: number };
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
  ];
  // Guides on the phone come first; the ones in packs not saved yet sit under their own heading.
  const mine = results.guides.filter((hit) => isDownloaded(hit.item));
  const locked = results.guides.filter((hit) => !isDownloaded(hit.item));
  rows.push(...mine.map((hit) => ({ kind: 'guide', hit }) as Row));
  if (locked.length > 0) {
    rows.push({ kind: 'locked', count: locked.length });
    rows.push(...locked.map((hit) => ({ kind: 'guide', hit }) as Row));
  }
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
        <ScrollView contentContainerStyle={s.idle} keyboardShouldPersistTaps="handled">
          {recent.length > 0 && (
            <>
              <Text style={[s.label, { color: t.muted }]}>Recent</Text>
              <View style={s.chips}>{recent.map(chip)}</View>
            </>
          )}
          <Text style={[s.label, { color: t.muted }]}>People often look for</Text>
          <View style={s.chips}>{SUGGESTED.map(chip)}</View>
          <Text style={[s.label, { color: t.muted }]}>Or browse a topic</Text>
          <View style={s.topics}>
            {getCatalog().topics.map((topic) => {
              const look = TOPIC_LOOK[topic.id] ?? { icon: 'book-open-variant', hue: 'teal' };
              return (
                <Pressable
                  key={topic.id}
                  onPress={() => router.push(`/topic/${topic.id}`)}
                  style={({ pressed }) => [
                    s.topic,
                    { backgroundColor: t.card },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <IconTile name={look.icon as IconName} {...HUES[look.hue]} size={36} />
                  <Text
                    style={{ color: t.text, fontSize: 15, fontWeight: '800', flex: 1 }}
                    numberOfLines={2}
                  >
                    {topic.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(r) =>
            r.kind === 'help'
              ? `h-${r.help.id}`
              : r.kind === 'hazard'
                ? `z-${r.hazard.id}`
                : r.kind === 'locked'
                  ? 'locked'
                  : r.hit.item.id
          }
          contentContainerStyle={s.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <Text style={{ color: t.muted, fontSize: 15, marginBottom: 2 }}>
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
                    <Text style={{ color: t.bad, fontSize: 15, fontWeight: '700' }}>
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
                    <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700' }}>
                      Before, during and after
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.muted} />
                </Card>
              );
            }
            if (row.kind === 'locked')
              return (
                <View style={{ paddingTop: 10, gap: 2 }}>
                  <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>
                    In packs you haven’t saved
                  </Text>
                  <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                    {mine.length === 0 ? 'Nothing on this phone matches yet. ' : ''}Tap one to get
                    its pack.
                  </Text>
                </View>
              );
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
                      style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}
                      numberOfLines={2}
                    >
                      {item.summary}
                    </Text>
                  )}
                  <Text style={{ color: saved ? t.good : t.warn, fontSize: 15, fontWeight: '700' }}>
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
  idle: { padding: 18, gap: 10, paddingBottom: 32 },
  label: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topic: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    minHeight: 58,
    borderRadius: 18,
  },
  list: { padding: 18, gap: 10, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 16, fontWeight: '800', lineHeight: 21 },
});
