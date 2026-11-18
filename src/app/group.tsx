import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Card, IconName, IconTile, Text, TitleBar } from '../components/ui';
import { daysSince, getGroup, Group, JOBS, saveGroup, supply } from '../lib/group';
import { HUES, useHues, useTheme } from '../lib/theme';

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`);

// The leader's page: a quick, honest count of people, water, food, the sick and the jobs.
export default function GroupScreen() {
  const t = useTheme();
  const hues = useHues();
  const [g, setG] = useState<Group>(() => getGroup());
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const left = supply(g);

  const set = (change: Partial<Group>) => setG({ ...saveGroup(change) });
  const bump = (key: 'people' | 'water' | 'food', by: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    const next = Math.max(key === 'people' ? 1 : 0, g[key] + by);
    set(key === 'people' ? { people: next } : { [key]: next, countedAt: Date.now() });
  };
  const addSick = () => {
    if (!name.trim()) return;
    set({
      sick: [
        ...g.sick,
        { id: String(Date.now()), name: name.trim(), note: note.trim(), since: Date.now() },
      ],
    });
    setName('');
    setNote('');
  };

  const Stepper = (p: { k: 'people' | 'water' | 'food'; big?: number; unit: string }) => (
    <View style={s.stepper}>
      {p.big ? <Step label={`−${p.big}`} onPress={() => bump(p.k, -p.big!)} /> : null}
      <Step label="−1" onPress={() => bump(p.k, -1)} />
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{ color: t.text, fontSize: 30, fontWeight: '800' }}>{g[p.k]}</Text>
        <Text style={{ color: t.text, fontSize: 15 }}>{p.unit}</Text>
      </View>
      <Step label="+1" onPress={() => bump(p.k, 1)} />
      {p.big ? <Step label={`+${p.big}`} onPress={() => bump(p.k, p.big!)} /> : null}
    </View>
  );
  const Step = (p: { label: string; onPress: () => void }) => (
    <Pressable
      onPress={p.onPress}
      accessibilityRole="button"
      accessibilityLabel={p.label}
      style={({ pressed }) => [s.step, { backgroundColor: t.soft }, pressed && { opacity: 0.6 }]}
    >
      <Text style={{ color: t.accent, fontSize: 17, fontWeight: '800' }}>{p.label}</Text>
    </Pressable>
  );
  const Head = (p: { icon: IconName; hue: keyof typeof HUES; title: string; sub?: string }) => (
    <View style={s.head}>
      <IconTile name={p.icon} {...hues[p.hue]} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.text, fontSize: 19, fontWeight: '800' }}>{p.title}</Text>
        {p.sub ? (
          <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>{p.sub}</Text>
        ) : null}
      </View>
    </View>
  );
  const Link = (p: { label: string; href: string }) => (
    <Pressable
      onPress={() => router.push(p.href as never)}
      accessibilityRole="button"
      hitSlop={6}
      style={({ pressed }) => [s.link, { backgroundColor: t.soft }, pressed && { opacity: 0.7 }]}
    >
      <Ionicons name="book" size={16} color={t.accent} />
      <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700' }}>{p.label}</Text>
      <Ionicons name="chevron-forward" size={16} color={t.accent} />
    </Pressable>
  );
  const Result = (p: { text: string; low: boolean }) => (
    <View style={[s.result, { backgroundColor: p.low ? t.dangerTint : t.soft }]}>
      <Ionicons
        name={p.low ? 'warning' : 'checkmark-circle'}
        size={20}
        color={p.low ? t.bad : t.accent}
      />
      <Text style={{ color: t.text, fontSize: 16, lineHeight: 22, fontWeight: '700', flex: 1 }}>
        {p.text}
      </Text>
    </View>
  );
  const input = [s.input, { color: t.text, backgroundColor: t.bg, borderColor: t.border }];
  const stale = left.counted && left.daysSinceCount >= 7;

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <TitleBar
              title="Your group"
              icon={<IconTile name="account-group" {...HUES.violet} size={44} />}
            />
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: t.bg }}
        contentContainerStyle={s.wrap}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={{ color: t.text, fontSize: 16, lineHeight: 23 }}>
          Count what you have, so you can decide early. Everything here stays on this phone.
        </Text>

        <Card style={s.card}>
          <Head icon="account-group" hue="violet" title="People" sub="Count heads every day." />
          <Stepper k="people" unit={g.people === 1 ? 'person' : 'people'} />
        </Card>

        <Card style={s.card}>
          <Head
            icon="water"
            hue="blue"
            title="Water"
            sub={`Safe water on hand. Each person needs about ${left.waterPerDay} gallon${left.waterPerDay === 1 ? '' : 's'} a day.`}
          />
          <Stepper k="water" big={10} unit="gallons" />
          {g.water > 0 && (
            <Result
              low={left.waterDays < 3}
              text={
                left.waterDays === 0
                  ? 'By this count the water is gone. Find and clean more today.'
                  : `About ${days(left.waterDays)} of water left for ${g.people}.${left.waterDays < 3 ? ' Find more now.' : ''}`
              }
            />
          )}
          <View style={s.links}>
            <Link label="Find water" href="/help/find-water" />
            <Link label="Make water safe" href="/help/water" />
          </View>
        </Card>

        <Card style={s.card}>
          <Head
            icon="scale-balance"
            hue="sun"
            title="Food"
            sub="Days of food for one adult. One pound of dry rice, beans, flour or pasta is about one day. So is 2,000 calories on the labels."
          />
          <Stepper k="food" big={10} unit="days for one adult" />
          {g.food > 0 && (
            <Result
              low={left.foodDays < 14}
              text={
                left.foodDays === 0
                  ? 'By this count the food is gone. Count again, and look for food today.'
                  : `About ${days(left.foodDays)} of full meals left for ${g.people}, or ${days(left.foodDaysHalf)} on half shares.`
              }
            />
          )}
          {left.counted && (
            <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
              {left.daysSinceCount === 0
                ? 'Counted today.'
                : `Counted ${days(left.daysSinceCount)} ago. The days left already allow for that.`}
              {stale ? ' Time to count again.' : ''}
            </Text>
          )}
          <View style={s.links}>
            <Link label="Ration your food" href="/help/ration" />
            <Link label="Keep food without a fridge" href="/help/keep-food" />
          </View>
        </Card>

        <Card style={s.card}>
          <Head
            icon="bed"
            hue="red"
            title="Sick or hurt"
            sub={g.sick.length ? `${g.sick.length} on the list.` : 'Nobody on the list.'}
          />
          {g.sick.map((p) => (
            <View key={p.id} style={[s.row, { borderTopColor: t.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>{p.name}</Text>
                <Text style={{ color: t.text, fontSize: 15, lineHeight: 21 }}>
                  {p.note ? `${p.note}. ` : ''}
                  {daysSince(p.since) === 0 ? 'Since today.' : `For ${days(daysSince(p.since))}.`}
                </Text>
              </View>
              <Pressable
                onPress={() => set({ sick: g.sick.filter((x) => x.id !== p.id) })}
                accessibilityLabel={`${p.name} is better`}
                style={({ pressed }) => [
                  s.better,
                  { borderColor: t.accent },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={{ color: t.accent, fontSize: 15, fontWeight: '800' }}>Better</Text>
              </Pressable>
            </View>
          ))}
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={t.muted}
            style={input}
            accessibilityLabel="Name of the sick person"
          />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What is wrong (fever, cut leg…)"
            placeholderTextColor={t.muted}
            style={input}
            accessibilityLabel="What is wrong"
            onSubmitEditing={addSick}
          />
          <Pressable
            onPress={addSick}
            disabled={!name.trim()}
            accessibilityRole="button"
            style={({ pressed }) => [
              s.add,
              { backgroundColor: t.accent, opacity: !name.trim() ? 0.4 : pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="add" size={22} color={t.accentText} />
            <Text style={{ color: t.accentText, fontSize: 17, fontWeight: '800' }}>
              Add to the list
            </Text>
          </Pressable>
          <View style={s.links}>
            <Link label="Care for someone sick" href="/help/sick" />
          </View>
        </Card>

        <Card style={s.card}>
          <Head
            icon="clipboard-list-outline"
            hue="teal"
            title="Who does what"
            sub="Write a name by each job. Swap the hard ones around."
          />
          {JOBS.map((j) => (
            <View key={j.id} style={s.jobRow}>
              <IconTile name={j.icon as IconName} {...hues.teal} size={36} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>{j.title}</Text>
                <TextInput
                  value={g.jobs[j.id] ?? ''}
                  onChangeText={(v) => set({ jobs: { ...g.jobs, [j.id]: v } })}
                  placeholder="Who?"
                  placeholderTextColor={t.muted}
                  style={input}
                  accessibilityLabel={`Who does ${j.title}`}
                />
              </View>
            </View>
          ))}
          <View style={s.links}>
            <Link label="Night watch and group rules" href="/help/watch" />
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 8, gap: 12, paddingBottom: 60 },
  card: { gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  step: {
    minWidth: 52,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 16, alignItems: 'center' },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  better: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    fontSize: 17,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 18,
  },
  jobRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
});
