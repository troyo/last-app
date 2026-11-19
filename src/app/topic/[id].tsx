import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button, Card, IconName, IconTile, Text, TitleBar } from '../../components/ui';
import { findTopic, itemsForPack, topicSize } from '../../lib/catalog';
import { cardsForTopic, isEasy, pairUp, plainTitle } from '../../lib/guide-rows';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { HUES, TOPIC_LOOK, useTheme } from '../../lib/theme';

// Articles are the default, so only the unusual kinds get a label.
const TYPE_LABEL = { article: '', pdf: 'Full manual (PDF)', video: 'Video' } as const;
const TYPE_ICON = { pdf: 'book-open-page-variant', video: 'play-circle' } as const;

export default function TopicScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, version } = useLibrary();
  const topic = findTopic(id);

  const items = useMemo(
    () =>
      state.pack ? itemsForPack(state.pack).filter((i) => i.topic === id && isDownloaded(i)) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pack, id, version],
  );
  // Big packs put hundreds of guides in one topic, so let people narrow it down.
  const [filter, setFilter] = useState('');
  // 'all', 'easy' (plain-language versions), 'manual' (PDF books), or one letter.
  const [pick, setPick] = useState('all');
  // One row per subject: a guide and its "in simple words" version share a row.
  const sorted = useMemo(
    () => pairUp(items).sort((x, y) => plainTitle(x.item).localeCompare(plainTitle(y.item))),
    [items],
  );
  const letters = useMemo(
    () => [
      ...new Set(
        sorted.map((r) => plainTitle(r.item)[0]?.toUpperCase()).filter((c) => /[A-Z]/.test(c)),
      ),
    ],
    [sorted],
  );
  const hasEasy = useMemo(() => sorted.some((r) => r.easy || isEasy(r.item)), [sorted]);
  const hasManuals = useMemo(() => items.some((i) => i.type === 'pdf'), [items]);
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return sorted.filter((r) => {
      const title = plainTitle(r.item);
      if (f && !title.toLowerCase().includes(f)) return false;
      if (pick === 'easy') return !!r.easy || isEasy(r.item);
      if (pick === 'manual') return r.item.type === 'pdf';
      if (pick !== 'all') return title[0]?.toUpperCase() === pick;
      return true;
    });
  }, [sorted, filter, pick]);
  // The step-by-step guides that come with the app, shown before the library.
  const cards = useMemo(() => cardsForTopic(id), [id]);
  const [allCards, setAllCards] = useState(false);
  const FEW = 4;
  const look = TOPIC_LOOK[id] ?? { icon: 'book-open-variant', hue: 'teal' as const };
  // Is there more for this topic in a bigger pack?
  const inAnyPack = topicSize(id);

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TitleBar
              title={topic?.title ?? ''}
              icon={<IconTile name={look.icon as IconName} {...HUES[look.hue]} size={44} />}
            />
          ),
        }}
      />
      <FlatList
        style={{ backgroundColor: t.bg }}
        contentContainerStyle={s.list}
        data={shown}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 2 }}>
            {cards.length > 0 && (
              <>
                <Text style={[s.label, { color: t.text }]}>Step by step</Text>
                {(allCards ? cards : cards.slice(0, FEW)).map((h) => (
                  <Card key={h.id} onPress={() => router.push(`/help/${h.id}`)} style={s.row}>
                    <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={42} />
                    <Text style={[s.title, { color: t.text, flex: 1 }]}>{h.title}</Text>
                    <Ionicons name="chevron-forward" size={18} color={t.text} />
                  </Card>
                ))}
                {cards.length > FEW && (
                  <Pressable
                    onPress={() => setAllCards(!allCards)}
                    accessibilityRole="button"
                    hitSlop={6}
                    style={[s.moreBtn, { backgroundColor: t.soft }]}
                  >
                    <Text style={{ color: t.accent, fontSize: 16, fontWeight: '800' }}>
                      {allCards ? 'Show fewer' : `Show all ${cards.length}`}
                    </Text>
                    <Ionicons
                      name={allCards ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={t.accent}
                    />
                  </Pressable>
                )}
              </>
            )}
            {items.length > 0 && (
              <Text style={[s.label, { color: t.text, marginTop: cards.length ? 10 : 0 }]}>
                {sorted.length.toLocaleString()} {sorted.length === 1 ? 'guide' : 'guides'} to read
              </Text>
            )}
            {sorted.length > 12 && (
              <View style={[s.filter, { backgroundColor: t.card, borderColor: t.border }]}>
                <Ionicons name="search" size={18} color={t.text} />
                <TextInput
                  value={filter}
                  onChangeText={setFilter}
                  placeholder={`Find in ${topic?.title ?? 'this topic'}`}
                  placeholderTextColor={t.muted}
                  maxFontSizeMultiplier={1.25}
                  style={[s.input, { color: t.text }]}
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                />
              </View>
            )}
            {sorted.length > 12 && (hasEasy || hasManuals || sorted.length > 100) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                // A fixed screen width: a stretched header row inside a list keeps the
                // list's width, so negative margins alone left the chips clipped.
                style={{ width, marginLeft: -18 }}
                contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}
              >
                {[
                  ['all', 'All'],
                  ...(hasEasy ? [['easy', 'Easy reads']] : []),
                  ...(hasManuals ? [['manual', 'Full manuals']] : []),
                  // Letters only earn their space on a really long list.
                  ...(sorted.length > 100 ? letters.map((l) => [l, l]) : []),
                ].map(([key, label]) => {
                  const on = pick === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setPick(key)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      style={[
                        s.pick,
                        { backgroundColor: on ? t.accent : t.card },
                        label.length === 1 && { width: 44, paddingHorizontal: 0 },
                      ]}
                    >
                      <Text
                        style={{
                          color: on ? t.accentText : t.text,
                          fontSize: 16,
                          fontWeight: '800',
                        }}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
            {items.length > 0 && shown.length === 0 && (
              <Text style={{ color: t.text, fontSize: 16, lineHeight: 23 }}>
                Nothing here matches. Try “All” or a shorter word.
              </Text>
            )}
          </View>
        }
        keyExtractor={(r) => r.item.id}
        ListEmptyComponent={
          items.length > 0 ? undefined : cards.length > 0 ? (
            // The built-in guides above still work; the library just has nothing here yet.
            <Card onPress={() => router.push('/packs')} style={s.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.title, { color: t.text }]}>
                  {inAnyPack > 0
                    ? `${inAnyPack.toLocaleString()} more guides to read`
                    : 'More guides'}
                </Text>
                <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                  {state.pack
                    ? 'They come with the bigger packs.'
                    : 'Save a pack and they are yours offline.'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.accent} />
            </Card>
          ) : (
            <View style={s.empty}>
              <Image
                source={require('../../../assets/illustrations/packs.png')}
                style={{ width: '100%', height: 190 }}
                resizeMode="contain"
              />
              <Text style={[s.emptyTitle, { color: t.text }]}>Nothing saved here yet</Text>
              <Text style={[s.emptyBody, { color: t.text }]}>
                {state.pack
                  ? 'These guides come with a bigger pack, or your download is still finishing.'
                  : 'Grab the free pack and this fills up in a minute.'}
              </Text>
              <Button
                label="See my packs"
                onPress={() => router.push('/packs')}
                style={{ alignSelf: 'stretch' }}
              />
            </View>
          )
        }
        ListFooterComponent={
          items.length > 0 && inAnyPack > items.length ? (
            <Card onPress={() => router.push('/packs')} style={s.row}>
              <Text style={{ color: t.text, fontSize: 16, fontWeight: '800', flex: 1 }}>
                {(inAnyPack - items.length).toLocaleString()} more in the bigger packs
              </Text>
              <Ionicons name="chevron-forward" size={18} color={t.accent} />
            </Card>
          ) : undefined
        }
        renderItem={({ item: row }) => {
          const { item, easy } = row;
          const manual = item.type !== 'article';
          return (
            <Card onPress={() => router.push(`/item/${item.id}`)} style={s.row}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.title, { color: t.text }]}>{plainTitle(item)}</Text>
                {/* Manuals come with a line we wrote; article openings read like a dictionary. */}
                {manual && !!item.summary && (
                  <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }} numberOfLines={2}>
                    {item.summary}
                  </Text>
                )}
                {item.type !== 'article' && (
                  <View style={[s.kind, { backgroundColor: t.soft }]}>
                    <MaterialCommunityIcons
                      name={TYPE_ICON[item.type]}
                      size={15}
                      color={t.accent}
                    />
                    <Text style={{ color: t.accent, fontSize: 15, fontWeight: '800' }}>
                      {TYPE_LABEL[item.type]}
                    </Text>
                  </View>
                )}
                {isEasy(item) && (
                  <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700' }}>
                    Short and in simple words
                  </Text>
                )}
              </View>
              {easy ? (
                <Pressable
                  onPress={() => router.push(`/item/${easy.id}`)}
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
    </>
  );
}

const s = StyleSheet.create({
  list: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 32, gap: 10 },
  filter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  pick: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kind: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 17, fontWeight: '800', lineHeight: 22 },
  label: { fontSize: 18, fontWeight: '800' },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46,
    borderRadius: 23,
  },
  easy: { paddingHorizontal: 12, minHeight: 36, borderRadius: 18, justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 10, paddingTop: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '800' },
  emptyBody: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 8,
  },
});
