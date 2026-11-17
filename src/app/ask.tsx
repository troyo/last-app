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
import { rememberSearch } from '../lib/search';
import { useTheme } from '../lib/theme';

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

  const send = async (text: string) => {
    const question = text.trim();
    if (question.length < 2) return;
    const id = nextId.current++;
    setDraft('');
    setTurns((all) => [...all, { id, question, answers: null }]);
    rememberSearch(question);
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50);
    const answers = await ask(question);
    setTurns((all) => all.map((turn) => (turn.id === id ? { ...turn, answers } : turn)));
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 80);
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
            <View style={[s.bubble, s.them, { backgroundColor: t.card }]}>
              <Text style={[s.body, { color: t.text }]}>
                Hi. Ask me anything in your own words. I’ll find the answer in the guides saved on
                this phone, so it works with no signal.
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
          <View key={turn.id} style={{ gap: 10 }}>
            <View style={[s.bubble, s.me, { backgroundColor: t.accent }]}>
              <Text style={[s.body, { color: t.accentText }]}>{turn.question}</Text>
            </View>

            {turn.answers === null ? (
              <View style={[s.bubble, s.them, s.thinking, { backgroundColor: t.card }]}>
                <ActivityIndicator color={t.accent} />
                <Text style={[s.body, { color: t.text }]}>Looking through your guides…</Text>
              </View>
            ) : turn.answers.length === 0 ? (
              <View style={[s.bubble, s.them, { backgroundColor: t.card, gap: 10 }]}>
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
                  <View key={a.key} style={[s.bubble, s.them, { backgroundColor: t.card, gap: 8 }]}>
                    {i === 0 && turn.answers!.length > 1 && (
                      <Text style={[s.best, { color: t.good }]}>Best match</Text>
                    )}
                    <Text
                      style={{ color: t.text, fontSize: 18, fontWeight: '800', lineHeight: 23 }}
                    >
                      {a.title}
                    </Text>
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
                    {!!a.text && <Text style={[s.body, { color: t.text }]}>{a.text}</Text>}
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
                    <Text style={{ color: t.muted, fontSize: 15 }} numberOfLines={1}>
                      From: {a.from}
                    </Text>
                  </View>
                ))}
                <Pressable
                  onPress={() => router.push({ pathname: '/search', params: { q: turn.question } })}
                  style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
                >
                  <Text style={[s.link, { color: t.accent }]}>See every guide about this</Text>
                </Pressable>
              </>
            )}
          </View>
        ))}
      </ScrollView>

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
          autoFocus
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
      <Text style={[s.fine, { color: t.muted, backgroundColor: t.card }]}>
        Answers are copied from your guides, not written by AI. General information only.
      </Text>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 18, paddingBottom: 24 },
  bubble: { borderRadius: 22, padding: 14, maxWidth: '92%' },
  me: { alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  them: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    shadowColor: '#17352C',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { fontSize: 17, lineHeight: 25 },
  label: { fontSize: 16, fontWeight: '800', marginTop: 6 },
  idea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
  },
  best: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
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
    height: 44,
    borderRadius: 14,
    marginTop: 4,
  },
  link: { fontSize: 16, fontWeight: '800' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
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
  fine: { fontSize: 13, textAlign: 'center', paddingHorizontal: 16, paddingBottom: 6 },
});
