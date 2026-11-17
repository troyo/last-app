import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from '../../components/ui';
import { findTopic, getCatalog, itemsForPack } from '../../lib/catalog';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { useTheme } from '../../lib/theme';

const TYPE_ICON = {
  article: 'document-text-outline',
  pdf: 'book-outline',
  video: 'play-circle-outline',
} as const;
const TYPE_LABEL = { article: 'Guide', pdf: 'Manual (PDF)', video: 'Video' } as const;

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
  // Is there more for this topic in a bigger pack?
  const inAnyPack = getCatalog().items.filter((i) => i.topic === id).length;

  return (
    <>
      <Stack.Screen options={{ title: topic?.title ?? '' }} />
      <FlatList
        style={{ backgroundColor: t.bg }}
        contentContainerStyle={s.list}
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
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
              onPress={() => router.dismissTo('/packs')}
              style={{ alignSelf: 'stretch' }}
            />
          </View>
        }
        ListFooterComponent={
          items.length > 0 && inAnyPack > items.length ? (
            <Text style={{ color: t.muted, textAlign: 'center', padding: 12 }}>
              {(inAnyPack - items.length).toLocaleString()} more in the bigger packs
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/item/${item.id}`)} style={s.row}>
            <View style={[s.icon, { backgroundColor: t.soft }]}>
              <Ionicons name={TYPE_ICON[item.type]} size={20} color={t.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: t.muted, fontSize: 13, marginTop: 2 }}>
                {TYPE_LABEL[item.type]}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Card>
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  list: { padding: 20, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 10, paddingTop: 12 },
  emptyTitle: { fontSize: 22, fontWeight: '800' },
  emptyBody: { fontSize: 16, lineHeight: 23, textAlign: 'center', marginBottom: 8 },
});
