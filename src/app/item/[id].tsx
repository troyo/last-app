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
import { findItem, getCatalog, Item } from '../../lib/catalog';
import { cardForGuide, isEasy, otherVersion, plainTitle } from '../../lib/guide-rows';
import { fileFor, isDownloaded } from '../../lib/library';
import { buildReaderPage } from '../../lib/reader-page';
import { getTextSize, stepTextSize, TEXT_SIZE_NAMES, TEXT_SIZES } from '../../lib/text-size';
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
  const [typing, setTyping] = useState(false);
  const [sizeNote, setSizeNote] = useState<string | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<{ count: number; at: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fileFor(item).text().then(setHtml);
  }, [item]);

  // Shortcuts under the title: the steps to follow right now, and the other version of this guide.
  const links = useMemo(() => {
    const out: { href: string; label: string; sub?: string; now?: boolean }[] = [];
    const card = cardForGuide(item);
    if (card)
      out.push({
        href: `lastapp://help/${card.id}`,
        label: card.group ? `Step by step: ${card.title}` : `Happening now? ${card.title}`,
        sub: 'Short steps you can follow right away',
        now: true,
      });
    const other = otherVersion(item, getCatalog().items);
    if (other && isDownloaded(other))
      out.push({
        href: `lastapp://item/${other.id}`,
        label: isEasy(other) ? 'Read the short version' : 'Read the full guide',
        sub: isEasy(other) ? 'The same thing in simple words' : 'Longer, with more detail',
      });
    return out;
  }, [item]);

  // Our own simple, readable page. Nothing is loaded from the internet.
  const page = useMemo(
    () =>
      html === null
        ? null
        : buildReaderPage({
            title: plainTitle(item),
            html,
            links,
            source: item.source,
            license: item.license,
            px: TEXT_SIZES[size],
            colors: t,
            isSaved: (other) => {
              const target = findItem(other);
              // A long guide links to hundreds of others: look them up in memory, not on disk.
              return !!target && isDownloaded(target);
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
      // The header is part of this screen, so the keyboard needs no extra offset.
      keyboardVerticalOffset={0}
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
              {/* A− and A+ make the words smaller or bigger. The choice is remembered. */}
              {([-1, 1] as const).map((by) => {
                const end = by < 0 ? size === 0 : size === TEXT_SIZES.length - 1;
                return (
                  <Pressable
                    key={by}
                    disabled={end}
                    onPress={() => {
                      stopFinding();
                      const next = stepTextSize(by);
                      setSize(next);
                      setSizeNote(TEXT_SIZE_NAMES[next]);
                      if (noteTimer.current) clearTimeout(noteTimer.current);
                      noteTimer.current = setTimeout(() => setSizeNote(null), 1600);
                    }}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={by < 0 ? 'Smaller text' : 'Bigger text'}
                    style={{ opacity: end ? 0.35 : 1 }}
                  >
                    <Text
                      maxFontSizeMultiplier={1.2}
                      style={{ color: t.accent, fontSize: by < 0 ? 17 : 22, fontWeight: '800' }}
                    >
                      {by < 0 ? 'A−' : 'A+'}
                    </Text>
                  </Pressable>
                );
              })}
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
        onOpenHelp={(card) => router.push(`/help/${card}`)}
      />
      {!ready && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Opening />
        </View>
      )}
      {sizeNote && (
        <View style={s.noteWrap} pointerEvents="none">
          <View style={[s.note, { backgroundColor: t.text }]}>
            <Text style={{ color: t.bg, fontSize: 16, fontWeight: '700' }}>{sizeNote}</Text>
          </View>
        </View>
      )}
      {finding && (
        <View
          style={[
            s.findBar,
            {
              backgroundColor: t.card,
              borderTopColor: t.border,
              // With the keyboard up there is no home bar to clear.
              paddingBottom: typing ? 10 : Math.max(insets.bottom, 10),
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
              onFocus={() => setTyping(true)}
              onBlur={() => setTyping(false)}
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
  noteWrap: { position: 'absolute', left: 0, right: 0, top: 16, alignItems: 'center' },
  note: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
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
  },
  findBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
