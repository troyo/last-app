import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FadeIn, Float, Text } from '../components/ui';
import { hasAgreed } from '../lib/agreement';
import { useTheme } from '../lib/theme';
import { markWelcomeSeen } from '../lib/welcome';

const SLIDES = [
  {
    image: null, // the first page is the full-screen opening film instead of a picture
    title: 'Ready for anything',
    body: 'The guide you’ll want when the power, the phones and the shops are all down. Calm, clear steps for a bad night or a bad year.',
  },
  {
    image: require('../../assets/illustrations/offline.png'),
    title: 'Works with zero signal',
    body: 'Save the guides to your phone once. After that everything opens instantly, even in airplane mode, with no internet and no account.',
  },
  {
    image: require('../../assets/illustrations/packs.png'),
    title: 'Start free, add more later',
    body: 'The Small pack is free forever and covers the essentials. Want field manuals, handbooks and many more guides? Unlock the bigger packs any time.',
  },
];

// A smooth dark fade behind the words is one stretched picture (assets/illustrations/fade-dark.png),
// clear at the top and darkest at the bottom, so there is no edge across the film.
const NIGHT = '#1B3A4E'; // shown for the split second before the film starts

// The first-launch explainer: three swipeable pages. Page one plays a short
// film of night turning to morning over a cabin, full screen, with the words
// on top. It ships inside the app, so it plays with no internet.
export default function Welcome() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [page, setPage] = useState(0);
  const [tall, setTall] = useState(0); // height of the swiping area, so pages can center
  const last = page === SLIDES.length - 1;
  const film = page === 0;

  const player = useVideoPlayer(require('../../assets/video/opening.mp4'), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const finish = () => {
    markWelcomeSeen();
    // Next stop: the safety terms. Home sends people there until they agree.
    router.replace(hasAgreed() ? '/' : '/agree');
  };
  const goal = useRef(0); // the page we're heading to, so two quick taps move two pages
  const next = () => {
    if (goal.current >= SLIDES.length - 1) return finish();
    goal.current += 1;
    scroller.current?.scrollTo({ x: width * goal.current, animated: true });
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  const onSettled = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    (goal.current = Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View style={{ flex: 1, backgroundColor: film ? NIGHT : t.bg }}>
      <StatusBar style={film ? 'light' : 'auto'} />
      {film && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            playsInline
          />
          {/* Darkens the lower half so the white words are easy to read. */}
          <Image
            source={require('../../assets/illustrations/fade-dark.png')}
            style={s.fade}
            resizeMode="stretch"
          />
        </View>
      )}
      <SafeAreaView style={{ flex: 1 }}>
        <View style={s.skipRow}>
          {!last && (
            <Pressable
              onPress={finish}
              hitSlop={12}
              accessibilityRole="button"
              style={film && s.skipPill}
            >
              <Text style={{ color: film ? '#FFFFFF' : t.text, fontSize: 17, fontWeight: '700' }}>
                Skip
              </Text>
            </Pressable>
          )}
        </View>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onSettled}
          onLayout={(e) => setTall(e.nativeEvent.layout.height)}
          style={{ flex: 1 }}
        >
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={[
                s.slide,
                { width, minHeight: tall },
                !slide.image && { justifyContent: 'flex-end', paddingBottom: 8 },
              ]}
            >
              {slide.image && (
                <Float>
                  <Image
                    source={slide.image}
                    style={{ width: width - 48, height: (width - 48) * 0.8 }}
                    resizeMode="contain"
                  />
                </Float>
              )}
              <FadeIn delay={i === 0 ? 600 : 0}>
                <Text
                  style={[
                    s.title,
                    { color: slide.image ? t.text : '#FFFFFF' },
                    !slide.image && { fontSize: 38, lineHeight: 44 },
                  ]}
                >
                  {slide.title}
                </Text>
                <Text style={[s.body, { color: slide.image ? t.text : '#FFFFFF' }]}>
                  {slide.body}
                </Text>
              </FadeIn>
            </View>
          ))}
        </ScrollView>
        <View style={s.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={[
                s.dot,
                {
                  backgroundColor:
                    i === page ? (film ? '#FFFFFF' : t.accent) : film ? '#FFFFFF66' : t.border,
                  width: i === page ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={s.footer}>
          {film ? (
            <Pressable
              onPress={next}
              accessibilityRole="button"
              style={({ pressed }) => [s.lightBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={{ color: '#0E2A21', fontSize: 17, fontWeight: '800' }}>Get started</Text>
            </Pressable>
          ) : (
            <Button label={last ? 'Let’s get you set up' : 'Next'} onPress={next} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  skipRow: {
    height: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  slide: { paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 30, fontWeight: '800', lineHeight: 36, textAlign: 'center', marginTop: 12 },
  body: { fontSize: 18, lineHeight: 26, textAlign: 'center', marginTop: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 },
  lightBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '70%' },
  skipPill: {
    backgroundColor: 'rgba(8, 28, 22, 0.45)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
  },
});
