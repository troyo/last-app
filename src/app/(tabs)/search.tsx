import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, IconName, IconTile, Text } from '../../components/ui';
import { findTopic, getCatalog } from '../../lib/catalog';
import { cardsForTopic, plainTitle } from '../../lib/guide-rows';
import { Hazard } from '../../lib/hazards';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { QuickHelp } from '../../lib/quick-help';
import {
  GuideHit,
  recentSearches,
  rememberSearch,
  search,
  SUGGESTED,
  warmSearch,
} from '../../lib/search';
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
  // How many guides of each topic are on this phone, so no topic is a surprise dead end.
  const savedCount = useMemo(() => {
    const n: Record<string, number> = {};
    for (const item of getCatalog().items)
      if (isDownloaded(item)) n[item.topic] = (n[item.topic] ?? 0) + 1;
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);
  const [query, setQuery] = useState('');
  // The box keeps its own letters, so fast typing is never lost while the list
  // catches up. `seed` only changes when the words come from somewhere else
  // (a chip, another screen), and then the box starts again from them.
  const [seed, setSeed] = useState({ text: '', n: 0 });
  const fill = (text: string) => {
    setSeed((cur) => ({ text, n: cur.n + 1 }));
    setQuery(text);
  };
  useEffect(() => {
    const timer = setTimeout(warmSearch, 300);
    return () => clearTimeout(timer);
  }, [version]);
  const [, bump] = useState(0);
  // Other screens can open Search with words already typed in.
  const { q } = useLocalSearchParams<{ q?: string }>();
  useEffect(() => {
    if (q) fill(q);
  }, [q]);

  // The letters show up at once; the list catches up a beat later.
  const asked = useDeferredValue(query);
  const results = useMemo(
    () => search(asked),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asked, version],
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
      onPress={() => fill(label)}
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
            key={seed.n}
            defaultValue={seed.text}
            onChangeText={setQuery}
            placeholder="Try “cut”, “no water” or “knots”"
            placeholderTextColor={t.muted}
            maxFontSizeMultiplier={1.25}
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
          {/* Search finds guides by a word. Ask answers a whole question. Offer both here. */}
          <Pressable
            onPress={() => router.push('/ask')}
            accessibilityRole="button"
            style={({ pressed }) => [
              s.topic,
              { backgroundColor: t.soft, marginBottom: 8 },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="chatbubble-ellipses" size={24} color={t.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>
                Ask a question instead
              </Text>
              <Text style={{ color: t.text, fontSize: 15 }} numberOfLines={1}>
                In your own words, offline
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.accent} />
          </Pressable>
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
                  <IconTile name={look.icon as IconName} {...HUES[look.hue]} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: t.text, fontSize: 17, fontWeight: '800' }}
                      numberOfLines={1}
                    >
                      {topic.title}
                    </Text>
                    <Text style={{ color: t.text, fontSize: 15 }} numberOfLines={1}>
                      {savedCount[topic.id]
                        ? `${savedCount[topic.id].toLocaleString()} ${savedCount[topic.id] === 1 ? 'guide' : 'guides'} on this phone`
                        : cardsForTopic(topic.id).length > 0
                          ? `${cardsForTopic(topic.id).length} step-by-step guides`
                          : Object.keys(savedCount).length === 0
                            ? 'Not saved yet'
                            : 'In the bigger packs'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.text} />
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
                    <Text
                      style={{ color: h.group ? t.accent : t.bad, fontSize: 15, fontWeight: '700' }}
                    >
                      {h.group ? 'Step-by-step guide' : 'Emergency steps'}
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
                    {mine.length === 0 && results.help.length + results.hazards.length === 0
                      ? 'Nothing on this phone matches yet. '
                      : ''}
                    Tap one to get its pack.
                  </Text>
                </View>
              );
            const { item, easy } = row.hit;
            const saved = isDownloaded(item);
            const look = TOPIC_LOOK[item.topic] ?? { icon: 'book-open-variant', hue: 'teal' };
            // Keep a topic name like "First aid & health" from breaking after the "&".
            const topicName = (findTopic(item.topic)?.title ?? '').replace(/ & /g, ' &\u00A0');
            return (
              <Card
                onPress={() => open(() => router.push(saved ? `/item/${item.id}` : '/packs'))}
                style={s.row}
              >
                <IconTile name={look.icon as IconName} {...HUES[look.hue]} size={42} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.title, { color: t.text }]} numberOfLines={2}>
                    {plainTitle(item)}
                  </Text>
                  {/* Manuals come with a line we wrote; article openings read like a dictionary. */}
                  {item.type === 'pdf' && !!item.summary && (
                    <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }} numberOfLines={2}>
                      {item.summary}
                    </Text>
                  )}
                  <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                    {item.type === 'pdf' ? 'Full manual · ' : ''}
                    {topicName}
                  </Text>
                  {!saved && (
                    <Text
                      style={{ color: t.warn, fontSize: 15, fontWeight: '700', lineHeight: 21 }}
                    >
                      In the {PACK_NAME[item.tier]} pack
                    </Text>
                  )}
                </View>
                {saved && easy ? (
                  <Pressable
                    onPress={() => open(() => router.push(`/item/${easy.id}`))}
                    accessibilityRole="button"
                    accessibilityLabel={`${plainTitle(item)}, short version in simple words`}
                    hitSlop={8}
                    style={[s.easy, { backgroundColor: t.soft }]}
                  >
                    <Text style={{ color: t.accent, fontSize: 15, fontWeight: '800' }}>
                      Short version
                    </Text>
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={t.text} />
                )}
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
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  idle: { padding: 18, gap: 10, paddingBottom: 32 },
  label: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999 },
  // One per row, so no topic name has to break onto two lines.
  topics: { gap: 8 },
  topic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 14,
    minHeight: 62,
    borderRadius: 18,
  },
  list: { padding: 18, gap: 10, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 17, fontWeight: '800', lineHeight: 22 },
  easy: { paddingHorizontal: 12, minHeight: 36, borderRadius: 18, justifyContent: 'center' },
});
