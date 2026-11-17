import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui';
import { getCatalog } from '../lib/catalog';
import { useLibrary } from '../lib/LibraryContext';
import { useTheme } from '../lib/theme';

// Credits every source, as the licenses require (CC BY-SA asks for attribution).
export default function Sources() {
  const t = useTheme();
  const { version } = useLibrary();
  const groups = useMemo(() => {
    const m = new Map<string, { source: string; license: string; count: number }>();
    for (const i of getCatalog().items) {
      const g = m.get(i.source) ?? { source: i.source, license: i.license, count: 0 };
      // The same publisher can appear with slightly different wording; keep the fuller one.
      if (i.license.length > g.license.length) g.license = i.license;
      g.count++;
      m.set(i.source, g);
    }
    return [...m.values()].sort((a, b) => b.count - a.count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
      <Text style={{ color: t.text, fontSize: 16, lineHeight: 22 }}>
        Everything in this app is public domain or shared under an open license. Each guide also
        shows its source at the bottom of the page. This is general information, not medical advice.
        If you can reach emergency services, call them.
      </Text>
      {groups.map((g) => (
        <View key={g.source} style={[s.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={{ color: t.text, fontWeight: '800', fontSize: 17 }}>{g.source}</Text>
          <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
            {g.license} · {g.count.toLocaleString()} {g.count === 1 ? 'item' : 'items'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 10 },
  card: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 4 },
});
