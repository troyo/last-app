import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router, useFocusEffect, useScrollToTop } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, FadeIn, IconName, IconTile, Text } from '../../components/ui';
import { hasAgreed } from '../../lib/agreement';
import { formatBytes, getCatalog, itemsForPack } from '../../lib/catalog';
import { getChecklists, progressOf } from '../../lib/checklists';
import { CLIMATE_TIPS, HAZARDS } from '../../lib/hazards';
import { isDownloaded, remainingBytes } from '../../lib/library';
import { useLibrary, useProgress } from '../../lib/LibraryContext';
import { CLIMATES, getProfile, placeAsked } from '../../lib/place';
import { packOffered } from '../../lib/first-pack';
import { findQuickHelp, QUICK_HELP, QuickHelp } from '../../lib/quick-help';
import { recentHelp } from '../../lib/recent';
import { SITUATIONS } from '../../lib/situations';
import { HUES, useHues, useTheme } from '../../lib/theme';
import { currentPhase, planProgress } from '../../lib/year-plan';
import { hasSeenWelcome } from '../../lib/welcome';

// Short names so six cards fit in two tidy rows.
const SHORT: Record<string, string> = {
  bleeding: 'Bleeding',
  cpr: 'CPR',
  choking: 'Choking',
  burn: 'Burns',
  'broken-bone': 'Broken bone',
  heat: 'Overheating',
};

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Hi there' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** "42% · 12 MB of 21 MB". On its own so a download only redraws this line. */
function SavedSoFar() {
  const progress = useProgress();
  if (!progress) return 'Getting started';
  const got = progress.doneBytes + progress.currentBytes;
  const pct = Math.round(
    (Math.min(got, progress.totalBytes) / Math.max(progress.totalBytes, 1)) * 100,
  );
  return `${pct}% · ${formatBytes(got)} of ${formatBytes(progress.totalBytes)}`;
}

