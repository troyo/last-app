import { router, Stack, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Text } from "../../components/ui";
import { HtmlView } from "../../components/HtmlView";
import { findItem, Item } from "../../lib/catalog";
import { fileFor } from "../../lib/library";
import { getTextSize, nextTextSize, TEXT_SIZES } from "../../lib/text-size";
import { useTheme } from "../../lib/theme";

export default function ItemScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = findItem(id);

  if (!item || !fileFor(item).exists) {
    return (
      <View style={[s.pad, { backgroundColor: t.bg, flex: 1 }]}>
        <Text style={{ color: t.text, fontSize: 17 }}>
          This guide isn’t saved on your phone yet. You can get it from My
          packs.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "" }} />
      {item.type === "article" && <Article item={item} />}
      {item.type === "video" && <Video item={item} />}
      {item.type === "pdf" && <Pdf item={item} />}
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
  const dark = useColorScheme() === "dark";
  const [html, setHtml] = useState<string | null>(null);
  const [size, setSize] = useState(getTextSize);

  useEffect(() => {
    fileFor(item).text().then(setHtml);
  }, [item]);

  if (html === null) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  // Our own simple, readable styling. Nothing is loaded from the internet.
  // Rounded system font, generous spacing, and encyclopedia clutter hidden.
  const px = TEXT_SIZES[size];
  const page = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">
<style>
  body{font:${px}px/1.65 ui-rounded,-apple-system,Roboto,sans-serif;margin:0;padding:4px 22px 64px;
       background:${t.bg};color:${t.text};-webkit-text-size-adjust:100%;word-wrap:break-word}
  h1{font-size:1.6em;line-height:1.2;margin:.4em 0 .5em;font-weight:800}
  h2{font-size:1.25em;line-height:1.25;margin:1.8em 0 .5em;padding-top:1em;border-top:1px solid ${t.border};font-weight:800}
  h3,h4{font-size:1.08em;line-height:1.3;margin:1.4em 0 .4em;font-weight:700}
  p{margin:0 0 1em} ul,ol{padding-left:1.3em;margin:0 0 1em} li{margin:.35em 0}
  a{color:${t.accent};text-decoration:underline;text-underline-offset:3px}
  img{max-width:100%;height:auto;border-radius:12px;display:block;margin:0 auto}
  figure{margin:1.2em 0;padding:0} figcaption,.thumbcaption{font-size:.8em;line-height:1.4;color:${t.muted};margin-top:.5em;text-align:center}
  table{border-collapse:collapse;font-size:.85em;display:block;overflow-x:auto;margin:1em 0;max-width:100%}
  td,th{border:1px solid ${t.border};padding:6px 8px;text-align:left;vertical-align:top} th{background:${t.soft}}
  blockquote{margin:1em 0;padding:.6em 1em;background:${t.soft};border-radius:12px}
  dl{margin:0 0 1em} dd{margin-left:1em}
  .mw-ref,.reference,.mw-editsection,.navbox,.hatnote,.ambox,.metadata,.reflist,.mw-references-wrap,
  .infobox,.sidebar,.toc,.noprint,.shortdescription,.mw-empty-elt,.mw-jump-link,.portal,.portalbox,
  .sistersitebox,.side-box,.stub,.catlinks,.authority-control,.navigation-not-searchable,.mbox-small,
  .magnify,.mw-cite-backlink,.nomobile,.tmbox,.ombox,.cmbox,.fmbox{display:none !important}
  .credit{color:${t.muted};font-size:.72em;line-height:1.5;border-top:1px solid ${t.border};margin-top:2.5em;padding-top:1em}
</style></head><body><h1>${escapeHtml(item.title)}</h1>${html}
<p class="credit">Source: ${escapeHtml(item.source)} · ${escapeHtml(item.license)}.
General information, not medical advice. If you can reach emergency services, please do that first.</p></body></html>`;

  return (
    <>
      <Stack.Screen
        options={{
          // Tap "Aa" to make the words bigger. The choice is remembered.
          headerRight: () => (
            <Pressable
              onPress={() => setSize(nextTextSize())}
              hitSlop={12}
              accessibilityLabel="Change text size"
            >
              <Text
                style={{ color: t.accent, fontSize: 20, fontWeight: "800" }}
              >
                Aa
              </Text>
            </Pressable>
          ),
        }}
      />
      <HtmlView
        html={page}
        background={t.bg}
        dark={dark}
        onOpenItem={(id) => {
          const target = findItem(id);
          if (target && fileFor(target).exists) router.push(`/item/${id}`);
        }}
      />
    </>
  );
}

function Video({ item }: { item: Item }) {
  const t = useTheme();
  const player = useVideoPlayer(fileFor(item).uri);
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <VideoView
        player={player}
        style={{ width: "100%", aspectRatio: 16 / 9 }}
        nativeControls
      />
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
        <Text style={{ color: t.accentText, fontWeight: "700", fontSize: 16 }}>
          Open PDF
        </Text>
      </Pressable>
      <Credit item={item} />
    </View>
  );
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
}

const s = StyleSheet.create({
  pad: { padding: 16 },
  credit: { fontSize: 13, padding: 16 },
  btn: { padding: 15, borderRadius: 16, alignItems: "center" },
});
