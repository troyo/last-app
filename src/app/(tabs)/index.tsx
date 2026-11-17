import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, FadeIn } from '../../components/ui';
import { getCatalog, itemsForPack } from '../../lib/catalog';
import { isDownloaded, remainingBytes } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { QUICK_HELP } from '../../lib/quick-help';
import { TOPIC_TINTS, useTheme } from '../../lib/theme';
import { hasSeenWelcome } from '../../lib/welcome';

// Home. Always shows the full menu of topics, whether or not anything is
// downloaded yet, so there's never a dead end.
export default function Home() {
  const t = useTheme();
  const { state, downloading, progress, version } = useLibrary();
  const [query, setQuery] = useState('');

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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <FadeIn>
          <Text style={[s.hello, { color: t.text }]}>Hi there 👋</Text>
          <Text style={[s.sub, { color: t.muted }]}>Whatever comes up, you’ve got this.</Text>
        </FadeIn>

        {!state.pack ? (
          <FadeIn delay={80}>
            <Card style={{ backgroundColor: t.soft, borderColor: t.soft, gap: 10 }}>
              <Image
                source={require('../../../assets/illustrations/welcome.png')}
                style={s.heroImage}
                resizeMode="contain"
              />
              <Text style={[s.cardTitle, { color: t.text }]}>Let’s save your first guides</Text>
              <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
                The Small pack is free. Download it once and it works anywhere, even with no signal.
              </Text>
              <Button label="Get the free pack" onPress={() => router.push('/packs')} />
            </Card>
          </FadeIn>
        ) : (
          <FadeIn delay={80}>
            <Card onPress={() => router.push('/packs')} style={s.status}>
              <View style={[s.statusIcon, { backgroundColor: t.soft }]}>
                <Ionicons
                  name={
                    downloading
                      ? 'cloud-download-outline'
                      : ready
                        ? 'checkmark-circle'
                        : 'time-outline'
                  }
                  size={26}
                  color={ready && !downloading ? t.good : t.accent}
                />
              </View>
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
                <Text style={{ color: t.muted, marginTop: 2 }} numberOfLines={1}>
                  {downloading && progress?.currentTitle
                    ? progress.currentTitle
                    : `${packName} pack · ${onPhone.length.toLocaleString()} guides on this phone`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.muted} />
            </Card>
          </FadeIn>
        )}

        <View style={[s.search, { backgroundColor: t.card, borderColor: t.border }]}>
          <Ionicons name="search" size={20} color={t.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What do you need help with?"
            placeholderTextColor={t.muted}
            style={{ flex: 1, color: t.text, fontSize: 17, paddingVertical: 14 }}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
        </View>

        {q ? (
          <View style={{ gap: 10 }}>
            {helpResults.map((h) => (
              <Card key={h.id} onPress={() => router.push(`/help/${h.id}`)} style={s.resultRow}>
                <Text style={{ fontSize: 22 }}>{h.icon}</Text>
                <Text style={{ color: t.text, fontSize: 17, fontWeight: '700', flex: 1 }}>
                  {h.title}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={t.muted} />
              </Card>
            ))}
            {results.length === 0 && helpResults.length === 0 && (
              <Text style={{ color: t.muted, fontSize: 16, lineHeight: 23, padding: 4 }}>
                {onPhone.length === 0
                  ? 'Nothing is saved on this phone yet. Grab the free pack and try again.'
                  : `No saved guide matches “${query.trim()}”. Try a simpler word, like “burn” or “water”.`}
              </Text>
            )}
            {results.map((item) => (
              <Card
                key={item.id}
                onPress={() => router.push(`/item/${item.id}`)}
                style={s.resultRow}>
                <Text style={{ color: t.text, fontSize: 17, flex: 1 }}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color={t.muted} />
              </Card>
            ))}
          </View>
        ) : (
          <>
            <Text style={[s.section, { color: t.text }]}>Need help right now?</Text>
            <Text style={{ color: t.muted, fontSize: 15, marginTop: -10 }}>
              Simple steps. Always on this phone, no download needed.
            </Text>
            <View style={s.grid}>
              {QUICK_HELP.map((h) => (
                <View key={h.id} style={s.cell}>
                  <Card onPress={() => router.push(`/help/${h.id}`)} style={s.help}>
                    <Text style={{ fontSize: 24 }}>{h.icon}</Text>
                    <Text style={{ color: t.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
                      {h.title}
                    </Text>
                  </Card>
                </View>
              ))}
            </View>

            <Text style={[s.section, { color: t.text }]}>Browse by topic</Text>
            <View style={s.grid}>
              {topics.map((topic, i) => {
                const count = onPhone.filter((x) => x.topic === topic.id).length;
                return (
                  <FadeIn key={topic.id} delay={120 + i * 40} style={s.cell}>
                    <Card onPress={() => router.push(`/topic/${topic.id}`)} style={s.topic}>
                      <View
                        style={[
                          s.topicIcon,
                          { backgroundColor: TOPIC_TINTS[i % TOPIC_TINTS.length] },
                        ]}>
                        <Text style={{ fontSize: 26 }}>{topic.icon}</Text>
                      </View>
                      <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 16, paddingBottom: 32 },
  hello: { fontSize: 32, fontWeight: '800' },
  sub: { fontSize: 17, marginTop: 4 },
  heroImage: { width: '100%', height: 170 },
  cardTitle: { fontSize: 20, fontWeight: '800' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  section: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  topic: { gap: 6, minHeight: 132 },
  help: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 72 },
  topicIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
