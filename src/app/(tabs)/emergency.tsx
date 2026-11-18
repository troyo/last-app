import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconName, IconTile, Text } from '../../components/ui';
import { HAZARDS } from '../../lib/hazards';
import { getProfile } from '../../lib/place';
import { helpText, QUICK_HELP } from '../../lib/quick-help';
import { HUES, useTheme } from '../../lib/theme';

// Every "what do I do right now" card as big tiles you can hit with a shaking
// thumb. Built into the app, so it works with no download, power or signal.
export default function Emergency() {
  const t = useTheme();
  const [filter, setFilter] = useState('');
  // Your place may have changed while this tab was out of view.
  const [, refresh] = useState(0);
  useFocusEffect(useCallback(() => refresh((n) => n + 1), []));

  const want = filter.trim().toLowerCase();
  const fits = (...texts: string[]) => !want || texts.join(' ').toLowerCase().includes(want);
  const all = QUICK_HELP.filter((h) => fits(helpText(h)));
  const cards = all.filter((h) => !h.group);
  // Do-it-yourself fixes for life with no power: light, cooking, toilet, food, phone.
  const outage = all.filter((h) => h.group === 'outage');
  // Disasters likely where you live come first; the rest are still one tap away.
  const mine = getProfile()?.hazards ?? [];
  const hazards = HAZARDS.filter((h) => fits(h.title, h.blurb, h.search)).sort(
    (a, b) => Number(mine.includes(b.id)) - Number(mine.includes(a.id)),
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView
        contentContainerStyle={s.wrap}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[s.h1, { color: t.text }]}>Emergency</Text>
        <Text style={{ color: t.text, fontSize: 16, lineHeight: 22 }}>
          Step-by-step help for when no one is coming.
        </Text>
        <View style={[s.box, { backgroundColor: t.card, borderColor: t.border }]}>
          <Ionicons name="search" size={20} color={t.text} />
          <TextInput
            value={filter}
            onChangeText={setFilter}
            placeholder="What’s happening?"
            placeholderTextColor={t.muted}
            autoCorrect={false}
            clearButtonMode="while-editing"
            style={[s.input, { color: t.text }]}
          />
        </View>

        {cards.length > 0 && (
          <View style={s.grid}>
            {cards.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => router.push(`/help/${h.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${h.title}. ${h.when}`}
                style={({ pressed }) => [
                  s.tile,
                  { backgroundColor: t.card },
                  pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                ]}
              >
                <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={48} />
                <Text style={[s.tileText, { color: t.text }]} numberOfLines={2}>
                  {h.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {outage.length > 0 && (
          <>
            <Text style={[s.h2, { color: t.text }]}>When the power is out</Text>
            <Text style={{ color: t.text, fontSize: 16, lineHeight: 22 }}>
              Do-it-yourself fixes with what’s in the house.
            </Text>
            <View style={s.grid}>
              {outage.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => router.push(`/help/${h.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${h.title}. ${h.when}`}
                  style={({ pressed }) => [
                    s.tile,
                    { backgroundColor: t.card },
                    pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={48} />
                  <Text style={[s.tileText, { color: t.text }]} numberOfLines={2}>
                    {h.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {hazards.length > 0 && (
          <>
            <Text style={[s.h2, { color: t.text }]}>Disasters</Text>
            <Text style={{ color: t.text, fontSize: 16, lineHeight: 22 }}>
              What to do before, during and after.
            </Text>
            <View style={s.grid}>
              {hazards.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => router.push(`/hazard/${h.id}`)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    s.tile,
                    s.tall,
                    { backgroundColor: t.card },
                    pressed && { opacity: 0.75, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <IconTile name={h.icon as IconName} {...HUES[h.hue]} size={48} />
                  <Text style={[s.tileText, { color: t.text }]} numberOfLines={2}>
                    {h.title}
                  </Text>
                  {/* In the flow under the name, so it can never sit on top of the icon. */}
                  {mine.includes(h.id) && (
                    <View style={[s.badge, { backgroundColor: t.sun }]}>
                      <Text style={s.badgeText}>Your area</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}

        {all.length + hazards.length === 0 && (
          <View style={{ gap: 12, paddingTop: 6 }}>
            <Text style={{ color: t.text, fontSize: 17, lineHeight: 24 }}>
              No emergency card matches “{filter.trim()}”. The guides may still cover it.
            </Text>
            <Pressable
              onPress={() => router.push({ pathname: '/search', params: { q: filter.trim() } })}
            >
              <Text style={{ color: t.accent, fontSize: 17, fontWeight: '800' }}>
                Search all guides for it
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, gap: 12, paddingBottom: 32 },
  h1: { fontSize: 28, fontWeight: '800' },
  h2: { fontSize: 22, fontWeight: '800', marginTop: 14 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    height: 50,
  },
  input: { flex: 1, fontSize: 17, paddingVertical: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 124,
    borderRadius: 22,
    alignItems: 'center',
    // Pinned to the top so the icons line up across a row, whether the name takes one line or two.
    justifyContent: 'flex-start',
    paddingTop: 16,
    gap: 8,
    paddingHorizontal: 10,
    shadowColor: '#17352C',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  tileText: { fontSize: 17, fontWeight: '800', lineHeight: 21, textAlign: 'center' },
  tall: { height: undefined, minHeight: 124, paddingBottom: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontSize: 14, fontWeight: '800', color: '#3D2A00' },
});
