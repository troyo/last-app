import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router, useFocusEffect, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, FadeIn, IconName, IconTile, Text } from '../../components/ui';
import { hasAgreed } from '../../lib/agreement';
import { getCatalog, itemsForPack } from '../../lib/catalog';
import { getChecklists, progressOf } from '../../lib/checklists';
import { CLIMATE_TIPS, HAZARDS } from '../../lib/hazards';
import { isDownloaded, remainingBytes } from '../../lib/library';
import { useLibrary } from '../../lib/LibraryContext';
import { CLIMATES, getProfile, placeAsked } from '../../lib/place';
import { QUICK_HELP } from '../../lib/quick-help';
import { HUES, TOPIC_LOOK, useTheme } from '../../lib/theme';
import { hasSeenWelcome } from '../../lib/welcome';

// Short names so six cards fit in two tidy rows.
const SHORT: Record<string, string> = {
  bleeding: 'Bleeding',
  cpr: 'Not breathing',
  choking: 'Choking',
  burn: 'Burns',
  'broken-bone': 'Broken bone',
  heat: 'Overheating',
};

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Hi there' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// Home, laid out the way a prepper thinks:
//   Right now  -> emergency steps
//   Your area  -> what can happen where you live, and how to get through it
//   Get ready  -> checklists for 3 days, 2 weeks, 1 year
//   Learn      -> every topic in the library
export default function Home() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const { state, downloading, progress, version } = useLibrary();
  const [, refresh] = useState(0);
  // Checklist progress may have changed while we were on another screen.
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));

  // Only count what's actually on the phone, since that's what works offline.
  const onPhone = useMemo(
    () => (state.pack ? itemsForPack(state.pack).filter(isDownloaded) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pack, version],
  );

  if (!hasSeenWelcome()) return <Redirect href="/welcome" />;
  if (!hasAgreed()) return <Redirect href="/agree" />;
  if (!placeAsked()) return <Redirect href="/place" />;

  const profile = getProfile();
  const myHazards = profile ? HAZARDS.filter((h) => profile.hazards.includes(h.id)) : [];

  const topics = getCatalog().topics;
  const ready = !!state.pack && state.complete && remainingBytes(state.pack) === 0;
  const packName = state.pack ? state.pack[0].toUpperCase() + state.pack.slice(1) : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      {/* White clock and battery icons while the green header is showing */}
      {focused && <StatusBar style="light" />}
      <View style={[s.header, { backgroundColor: t.header, paddingTop: insets.top + 18 }]}>
        <Text style={s.hello}>{greeting()}</Text>
        <Text style={s.sub}>Whatever comes up, you’ve got this.</Text>
        {/* Looks like a search box; opens the Search tab. */}
        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          style={[s.search, { backgroundColor: t.card }]}
        >
          <Ionicons name="search" size={20} color={t.muted} />
          <Text style={{ color: t.muted, fontSize: 16 }}>What do you need help with?</Text>
        </Pressable>
      </View>

      <View style={s.body}>
        {!state.pack ? (
          <FadeIn>
            <Card style={{ gap: 12 }}>
              <View style={s.row}>
                <Image
                  source={require('../../../assets/illustrations/welcome.png')}
                  style={s.heroImage}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[s.cardTitle, { color: t.text }]}>Save your first guides</Text>
                  <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20 }}>
                    The Small pack is free and works with no signal.
                  </Text>
                </View>
              </View>
              <Button label="Get the free pack" onPress={() => router.push('/packs')} />
            </Card>
          </FadeIn>
        ) : !ready || downloading ? (
          <FadeIn>
            <Card onPress={() => router.push('/packs')} style={s.row}>
              <IconTile name={downloading ? 'cloud-download' : 'clock-outline'} {...HUES.sun} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>
                  {downloading
                    ? 'Saving your guides…'
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
        ) : null}

        <View style={s.sectionHead}>
          <View style={s.row}>
            <Text style={[s.section, { color: t.text, flex: 1 }]}>Right now</Text>
            <Pressable onPress={() => router.push('/emergency')} hitSlop={10}>
              <Text style={{ color: t.accent, fontSize: 14, fontWeight: '800' }}>See all</Text>
            </Pressable>
          </View>
          <Text style={{ color: t.muted, fontSize: 14 }}>
            What to do yourself when help can’t come.
          </Text>
        </View>
      </View>

      {/* Six most urgent cards in two short rows; the rest are one tap away. */}
      <View style={s.helpGrid}>
        {QUICK_HELP.slice(0, 6).map((h) => (
          <View key={h.id} style={s.helpCell}>
            <Pressable
              onPress={() => router.push(`/help/${h.id}`)}
              style={({ pressed }) => [
                s.helpChip,
                { backgroundColor: HUES[h.hue].tint },
                pressed && { opacity: 0.8 },
              ]}
            >
              <MaterialCommunityIcons
                name={h.icon as IconName}
                size={22}
                color={HUES[h.hue].color}
              />
              <Text style={s.chipTitle} numberOfLines={2}>
                {SHORT[h.id] ?? h.title}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={s.body}>
        <View style={[s.sectionHead, { marginTop: 8 }]}>
          <View style={s.row}>
            <Text style={[s.section, { color: t.text, flex: 1 }]} numberOfLines={1}>
              {profile ? `For ${profile.place}` : 'For your area'}
            </Text>
            {profile && (
              <Pressable onPress={() => router.push('/place')} hitSlop={10}>
                <Text style={{ color: t.accent, fontSize: 14, fontWeight: '800' }}>Change</Text>
              </Pressable>
            )}
          </View>
          <Text style={{ color: t.muted, fontSize: 14 }}>
            {profile
              ? 'What can happen where you live, and how to get through it.'
              : 'Survival isn’t one size fits all.'}
          </Text>
        </View>
        {!profile && (
          <Card onPress={() => router.push('/place')} style={s.row}>
            <IconTile name="map-marker-radius" {...HUES.green} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>
                Make this fit where you live
              </Text>
              <Text style={{ color: t.muted, fontSize: 14, lineHeight: 19 }}>
                Takes a minute. Works with no signal.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Card>
        )}
      </View>

      {profile && (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.helpRow}
          >
            {myHazards.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => router.push(`/hazard/${h.id}`)}
                style={({ pressed }) => [
                  s.helpTile,
                  { backgroundColor: HUES[h.hue].tint },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <IconTile
                  name={h.icon as IconName}
                  color={HUES[h.hue].color}
                  tint={t.card}
                  size={40}
                />
                <Text style={s.helpTitle} numberOfLines={2}>
                  {h.title.replace(' and deep cold', '')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={[s.body, { paddingTop: 6 }]}>
            <Card style={[s.row, { alignItems: 'flex-start', backgroundColor: t.soft }]}>
              <IconTile
                name={CLIMATES[profile.climate].icon as IconName}
                color={HUES.sun.color}
                tint={t.card}
                size={40}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>
                  {CLIMATES[profile.climate].title}
                </Text>
                <Text style={{ color: t.text, fontSize: 14, lineHeight: 20 }}>
                  {CLIMATE_TIPS[profile.climate][0]}
                </Text>
              </View>
            </Card>
          </View>
        </>
      )}

      <View style={s.body}>
        <View style={s.sectionHead}>
          <Text style={[s.section, { color: t.text }]}>Get ready</Text>
          <Text style={{ color: t.muted, fontSize: 14 }}>
            {profile
              ? `Lists written for your ${profile.people === 1 ? 'home' : `${profile.people} people`} in ${profile.place}.`
              : 'How long could your home last with no power or shops?'}
          </Text>
        </View>
        <Card style={{ paddingVertical: 4 }}>
          {getChecklists().map((list, i) => {
            const p = progressOf(list);
            return (
              <Pressable
                key={list.id}
                onPress={() => router.push(`/checklist/${list.id}`)}
                style={[
                  s.prepRow,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                ]}
              >
                <IconTile name={list.icon as IconName} {...HUES[list.hue]} size={40} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>
                    Ready for {list.title}
                  </Text>
                  <View style={[s.barBg, { backgroundColor: t.soft }]}>
                    <View
                      style={[
                        s.bar,
                        { width: `${(p.done / p.total) * 100}%`, backgroundColor: t.accent },
                      ]}
                    />
                  </View>
                </View>
                <Text style={{ color: t.muted, fontSize: 13, fontWeight: '700' }}>
                  {p.done}/{p.total}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={t.muted} />
              </Pressable>
            );
          })}
        </Card>

        <View style={s.sectionHead}>
          <Text style={[s.section, { color: t.text }]}>Learn</Text>
          <Text style={{ color: t.muted, fontSize: 14 }}>
            Every guide, sorted by what you need.
          </Text>
        </View>
        <View style={s.grid}>
          {topics.map((topic, i) => {
            const count = onPhone.filter((x) => x.topic === topic.id).length;
            const look = TOPIC_LOOK[topic.id] ?? { icon: 'book-open-variant', hue: 'teal' };
            return (
              <FadeIn key={topic.id} delay={80 + i * 35} style={s.cell}>
                <Card onPress={() => router.push(`/topic/${topic.id}`)} style={s.topic}>
                  <IconTile name={look.icon as IconName} {...HUES[look.hue]} size={40} />
                  <Text
                    style={{ color: t.text, fontSize: 15, fontWeight: '700', lineHeight: 19 }}
                    numberOfLines={2}
                  >
                    {topic.title}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 13 }} numberOfLines={1}>
                    {count > 0
                      ? `${count.toLocaleString()} ${count === 1 ? 'guide' : 'guides'}`
                      : 'Not saved yet'}
                  </Text>
                </Card>
              </FadeIn>
            );
          })}
        </View>
        {ready && !downloading && (
          <View style={[s.row, { gap: 8, marginTop: 22, justifyContent: 'center' }]}>
            <Ionicons name="checkmark-circle" size={18} color={t.good} />
            <Text style={{ color: t.muted, fontSize: 13 }}>
              {onPhone.length.toLocaleString()} guides saved. Everything here works offline.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  hello: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  sub: { fontSize: 15, marginTop: 2, color: '#CFE6DA' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginTop: 14,
    height: 48,
  },
  body: { paddingHorizontal: 18, paddingTop: 16 },
  heroImage: { width: 84, height: 84, borderRadius: 18 },
  cardTitle: { fontSize: 18, fontWeight: '800', lineHeight: 23 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionHead: { marginTop: 22, marginBottom: 10, gap: 2 },
  section: { fontSize: 19, fontWeight: '800' },
  helpRow: { paddingHorizontal: 18, gap: 10, paddingBottom: 6 },
  helpTile: {
    width: 116,
    height: 116,
    borderRadius: 22,
    padding: 12,
    justifyContent: 'space-between',
  },
  helpTitle: { fontSize: 15, fontWeight: '800', color: '#17352C', lineHeight: 19 },
  helpGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14 },
  helpCell: { width: '33.333%', padding: 4 },
  helpChip: {
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: '#17352C', lineHeight: 16 },
  prepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '50%', padding: 5 },
  topic: { gap: 5, height: 138, justifyContent: 'flex-start' },
});
