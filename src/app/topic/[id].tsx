import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { findTopic, itemsForPack } from '../../lib/catalog';
import { isDownloaded } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { useTheme } from '../../lib/theme';

const TYPE_LABEL = { article: 'Guide', pdf: 'PDF', video: 'Video' } as const;

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

  return (
    <>
      <Stack.Screen options={{ title: topic?.title ?? '' }} />
      <FlatList
        style={{ backgroundColor: t.bg }}
        contentContainerStyle={s.list}
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={
          <Text style={{ color: t.muted }}>
            Nothing saved here yet. Finish your download, or pick a bigger pack.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/item/${item.id}`)}
            style={[s.row, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={{ color: t.text, fontSize: 17, flex: 1 }}>{item.title}</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>{TYPE_LABEL[item.type]}</Text>
          </Pressable>
        )}
      />
    </>
  );
}

const s = StyleSheet.create({
  list: { padding: 16, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
