import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/ui';
import { HtmlView, HtmlViewHandle } from '../../components/HtmlView';
import { findItem, Item } from '../../lib/catalog';
import { fileFor } from '../../lib/library';
import { buildReaderPage } from '../../lib/reader-page';
import { getTextSize, nextTextSize, TEXT_SIZES } from '../../lib/text-size';
import { useTheme } from '../../lib/theme';

export default function ItemScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = findItem(id);

  if (!item || !fileFor(item).exists) {
    return (
      <View style={[s.pad, { backgroundColor: t.bg, flex: 1 }]}>
        <Text style={{ color: t.text, fontSize: 17 }}>
          This guide isn’t saved on your phone yet. You can get it from My packs.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      {item.type === 'article' && <Article item={item} />}
      {item.type === 'video' && <Video item={item} />}
      {item.type === 'pdf' && <Pdf item={item} />}
    </>
  );
}

function Credit({ item }: { item: Item }) {
  const t = useTheme();
  return (
    <Text style={[s.credit, { color: t.muted }]}>
      Source: {item.source} · {item.license}
    </Text>
  );
}

function Article({ item }: { item: Item }) {
  const t = useTheme();
  const dark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();
  const [html, setHtml] = useState<string | null>(null);
  const [size, setSize] = useState(getTextSize);
  const view = useRef<HtmlViewHandle>(null);
  // "Find in this guide"
  const [finding, setFinding] = useState(false);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<{ count: number; at: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fileFor(item).text().then(setHtml);
  }, [item]);

  // Our own simple, readable page. Nothing is loaded from the internet.
  const page = useMemo(
    () =>
      html === null
        ? null
        : buildReaderPage({
            title: item.title,
            html,
            source: item.source,
            license: item.license,
            px: TEXT_SIZES[size],
            colors: t,
            isSaved: (other) => {
              const target = findItem(other);
              return !!target && fileFor(target).exists;
            },
          }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [html, size, dark, item],
  );

  // Search as you type, after a short pause so long guides stay smooth.
  useEffect(() => {
    if (!finding) return;
    const id = setTimeout(() => view.current?.send({ type: 'find', query }), 250);
    return () => clearTimeout(id);
  }, [query, finding]);

  const stopFinding = () => {
    setFinding(false);
    setQuery('');
    setFound(null);
    view.current?.send({ type: 'clear' });
  };

  if (page === null) return <Opening />;
  const typed = query.trim().length > 1;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 44}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, paddingRight: 4 }}>
              <Pressable
                onPress={() => (finding ? stopFinding() : setFinding(true))}
                hitSlop={12}
                accessibilityLabel="Find in this guide"
              >
                <Ionicons name="search" size={24} color={t.accent} />
              </Pressable>
              {/* Tap "Aa" to make the words bigger. The choice is remembered. */}
              <Pressable
                onPress={() => {
                  stopFinding();
                  setSize(nextTextSize());
                }}
                hitSlop={12}
                accessibilityLabel="Change text size"
              >
                <Text style={{ color: t.accent, fontSize: 20, fontWeight: '800' }}>Aa</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <HtmlView
        ref={view}
        html={page}
        background={t.bg}
        dark={dark}
        onReady={() => setReady(true)}
        onMessage={(m) => m.type === 'find' && setFound({ count: m.count, at: m.at })}
        onOpenItem={(id) => {
          const target = findItem(id);
          if (target && fileFor(target).exists) router.push(`/item/${id}`);
        }}
      />
      {!ready && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Opening />
        </View>
      )}
      {finding && (
        <View
          style={[
            s.findBar,
            {
              backgroundColor: t.card,
              borderTopColor: t.border,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          <View style={[s.findBox, { backgroundColor: t.bg }]}>
            <Ionicons name="search" size={18} color={t.text} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find in this guide"
              placeholderTextColor={t.muted}
              autoFocus
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => view.current?.send({ type: 'next' })}
              blurOnSubmit={false}
              style={[s.findInput, { color: t.text }]}
            />
          </View>
          {typed && found && (
            <Text numberOfLines={1} style={{ color: t.text, fontSize: 15, fontWeight: '800' }}>
              {found.count === 0 ? 'None' : `${found.at} of ${found.count}`}
            </Text>
          )}
          <Pressable
            onPress={() => view.current?.send({ type: 'prev' })}
            disabled={!found?.count}
            hitSlop={6}
            accessibilityLabel="Previous match"
            style={[s.findBtn, { backgroundColor: t.soft, opacity: found?.count ? 1 : 0.4 }]}
          >
            <Ionicons name="chevron-up" size={22} color={t.accent} />
          </Pressable>
          <Pressable
            onPress={() => view.current?.send({ type: 'next' })}
            disabled={!found?.count}
            hitSlop={6}
            accessibilityLabel="Next match"
            style={[s.findBtn, { backgroundColor: t.soft, opacity: found?.count ? 1 : 0.4 }]}
          >
            <Ionicons name="chevron-down" size={22} color={t.accent} />
          </Pressable>
          <Pressable onPress={stopFinding} hitSlop={8} accessibilityRole="button">
            <Text style={{ color: t.accent, fontSize: 16, fontWeight: '800' }}>Done</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Shown for the moment a long guide takes to open, so the screen is never blank.
function Opening() {
  const t = useTheme();
  return (
    <View style={[s.opening, { backgroundColor: t.bg }]}>
      <ActivityIndicator size="large" color={t.accent} />
      <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>Opening the guide…</Text>
    </View>
  );
}

function Video({ item }: { item: Item }) {
  const t = useTheme();
  const player = useVideoPlayer(fileFor(item).uri);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <VideoView player={player} style={{ width: '100%', aspectRatio: 16 / 9 }} nativeControls />
      <Credit item={item} />
    </View>
  );
}

function Pdf({ item }: { item: Item }) {
  const t = useTheme();
  // Hands the PDF to the phone's built-in viewer (Quick Look on iPhone,
  // the default PDF app on Android). Works offline.
  const open = () =>
    fileFor(item)
      .preview({ title: item.title })
      .catch(() => {});
  useEffect(() => {
    open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={[s.pad, { flex: 1, backgroundColor: t.bg, gap: 12 }]}>
      <Pressable onPress={open} style={[s.btn, { backgroundColor: t.accent }]}>
        <Text style={{ color: t.accentText, fontWeight: '700', fontSize: 16 }}>Open PDF</Text>
      </Pressable>
      <Credit item={item} />
    </View>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16 },
  credit: { fontSize: 15, padding: 16 },
  opening: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  btn: { padding: 15, borderRadius: 16, alignItems: 'center' },
  findBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  findBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 14,
  },
  findInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    paddingVertical: 0,
    fontFamily: 'Nunito_400Regular',
  },
  findBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
