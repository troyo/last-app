import { Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { HtmlView } from '../../components/HtmlView';
import { findItem, Item } from '../../lib/catalog';
import { fileFor } from '../../lib/library';
import { useTheme } from '../../lib/theme';

export default function ItemScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = findItem(id);

  if (!item || !fileFor(item).exists) {
    return (
      <View style={[s.pad, { backgroundColor: t.bg, flex: 1 }]}>
        <Text style={{ color: t.text }}>This isn't on your phone yet.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: item.title }} />
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
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fileFor(item).text().then(setHtml);
  }, [item]);

  if (html === null) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  // Our own simple, readable styling. Nothing is loaded from the internet.
  const page = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font:18px/1.55 -apple-system,Roboto,sans-serif;margin:0;padding:16px 18px 48px;
       background:${t.bg};color:${t.text};}
  a{color:${t.accent};text-decoration:none;pointer-events:none}
  h1,h2,h3{line-height:1.25} table{border-collapse:collapse;font-size:15px;display:block;overflow-x:auto}
  td,th{border:1px solid ${t.border};padding:4px 6px}
  .mw-ref,.reference,.mw-editsection,.navbox,.hatnote,.ambox,.metadata,.reflist,.mw-references-wrap{display:none}
  .credit{color:${t.muted};font-size:13px;border-top:1px solid ${t.border};margin-top:32px;padding-top:12px}
</style></head><body><h1>${escapeHtml(item.title)}</h1>${html}
<p class="credit">Source: ${escapeHtml(item.source)} · ${escapeHtml(item.license)}.
Not medical advice. In an emergency, contact emergency services if you can.</p></body></html>`;

  return <HtmlView html={page} background={t.bg} dark={dark} />;
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

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );
}

const s = StyleSheet.create({
  pad: { padding: 16 },
  credit: { fontSize: 13, padding: 16 },
  btn: { padding: 14, borderRadius: 10, alignItems: 'center' },
});