function Section(p: { title: string; action?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <View style={s.sectionHead}>
      <Text style={[s.section, { color: t.text }]} numberOfLines={1}>
        {p.title}
      </Text>
      {p.action && (
        <Pressable onPress={p.onAction} hitSlop={12} accessibilityRole="button">
          <Text style={{ color: t.accent, fontSize: 16, fontWeight: '800' }}>{p.action}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Home, laid out the way a prepper thinks:
//   Right now  -> emergency steps
//   Your area  -> what can happen where you live, and how to get through it
//   Get ready  -> checklists for 3 days, 2 weeks, 1 year
//   Learn      -> every topic in the library
export default function Home() {
  const t = useTheme();
  const hues = useHues();
  const insets = useSafeAreaInsets();
  // Tapping the Home tab again jumps back to the top.
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useScrollToTop(scroller);
  const { state, downloading, version } = useLibrary();
  // White clock and battery on the green header; back to normal on other screens.
  // Rendered (not set imperatively) so the root layout's <StatusBar> can't
  // override it; it unmounts when another tab is focused.
  // Coming back also redraws Home, since checklist progress may have changed.
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  // Only count what's actually on the phone, since that's what works offline.
  const onPhone = useMemo(
    () => (state.pack ? itemsForPack(state.pack).filter(isDownloaded) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pack, version],
  );

  if (!hasSeenWelcome()) return <Redirect href="/welcome" />;
  if (!hasAgreed()) return <Redirect href="/agree" />;
  if (!placeAsked()) return <Redirect href="/place" />;
  // Last step of setup: get the free guides onto the phone while there is internet.
  if (!state.pack && !packOffered()) return <Redirect href="/first-pack" />;

  const profile = getProfile();
  const plan = planProgress();
  const recent = recentHelp()
    .map(findQuickHelp)
    .filter((h): h is QuickHelp => !!h);
  const myHazards = profile ? HAZARDS.filter((h) => profile.hazards.includes(h.id)) : [];

  const topics = getCatalog().topics;
  const left = state.pack ? remainingBytes(state.pack) : 0;
  const ready = !!state.pack && state.complete && left === 0;
  const missing = state.pack ? itemsForPack(state.pack).length - onPhone.length : 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        ref={scroller}
        style={{ flex: 1, backgroundColor: t.bg }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* White clock and battery icons while the green header is showing */}
        {focused && <StatusBar style="light" />}
        <View style={[s.header, { backgroundColor: t.header, paddingTop: insets.top + 22 }]}>
          <Text style={s.hello}>{greeting()}</Text>
          <Text style={s.sub}>Whatever comes up, you’ve got this.</Text>
          {/* Looks like a search box; opens Ask. */}
          <Pressable
            onPress={() => router.push('/ask')}
            accessibilityRole="search"
            style={[s.search, { backgroundColor: t.card }]}
          >
            <Ionicons name="chatbubble-ellipses" size={22} color={t.accent} />
            <Text style={{ color: t.text, fontSize: 17, fontWeight: '600', flex: 1 }}>
              Ask anything
            </Text>
            <View style={[s.searchGo, { backgroundColor: t.accent }]}>
              <Ionicons name="arrow-forward" size={18} color={t.accentText} />
            </View>
          </Pressable>
        </View>

        <View style={s.body}>
          {!state.pack ? (
            <FadeIn style={{ marginTop: 20 }}>
              {/* Kept short so the emergency tiles below stay on the first screen. */}
              <Card style={{ gap: 12 }}>
                <View style={s.row}>
                  <Image
                    source={require('../../../assets/illustrations/welcome.png')}
                    style={{ width: 64, height: 64, borderRadius: 18 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: '800', fontSize: 19 }}>
                      Save your first guides
                    </Text>
                    <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                      Free, and they work with no signal.
                    </Text>
                  </View>
                </View>
                <Button label="Get the free pack" onPress={() => router.push('/packs')} />
              </Card>
            </FadeIn>
          ) : !ready || downloading ? (
            <FadeIn style={{ marginTop: 20 }}>
              {downloading ? (
                <Card onPress={() => router.push('/packs')} style={s.row}>
                  <IconTile name="cloud-download" {...HUES.sun} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontWeight: '800', fontSize: 17 }}>
                      Saving your guides…
                    </Text>
                    <Text style={{ color: t.text, marginTop: 2, fontSize: 15 }} numberOfLines={1}>
                      <SavedSoFar />
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={t.text} />
                </Card>
              ) : (
                // An alert, not a quiet row: guides that aren't on the phone can't help offline.
                <Pressable
                  onPress={() => router.push('/packs')}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    s.alert,
                    { backgroundColor: t.accent },
                    pressed && { opacity: 0.88 },
                  ]}
                >
                  <View style={s.alertIcon}>
                    <Ionicons name="arrow-down" size={22} color={t.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.accentText, fontWeight: '800', fontSize: 18 }}>
                      {missing > 0
                        ? `${missing.toLocaleString()} new ${missing === 1 ? 'guide is' : 'guides are'} ready`
                        : state.complete
                          ? 'New guides are ready'
                          : 'Your guides aren’t all saved yet'}
                    </Text>
                    <Text
                      style={{ color: t.accentText, marginTop: 2, fontSize: 15, lineHeight: 20 }}
                    >
                      Tap to get the latest guides ({formatBytes(left)}). Do it while you have
                      internet.
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={t.accentText} />
                </Pressable>
              )}
            </FadeIn>
          ) : null}

          <Section title="What’s happening?" />
          {/* Start from the situation, not the topic. Each one opens a short plan. */}
          <View style={s.grid}>
            {SITUATIONS.map((sit) => (
              <View key={sit.id} style={s.half}>
                <Pressable
                  onPress={() => router.push(`/situation/${sit.id}`)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    s.sit,
                    { backgroundColor: t.card, borderColor: t.border },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <IconTile name={sit.icon as IconName} {...HUES[sit.hue]} size={40} />
                  <Text
                    style={{
                      color: t.text,
                      fontSize: 16,
                      fontWeight: '700',
                      lineHeight: 20,
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {sit.title}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* The long view: what to get done this hour, this week, this month and each season. */}
          <Pressable
            onPress={() => router.push('/plan')}
            accessibilityRole="button"
            style={({ pressed }) => [
              s.plan,
              { backgroundColor: t.card, borderColor: t.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconTile name="map-marker-path" {...HUES.green} size={44} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>
                Your one-year plan
              </Text>
              <Text style={{ color: t.text, fontSize: 15, lineHeight: 20 }}>
                {plan.done === 0
                  ? 'What to do first, this week, this month and each season.'
                  : `${plan.done} of ${plan.total} jobs done. Next: ${currentPhase().tab.toLowerCase()}.`}
              </Text>
              <View style={[s.planTrack, { backgroundColor: t.border }]}>
                <View
                  style={{
                    width: `${(plan.done / plan.total) * 100}%`,
                    height: '100%',
                    borderRadius: 3,
                    backgroundColor: t.accent,
                  }}
                />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={t.text} />
          </Pressable>

          {/* The leader's notebook: people, water, food, the sick and the jobs. */}
          <Pressable
            onPress={() => router.push('/group')}
            accessibilityRole="button"
            style={({ pressed }) => [
              s.plan,
              { backgroundColor: t.card, borderColor: t.border },
              pressed && { opacity: 0.8 },
            ]}
          >
            <IconTile name="account-group" {...HUES.violet} size={44} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>Your group</Text>
              <Text style={{ color: t.text, fontSize: 15, lineHeight: 20 }}>
                Count people, water and food. Keep a sick list and a job list.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={t.text} />
          </Pressable>

          {recent.length > 0 && (
            <>
              <Section title="Opened lately" />
              <View style={{ gap: 8 }}>
                {recent.map((h) => (
                  <Pressable
                    key={h.id}
                    onPress={() => router.push(`/help/${h.id}`)}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      s.sit,
                      { backgroundColor: t.card, borderColor: t.border },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={40} />
                    <Text style={{ color: t.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
                      {h.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={t.text} />
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Section title="Right now" action="See all" onAction={() => router.push('/emergency')} />
          {/* Six most urgent cards in two short rows; the rest are one tap away. */}
          <View style={s.grid}>
            {QUICK_HELP.slice(0, 6).map((h) => (
              <View key={h.id} style={s.third}>
                <Pressable
                  onPress={() => router.push(`/help/${h.id}`)}
                  style={({ pressed }) => [
                    s.helpChip,
                    { backgroundColor: hues[h.hue].tint },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={h.icon as IconName}
                    size={24}
                    color={hues[h.hue].color}
                  />
                  <Text
                    style={[s.chipTitle, { color: t.text }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {SHORT[h.id] ?? h.title}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          <Section
            title={profile ? `For ${profile.place}` : 'For your area'}
            action={profile ? 'Change' : undefined}
            onAction={() => router.push('/place')}
          />
          {!profile ? (
            <Card onPress={() => router.push('/place')} style={s.row}>
              <IconTile name="map-marker-radius" {...HUES.green} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>
                  Make this fit where you live
                </Text>
                <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21 }}>
                  Takes about a minute.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.text} />
            </Card>
          ) : (
            <>
              <View style={s.grid}>
                {myHazards.map((h) => (
                  <View key={h.id} style={s.halfGrow}>
                    <Pressable
                      onPress={() => router.push(`/hazard/${h.id}`)}
                      style={({ pressed }) => [
                        s.hazard,
                        { backgroundColor: hues[h.hue].tint },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <IconTile
                        name={h.icon as IconName}
                        color={hues[h.hue].color}
                        tint={t.card}
                        size={42}
                      />
                      <Text style={[s.hazardTitle, { color: t.text }]} numberOfLines={2}>
                        {h.title.replace(' and deep cold', '')}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
              <View style={[s.tip, { backgroundColor: t.header }]}>
                <View style={s.tipIcon}>
                  <MaterialCommunityIcons
                    name={CLIMATES[profile.climate].icon as IconName}
                    size={24}
                    color="#F6B93B"
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '800' }}>
                    {CLIMATES[profile.climate].title}
                  </Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 15, lineHeight: 22 }}>
                    {CLIMATE_TIPS[profile.climate][0]}
                  </Text>
                </View>
              </View>
            </>
          )}

          <Section
            title="Get ready checklists"
            action="See all"
            onAction={() => router.push('/prep')}
          />
          {/* One row per list, so it is plain these open: a tick box, how far along, an arrow. */}
          <Card style={{ paddingVertical: 4 }}>
            {getChecklists().map((list, i) => {
              const p = progressOf(list);
              const pct = p.total ? p.done / p.total : 0;
              const all = p.total > 0 && p.done === p.total;
              return (
                <Pressable
                  key={list.id}
                  onPress={() => router.push(`/checklist/${list.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Checklist: ready for ${list.title}. ${p.done} of ${p.total} done`}
                  style={({ pressed }) => [
                    s.listRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[s.listIcon, { backgroundColor: hues[list.hue].tint }]}>
                    <MaterialCommunityIcons
                      name={all ? 'checkbox-marked' : 'checkbox-marked-outline'}
                      size={24}
                      color={hues[list.hue].color}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>
                      Ready for {list.title}
                    </Text>
                    <View style={[s.listTrack, { backgroundColor: t.border }]}>
                      <View
                        style={[
                          s.listFill,
                          { width: `${pct * 100}%`, backgroundColor: hues[list.hue].color },
                        ]}
                      />
                    </View>
                    <Text style={{ color: t.text, fontSize: 15 }}>
                      {p.done === 0
                        ? `${p.total} things to tick off`
                        : `${p.done} of ${p.total} ticked off`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={t.text} />
                </Pressable>
              );
            })}
          </Card>
          <Text style={[s.center, { color: t.muted, marginTop: 10 }]}>
            {profile
              ? `Lists written for ${profile.people === 1 ? 'you' : `your ${profile.people} people`} in ${profile.place}.`
              : 'How long could your home last with no power or shops?'}
          </Text>

          <Section title="Learn" />
          <Card onPress={() => router.push('/search')} style={s.row}>
            <IconTile name="bookshelf" {...HUES.teal} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>
                Browse all guides
              </Text>
              <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                Every guide on this phone, sorted by topic.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={t.text} />
          </Card>

          {ready && !downloading && (
            <View style={[s.row, { gap: 8, marginTop: 26, justifyContent: 'center' }]}>
              <Ionicons name="checkmark-circle" size={20} color={t.good} />
              <Text style={{ color: t.muted, fontSize: 15 }}>
                {onPhone.length.toLocaleString()} guides saved. All of it works offline.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Keeps the clock and battery readable once the green header has scrolled away. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: t.header,
        }}
      />
    </View>
  );
}

// Everything on Home sits on one grid: 20pt side margins, 10pt gutters.
const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  hello: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', lineHeight: 38 },
  sub: { fontSize: 17, marginTop: 2, color: '#FFFFFF' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 18,
    paddingRight: 8,
    borderRadius: 999,
    marginTop: 18,
    height: 56,
  },
  searchGo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 20 },
  heroImage: { width: 120, height: 120, borderRadius: 28 },
  cardTitle: { fontSize: 22, fontWeight: '800', lineHeight: 27, textAlign: 'center' },
  center: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 12,
  },
  section: { fontSize: 24, fontWeight: '800', lineHeight: 30, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', margin: -5 },
  third: { width: '33.333%', padding: 5 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22 },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  listFill: { height: 6, borderRadius: 3 },
  sit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  half: { width: '50%', padding: 5 },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginTop: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  planTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 2 },
  halfGrow: { flexBasis: '50%', flexGrow: 1, padding: 5 },
  helpChip: {
    height: 78,
    borderRadius: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  chipTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  hazard: {
    height: 70,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hazardTitle: { flex: 1, fontSize: 17, fontWeight: '800', lineHeight: 21 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  prep: { flexDirection: 'row', paddingVertical: 20, paddingHorizontal: 8 },
  prepCol: { flex: 1, alignItems: 'center', gap: 10 },
  jar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jarFill: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  topic: { gap: 6, height: 150, alignItems: 'center', justifyContent: 'center' },
  topicTitle: { fontSize: 16, fontWeight: '800', lineHeight: 20, textAlign: 'center' },
});
