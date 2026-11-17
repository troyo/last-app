import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, FadeIn, IconName, IconTile, Text } from '../../components/ui';
import { getCatalog, itemsForPack } from '../../lib/catalog';
import { isDownloaded, remainingBytes } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { QUICK_HELP } from '../../lib/quick-help';
import { HUES, TOPIC_LOOK, useTheme } from '../../lib/theme';
import { hasSeenWelcome } from '../../lib/welcome';

// Home. A calm green header with search, quick help for emergencies, then
// every topic. It always shows the full menu, so there's never a dead end.
export default function Home() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { state, downloading, progress, version } = useLibrary();
  const [query, setQuery] = useState('');
  const focused = useIsFocused();

  // Only count what's actually on the phone, since that's what works offline.
  const onPhone = useMemo(
    () => (state.pack ? itemsForPack(state.pack).filter(isDownloaded) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pack, version],
  );

  if (!hasSeenWelcome()) return <Redirect href="/welcome" />;

  const topics = getCatalog().topics;
  const q = query.trim().toLowerCase();
  const helpResults = q
    ? QUICK_HELP.filter((h) => `${h.title} ${h.when}`.toLowerCase().includes(q))
    : [];
  const results = q ? onPhone.filter((i) => i.title.toLowerCase().includes(q)).slice(0, 60) : [];
  const ready = !!state.pack && state.complete && remainingBytes(state.pack) === 0;
  const packName = state.pack ? state.pack[0].toUpperCase() + state.pack.slice(1) : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: 36 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* White clock and battery icons while the green header is showing */}
      {focused && <StatusBar style="light" />}
      {/* Green header: greeting + search */}
      <View style={[s.header, { backgroundColor: t.header, paddingTop: insets.top + 18 }]}>
        <Text style={s.hello}>Hi there</Text>
        <Text style={s.sub}>Whatever comes up, you’ve got this.</Text>
        <View style={[s.search, { backgroundColor: t.card }]}>
          <Ionicons name="search" size={20} color={t.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What do you need help with?"
            placeholderTextColor={t.muted}
            style={[s.searchInput, { color: t.text }]}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={s.body}>
        {q ? (
          <View style={{ gap: 10 }}>
            {helpResults.map((h) => (
              <Card key={h.id} onPress={() => router.push(`/help/${h.id}`)} style={s.row}>
                <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={40} />
                <Text style={[s.rowTitle, { color: t.text }]}>{h.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={t.muted} />
              </Card>
            ))}
            {results.length === 0 && helpResults.length === 0 && (
              <Text
                style={{
                  color: t.muted,
                  fontSize: 16,
                  lineHeight: 23,
                  padding: 4,
                }}
              >
                {onPhone.length === 0
                  ? 'Nothing is saved on this phone yet. Grab the free pack and try again.'
                  : `No saved guide matches “${query.trim()}”. Try a simpler word, like “burn” or “water”.`}
              </Text>
            )}
            {results.map((item) => (
              <Card key={item.id} onPress={() => router.push(`/item/${item.id}`)} style={s.row}>
                <Text style={[s.rowTitle, { color: t.text, fontWeight: '600' }]}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={t.muted} />
              </Card>
            ))}
          </View>
        ) : (
          <>
            {!state.pack ? (
              <FadeIn>
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <Image
                    source={require('../../../assets/illustrations/welcome.png')}
                    style={s.heroImage}
                    resizeMode="cover"
                  />
                  <View style={{ padding: 18, gap: 8 }}>
                    <Text style={[s.cardTitle, { color: t.text }]}>
                      Let’s save your first guides
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 15, lineHeight: 22 }}>
                      The Small pack is free. Download it once and it works anywhere, even with no
                      signal.
                    </Text>
                    <Button
                      label="Get the free pack"
                      onPress={() => router.push('/packs')}
                      style={{ marginTop: 6 }}
                    />
                  </View>
                </Card>
              </FadeIn>
            ) : (
              <FadeIn>
                <Card onPress={() => router.push('/packs')} style={s.row}>
                  <IconTile
                    name={downloading ? 'cloud-download' : ready ? 'check-bold' : 'clock-outline'}
                    {...(ready && !downloading ? HUES.green : HUES.sun)}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
                      {downloading
                        ? 'Saving your guides…'
                        : ready
                          ? 'You’re all set, even offline'
                          : state.complete
                            ? 'New guides are ready for you'
                            : 'Almost there. Tap to finish'}
                    </Text>
                    <Text style={{ color: t.muted, marginTop: 2, fontSize: 14 }} numberOfLines={1}>
                      {downloading && progress?.currentTitle
                        ? progress.currentTitle
                        : `${packName} pack · ${onPhone.length.toLocaleString()} guides on this phone`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={t.muted} />
                </Card>
              </FadeIn>
            )}

            <View style={s.sectionHead}>
              <Text style={[s.section, { color: t.text }]}>Need help right now?</Text>
              <Text style={{ color: t.muted, fontSize: 14 }}>
                Simple steps. Always on this phone.
              </Text>
            </View>
          </>
        )}
      </View>

      {!q && (
        <>
          {/* Quick help: big, swipeable tiles */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.helpRow}
          >
            {QUICK_HELP.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => router.push(`/help/${h.id}`)}
                style={({ pressed }) => [
                  s.helpTile,
                  { backgroundColor: HUES[h.hue].tint },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[s.helpIcon, { backgroundColor: t.card }]}>
                  <IconTile
                    name={h.icon as IconName}
                    color={HUES[h.hue].color}
                    tint="transparent"
                    size={44}
                  />
                </View>
                <Text style={s.helpTitle}>{h.title}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={s.body}>
            <View style={s.sectionHead}>
              <Text style={[s.section, { color: t.text }]}>Browse by topic</Text>
            </View>
            <View style={s.grid}>
              {topics.map((topic, i) => {
                const count = onPhone.filter((x) => x.topic === topic.id).length;
                const look = TOPIC_LOOK[topic.id] ?? {
                  icon: 'book-open-variant',
                  hue: 'teal',
                };
                return (
                  <FadeIn key={topic.id} delay={80 + i * 35} style={s.cell}>
                    <Card onPress={() => router.push(`/topic/${topic.id}`)} style={s.topic}>
                      <IconTile name={look.icon as IconName} {...HUES[look.hue]} />
                      <Text
                        style={{
                          color: t.text,
                          fontSize: 16,
                          fontWeight: '700',
                        }}
                      >
                        {topic.title}
                      </Text>
                      <Text style={{ color: t.muted, fontSize: 13 }}>
                        {count > 0
                          ? `${count.toLocaleString()} ${count === 1 ? 'guide' : 'guides'}`
                          : 'Not saved yet'}
                      </Text>
                    </Card>
                  </FadeIn>
                );
              })}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  hello: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 16, marginTop: 2, color: '#CFE6DA' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    marginTop: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 14,
    fontFamily: 'Nunito_400Regular',
  },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  heroImage: { width: '100%', height: 190 },
  cardTitle: { fontSize: 21, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 17, fontWeight: '700', flex: 1 },
  sectionHead: { marginTop: 26, marginBottom: 12, gap: 2 },
  section: { fontSize: 21, fontWeight: '800' },
  helpRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 6 },
  helpTile: {
    width: 132,
    height: 140,
    borderRadius: 24,
    padding: 14,
    justifyContent: 'space-between',
  },
  helpIcon: { width: 44, height: 44, borderRadius: 22 },
  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#17352C',
    lineHeight: 20,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  topic: { gap: 8, minHeight: 138 },
});
