import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../components/ui';
import { Answer, ask, ASK_IDEAS } from '../lib/ask';
import { useTheme } from '../lib/theme';

// One or two sentences per paragraph, so a passage never reads as a wall of text.
function sentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [text];
  const out: string[] = [];
  for (const part of parts) {
    const last = out[out.length - 1];
    if (last && last.length + part.length < 150) out[out.length - 1] = last + part;
    else out.push(part);
  }
  return out.map((line) => line.trim()).filter(Boolean);
}

type Turn = { id: number; question: string; answers: Answer[] | null };

// A chat that works with no internet. You ask in plain words; it replies with
// the matching steps and passages from the guides saved on this phone.
export default function Ask() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const nextId = useRef(1);
  const tops = useRef<Record<number, number>>({}); // where each question sits in the chat

  const send = async (text: string) => {
    const question = text.trim();
    if (question.length < 2) return;
    const id = nextId.current++;
    setDraft('');
    setTurns((all) => [...all, { id, question, answers: null }]);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
    const answers = await ask(question);
    setTurns((all) => all.map((turn) => (turn.id === id ? { ...turn, answers } : turn)));
    // Show the question and the start of its answer, not the bottom of a long one.
    setTimeout(
      () =>
        scroller.current?.scrollTo({ y: Math.max(0, (tops.current[id] ?? 0) - 8), animated: true }),
      80,
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 44}
    >
      <Stack.Screen options={{ title: 'Ask anything' }} />
      <ScrollView
        ref={scroller}
        contentContainerStyle={s.wrap}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {turns.length === 0 && (
          <View style={{ gap: 12 }}>
            <View style={s.hello}>
              <View style={[s.helloIcon, { backgroundColor: t.soft }]}>
                <Ionicons name="chatbubbles" size={30} color={t.accent} />
              </View>
              <Text style={[s.helloTitle, { color: t.text }]}>Ask in your own words</Text>
              <Text style={[s.body, { color: t.text, textAlign: 'center' }]}>
                I’ll find the answer in the guides saved on this phone, so it works with no signal.
              </Text>
            </View>
            <Text style={[s.label, { color: t.text }]}>Try one of these</Text>
            {ASK_IDEAS.map((idea) => (
              <Pressable
                key={idea}
                onPress={() => send(idea)}
                style={({ pressed }) => [
                  s.idea,
                  { backgroundColor: t.card, borderColor: t.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={{ color: t.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
                  {idea}
                </Text>
                <Ionicons name="arrow-up-circle" size={24} color={t.accent} />
              </Pressable>
            ))}
          </View>
        )}

        {turns.map((turn) => (
          <View
            key={turn.id}
            style={{ gap: 14 }}
            onLayout={(e) => (tops.current[turn.id] = e.nativeEvent.layout.y)}
          >
            <View style={[s.bubble, s.me, { backgroundColor: t.accent }]}>
              <Text style={[s.body, { color: t.accentText }]}>{turn.question}</Text>
            </View>

            {turn.answers === null ? (
              <View style={[s.card, s.thinking, { backgroundColor: t.card }]}>
                <ActivityIndicator color={t.accent} />
                <Text style={[s.body, { color: t.text }]}>Looking through your guides…</Text>
              </View>
            ) : turn.answers.length === 0 ? (
              <View style={[s.card, { backgroundColor: t.card }]}>
                <Text style={[s.body, { color: t.text }]}>
                  I couldn’t find that in your saved guides. Try fewer, simpler words, like “burn”
                  or “clean water”. A bigger pack also gives me more to look through.
                </Text>
                <Pressable
                  onPress={() => router.push({ pathname: '/search', params: { q: turn.question } })}
                >
                  <Text style={[s.link, { color: t.accent }]}>Search all guides instead</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {turn.answers.map((a, i) => (
                  <View key={a.key} style={[s.card, { backgroundColor: t.card }]}>
                    <View style={s.kicker}>
                      {i === 0 && turn.answers!.length > 1 && (
                        <View style={[s.pill, { backgroundColor: t.good }]}>
                          <Text style={[s.pillText, { color: t.accentText }]}>Best match</Text>
                        </View>
                      )}
                      <View style={[s.pill, { backgroundColor: t.soft, flexShrink: 1 }]}>
                        <Text style={[s.pillText, { color: t.accent }]} numberOfLines={1}>
                          {a.from}
                        </Text>
                      </View>
                    </View>
                    <Text style={[s.title, { color: t.text }]}>{a.title}</Text>
                    {a.steps?.map((step, n) => (
                      <View key={n} style={s.step}>
                        <View style={[s.num, { backgroundColor: t.accent }]}>
                          <Text style={{ color: t.accentText, fontSize: 15, fontWeight: '800' }}>
                            {n + 1}
                          </Text>
                        </View>
                        <Text style={[s.body, { color: t.text, flex: 1 }]}>{step}</Text>
                      </View>
                    ))}
                    {!!a.text &&
                      sentences(a.text).map((line, n) => (
                        <Text key={n} style={[s.body, { color: t.text }]}>
                          {line}
                        </Text>
                      ))}
                    <Pressable
                      onPress={() => router.push(a.href as never)}
                      hitSlop={6}
                      style={[s.source, { backgroundColor: t.soft }]}
                    >
                      <Ionicons name="book" size={18} color={t.accent} />
                      <Text style={[s.link, { color: t.accent, flex: 1 }]} numberOfLines={1}>
                        {a.linkLabel}
                      </Text>
                      <Ionicons name="chevron-forward" size={18} color={t.accent} />
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() => router.push({ pathname: '/search', params: { q: turn.question } })}
                  style={[s.more, { borderColor: t.accent }]}
                >
                  <Ionicons name="search" size={18} color={t.accent} />
                  <Text style={[s.link, { color: t.accent }]}>See every guide about this</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      <Text style={[s.fine, { color: t.text, backgroundColor: t.card, borderTopColor: t.border }]}>
        From your guides, not AI. General information only.
      </Text>
      <View
        style={[
          s.bar,
          {
            backgroundColor: t.card,
            borderTopColor: t.border,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question"
          placeholderTextColor={t.muted}
          style={[s.input, { color: t.text, backgroundColor: t.bg }]}
          returnKeyType="send"
          onSubmitEditing={() => send(draft)}
          blurOnSubmit={false}
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={draft.trim().length < 2}
          accessibilityLabel="Send"
          style={[
            s.send,
            { backgroundColor: t.accent, opacity: draft.trim().length < 2 ? 0.4 : 1 },
          ]}
        >
          <Ionicons name="arrow-up" size={22} color={t.accentText} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 22, paddingBottom: 28 },
  hello: { alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 8, paddingHorizontal: 8 },
  helloIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  helloTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  card: {
    alignSelf: 'stretch',
    borderRadius: 22,
    padding: 20,
    gap: 14,
    shadowColor: '#17352C',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 10, height: 26, borderRadius: 13, justifyContent: 'center' },
  pillText: { fontSize: 14, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 28 },
  more: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  bubble: { borderRadius: 22, paddingVertical: 12, paddingHorizontal: 16, maxWidth: '85%' },
  me: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { fontSize: 17, lineHeight: 26 },
  label: { fontSize: 16, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  idea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
  },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 16,
    marginTop: 2,
  },
  link: { fontSize: 16, fontWeight: '800' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 17,
    fontFamily: 'Nunito_400Regular',
  },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  fine: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
