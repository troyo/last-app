import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, IconName, IconTile, Text } from '../components/ui';
import { HAZARDS } from '../lib/hazards';
import { locate } from '../lib/locate';
import {
  Climate,
  climateFrom,
  CLIMATES,
  findState,
  getProfile,
  HazardId,
  HOMES,
  HomeType,
  likelyHazards,
  saveProfile,
  skipPlace,
  STATES,
  statesNear,
  Summer,
  SUMMERS,
  USState,
  Winter,
  WINTERS,
} from '../lib/place';
import { HUES, useTheme } from '../lib/theme';

type Step = 'where' | 'near' | 'states' | 'quiz' | 'risks' | 'home';

// "Make it fit where you live." Three ways in: let the phone find you, pick a
// state, or answer two questions about your weather. Then confirm what can
// happen there, and say who lives with you.
export default function Place() {
  const t = useTheme();
  const old = getProfile();
  const [step, setStep] = useState<Step>(old ? 'risks' : 'where');
  const [trail, setTrail] = useState<Step[]>([]);
  const [finding, setFinding] = useState(false);
  const [note, setNote] = useState('');
  const [near, setNear] = useState<USState[]>([]);

  const [place, setPlace] = useState(old?.place ?? '');
  const [state, setState] = useState<string | undefined>(old?.state);
  const [climate, setClimate] = useState<Climate>(old?.climate ?? 'mixed');
  const [hazards, setHazards] = useState<HazardId[]>(old?.hazards ?? []);
  const [winter, setWinter] = useState<Winter | null>(null);
  const [summer, setSummer] = useState<Summer | null>(null);
  const [home, setHome] = useState<HomeType>(old?.home ?? 'house');
  const [people, setPeople] = useState(old?.people ?? 2);
  const [pets, setPets] = useState(old?.pets ?? 0);

  const go = (next: Step) => {
    setTrail((tr) => [...tr, step]);
    setStep(next);
  };
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const back = () => {
    if (trail.length === 0) return leave();
    setStep(trail[trail.length - 1]);
    setTrail((tr) => tr.slice(0, -1));
  };

  const findMe = async () => {
    setFinding(true);
    setNote('');
    const fix = await locate();
    setFinding(false);
    if (!fix) {
      setNote('Couldn’t get your location. No problem, pick your state below instead.');
      return;
    }
    const found = statesNear(fix.lat, fix.lon);
    if (found.length === 0) {
      setNote('Looks like you’re outside the US. Two quick questions will do it.');
      go('quiz');
      return;
    }
    setNear(found);
    go('near');
  };

  const chooseState = (st: USState) => {
    setPlace(st.name);
    setState(st.code);
    setClimate(st.climate);
    setHazards(st.hazards);
    go('risks');
  };

  const finishQuiz = () => {
    if (!winter || !summer) return;
    const c = climateFrom(winter, summer);
    setPlace('your area');
    setState(undefined);
    setClimate(c);
    setHazards(likelyHazards(c));
    go('risks');
  };

  const flip = (id: HazardId) =>
    setHazards((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));

  const done = () => {
    saveProfile({ place, state, climate, hazards, home, people, pets });
    leave();
  };

  const Option = (p: {
    icon: IconName;
    title: string;
    sub?: string;
    on?: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={p.onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!p.on }}
      style={({ pressed }) => [
        s.option,
        { backgroundColor: t.card, borderColor: p.on ? t.accent : 'transparent' },
        pressed && { opacity: 0.85 },
      ]}
    >
      <IconTile name={p.icon} {...(p.on ? HUES.green : HUES.teal)} size={42} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>{p.title}</Text>
        {!!p.sub && <Text style={{ color: t.muted, fontSize: 14, lineHeight: 19 }}>{p.sub}</Text>}
      </View>
      <Ionicons
        name={
          p.on === undefined ? 'chevron-forward' : p.on ? 'checkmark-circle' : 'ellipse-outline'
        }
        size={p.on === undefined ? 18 : 24}
        color={p.on ? t.accent : t.muted}
      />
    </Pressable>
  );

  const Chips = <T extends string>(p: {
    options: Record<T, string>;
    value: T | null;
    onChange: (v: T) => void;
  }) => (
    <View style={{ gap: 8 }}>
      {(Object.keys(p.options) as T[]).map((k) => {
        const on = p.value === k;
        return (
          <Pressable
            key={k}
            onPress={() => p.onChange(k)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[s.chip, { backgroundColor: on ? t.accent : t.card }]}
          >
            <Text style={{ color: on ? t.accentText : t.text, fontSize: 16, fontWeight: '700' }}>
              {p.options[k]}
            </Text>
            {on && <Ionicons name="checkmark" size={20} color={t.accentText} />}
          </Pressable>
        );
      })}
    </View>
  );

  const Stepper = (p: { label: string; value: number; min: number; set: (n: number) => void }) => (
    <View style={s.stepRow}>
      <Text style={{ color: t.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{p.label}</Text>
      <Pressable
        onPress={() => p.set(Math.max(p.min, p.value - 1))}
        accessibilityLabel={`Fewer ${p.label}`}
        hitSlop={6}
        style={[s.round, { backgroundColor: t.soft }]}
      >
        <Ionicons name="remove" size={22} color={t.accent} />
      </Pressable>
      <Text style={[s.count, { color: t.text }]}>{p.value}</Text>
      <Pressable
        onPress={() => p.set(Math.min(20, p.value + 1))}
        accessibilityLabel={`More ${p.label}`}
        hitSlop={6}
        style={[s.round, { backgroundColor: t.soft }]}
      >
        <Ionicons name="add" size={22} color={t.accent} />
      </Pressable>
    </View>
  );

  const stepNo = step === 'home' ? 3 : step === 'risks' ? 2 : 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={s.top}>
        <Pressable onPress={back} hitSlop={10} accessibilityLabel="Back" style={s.backBtn}>
          <Ionicons name="chevron-back" size={24} color={t.accent} />
        </Pressable>
        <View style={s.dots}>
          {[1, 2, 3].map((n) => (
            <View
              key={n}
              style={[
                s.dot,
                {
                  backgroundColor: n <= stepNo ? t.accent : t.border,
                  width: n === stepNo ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
        {old ? (
          <View style={s.backBtn} />
        ) : (
          <Pressable
            onPress={() => {
              skipPlace();
              leave();
            }}
            hitSlop={10}
          >
            <Text style={{ color: t.muted, fontSize: 15, fontWeight: '600' }}>Later</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        {step === 'where' && (
          <>
            <Text style={[s.title, { color: t.text }]}>Where do you live?</Text>
            <Text style={[s.lead, { color: t.muted }]}>
              Getting ready in Florida is nothing like getting ready in Minnesota. Tell us roughly
              where you are and everything here will fit your home.
            </Text>
            {finding ? (
              <Card style={s.finding}>
                <ActivityIndicator color={t.accent} />
                <Text style={{ color: t.text, fontSize: 16, flex: 1 }}>
                  Finding you. This can take a moment…
                </Text>
              </Card>
            ) : (
              <Option
                icon="crosshairs-gps"
                title="Find me"
                sub="Uses your phone’s GPS. Works with no signal."
                onPress={findMe}
              />
            )}
            <Option
              icon="map-marker"
              title="Pick my state"
              sub="For anywhere in the United States"
              onPress={() => go('states')}
            />
            <Option
              icon="earth"
              title="Somewhere else, or not sure"
              sub="Answer two quick questions about your weather"
              onPress={() => go('quiz')}
            />
            {!!note && <Text style={{ color: t.warn, fontSize: 15, lineHeight: 21 }}>{note}</Text>}
            <Text style={{ color: t.muted, fontSize: 13, lineHeight: 19 }}>
              Your answers stay on this phone. Nothing is sent anywhere.
            </Text>
          </>
        )}

        {step === 'near' && (
          <>
            <Text style={[s.title, { color: t.text }]}>Found you. Which one is it?</Text>
            <Text style={[s.lead, { color: t.muted }]}>
              You’re in or close to these. Tap the one you live in.
            </Text>
            {near.map((st) => (
              <Option
                key={st.code}
                icon="map-marker"
                title={st.name}
                sub={CLIMATES[st.climate].title}
                onPress={() => chooseState(st)}
              />
            ))}
            <Button label="None of these" kind="quiet" onPress={() => go('states')} />
          </>
        )}

        {step === 'states' && (
          <>
            <Text style={[s.title, { color: t.text }]}>Pick your state</Text>
            <Card style={{ paddingVertical: 4 }}>
              {STATES.map((st, i) => (
                <Pressable
                  key={st.code}
                  onPress={() => chooseState(st)}
                  style={[
                    s.stateRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
                  ]}
                >
                  <Text style={{ color: t.text, fontSize: 16, fontWeight: '600', flex: 1 }}>
                    {st.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={t.muted} />
                </Pressable>
              ))}
            </Card>
          </>
        )}

        {step === 'quiz' && (
          <>
            <Text style={[s.title, { color: t.text }]}>Let’s figure it out</Text>
            {!!note && <Text style={[s.lead, { color: t.muted }]}>{note}</Text>}
            <Text style={[s.q, { color: t.text }]}>What are your winters like?</Text>
            <Chips options={WINTERS} value={winter} onChange={setWinter} />
            <Text style={[s.q, { color: t.text }]}>And your summers?</Text>
            <Chips options={SUMMERS} value={summer} onChange={setSummer} />
          </>
        )}

        {step === 'risks' && (
          <>
            <Text style={[s.title, { color: t.text }]}>
              {state ? `Getting ready in ${place}` : 'Here’s what we worked out'}
            </Text>
            <Card style={s.climate}>
              <IconTile name={CLIMATES[climate].icon as IconName} {...HUES.sun} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>
                  {CLIMATES[climate].title}
                </Text>
                <Text style={{ color: t.muted, fontSize: 14, lineHeight: 19 }}>
                  {CLIMATES[climate].blurb}
                </Text>
              </View>
            </Card>
            <Text style={[s.q, { color: t.text }]}>What can happen where you live?</Text>
            <Text style={{ color: t.muted, fontSize: 14, lineHeight: 20, marginTop: -6 }}>
              We ticked the likely ones{state ? ` for ${findState(state)?.name}` : ''}. Add or
              remove any. You know your area best.
            </Text>
            {HAZARDS.map((h) => (
              <Option
                key={h.id}
                icon={h.icon as IconName}
                title={h.title}
                on={hazards.includes(h.id)}
                onPress={() => flip(h.id)}
              />
            ))}
            <Button
              label="Start over with a different place"
              kind="quiet"
              onPress={() => {
                setTrail([]);
                setStep('where');
              }}
            />
          </>
        )}

        {step === 'home' && (
          <>
            <Text style={[s.title, { color: t.text }]}>Who are we getting ready?</Text>
            <Text style={[s.lead, { color: t.muted }]}>
              So the lists can tell you real amounts, like how much water to store.
            </Text>
            <Card style={{ gap: 14 }}>
              <Stepper label="People" value={people} min={1} set={setPeople} />
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.border }} />
              <Stepper label="Pets" value={pets} min={0} set={setPets} />
            </Card>
            <Text style={[s.q, { color: t.text }]}>What kind of home?</Text>
            {(Object.keys(HOMES) as HomeType[]).map((k) => (
              <Option
                key={k}
                icon={HOMES[k].icon as IconName}
                title={HOMES[k].title}
                sub={HOMES[k].blurb}
                on={home === k}
                onPress={() => setHome(k)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {(step === 'quiz' || step === 'risks' || step === 'home') && (
        <View style={[s.footer, { borderTopColor: t.border }]}>
          {step === 'quiz' && (
            <Button label="Next" onPress={finishQuiz} disabled={!winter || !summer} />
          )}
          {step === 'risks' && <Button label="Looks right" onPress={() => go('home')} />}
          {step === 'home' && <Button label="Make it fit my home" onPress={done} />}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  top: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  wrap: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 28, gap: 12 },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  lead: { fontSize: 16, lineHeight: 23, marginBottom: 4 },
  q: { fontSize: 18, fontWeight: '800', marginTop: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#17352C',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  finding: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    minHeight: 52,
    borderRadius: 16,
  },
  climate: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stateRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontSize: 20, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
