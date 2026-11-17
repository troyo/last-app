import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Card, IconName, IconTile, Text } from '../../components/ui';
import { findTopic, getCatalog, itemsForPack } from '../../lib/catalog';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { HUES, TOPIC_LOOK, useTheme } from '../../lib/theme';

// Articles are the default, so only the unusual kinds get a label.
const TYPE_LABEL = { article: '', pdf: 'Full manual (PDF)', video: 'Video' } as const;
const TYPE_ICON = { pdf: 'book-open-page-variant', video: 'play-circle' } as const;

export default function TopicScreen() {
  const t = useTheme();
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
  const sorted = useMemo(() => [...items].sort((x, y) => x.title.localeCompare(y.title)), [items]);
  const letters = useMemo(
    () => [...new Set(sorted.map((i) => i.title[0]?.toUpperCase()).filter((c) => /[A-Z]/.test(c)))],
    [sorted],
  );
  const hasEasy = useMemo(() => items.some((i) => i.title.includes('simple words')), [items]);
  const hasManuals = useMemo(() => items.some((i) => i.type === 'pdf'), [items]);
  const shown = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return sorted.filter((i) => {
      if (f && !i.title.toLowerCase().includes(f)) return false;
      if (pick === 'easy') return i.title.includes('simple words');
      if (pick === 'manual') return i.type === 'pdf';
      if (pick !== 'all') return i.title[0]?.toUpperCase() === pick;
      return true;
    });
  }, [sorted, filter, pick]);
  const look = TOPIC_LOOK[id] ?? { icon: 'book-open-variant', hue: 'teal' as const };
  // Is there more for this topic in a bigger pack?
  const inAnyPack = getCatalog().items.filter((i) => i.topic === id).length;

  return (
    <>
      <Stack.Screen options={{ title: items.length > 0 ? '' : (topic?.title ?? '') }} />
      <FlatList
        style={{ backgroundColor: t.bg }}
        contentContainerStyle={s.list}
        data={shown}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={{ gap: 12, marginBottom: 2 }}>
              <View style={s.row}>
                <IconTile name={look.icon as IconName} {...HUES[look.hue]} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', lineHeight: 29 }}>
                    {topic?.title}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 15 }}>
                    {items.length.toLocaleString()} {items.length === 1 ? 'guide' : 'guides'} on
                    this phone
                  </Text>
                </View>
              </View>
              {items.length > 12 && (
                <View style={[s.filter, { backgroundColor: t.card, borderColor: t.border }]}>
                  <Ionicons name="search" size={18} color={t.muted} />
                  <TextInput
                    value={filter}
                    onChangeText={setFilter}
                    placeholder={`Find in ${topic?.title ?? 'this topic'}`}
                    placeholderTextColor={t.muted}
                    style={[s.input, { color: t.text }]}
                    clearButtonMode="while-editing"
                    autoCorrect={false}
                  />
                </View>
              )}
              {items.length > 12 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -18 }}
                  contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}
                >
                  {[
                    ['all', 'All'],
                    ...(hasEasy ? [['easy', 'Easy reads']] : []),
                    ...(hasManuals ? [['manual', 'Full manuals']] : []),
                    ...letters.map((l) => [l, l]),
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
              {items.length > 12 && (
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }}>
                  {shown.length.toLocaleString()} {shown.length === 1 ? 'guide' : 'guides'}, A to Z
                </Text>
              )}
              {shown.length === 0 && (
                <Text style={{ color: t.muted, fontSize: 15 }}>
                  Nothing here matches. Try “All” or a shorter word.
                </Text>
              )}
            </View>
          ) : undefined
        }
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          items.length > 0 ? undefined : (
            <View style={s.empty}>
              <Image
                source={require('../../../assets/illustrations/packs.png')}
                style={{ width: '100%', height: 190 }}
                resizeMode="contain"
              />
              <Text style={[s.emptyTitle, { color: t.text }]}>Nothing saved here yet</Text>
              <Text style={[s.emptyBody, { color: t.muted }]}>
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
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/item/${item.id}`)} style={s.row}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: t.text, fontSize: 16, fontWeight: '800', lineHeight: 21 }}>
                {item.title}
              </Text>
              {!!item.summary && (
                <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }} numberOfLines={2}>
                  {item.summary}
                </Text>
              )}
              {item.type !== 'article' && (
                <View style={[s.kind, { backgroundColor: t.soft }]}>
                  <MaterialCommunityIcons name={TYPE_ICON[item.type]} size={14} color={t.accent} />
                  <Text style={{ color: t.accent, fontSize: 12, fontWeight: '800' }}>
                    {TYPE_LABEL[item.type]}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Card>
        )}
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
  empty: { alignItems: 'center', gap: 10, paddingTop: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '800' },
  emptyBody: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 8,
  },
});
