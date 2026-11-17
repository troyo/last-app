import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FadeIn, Float, Text } from '../components/ui';
import { useTheme } from '../lib/theme';
import { markWelcomeSeen } from '../lib/welcome';

const SLIDES = [
  {
    image: require('../../assets/illustrations/welcome.png'),
    title: 'Hi, glad you’re here',
    body: 'Last App is a friendly pocket guide for when things go sideways: a power cut, a storm, a scraped knee on a hike. Clear, calm steps, right when you need them.',
  },
  {
    image: require('../../assets/illustrations/offline.png'),
    title: 'Works with zero signal',
    body: 'Save the guides to your phone once. After that everything opens instantly, even in airplane mode, with no internet and no account.',
  },
  {
    image: require('../../assets/illustrations/packs.png'),
    title: 'Start free, grow when you like',
    body: 'The Small pack is free forever and covers the essentials. Want manuals, handbooks and a medical encyclopedia too? Unlock the bigger packs any time.',
  },
];

// The first-launch explainer: three swipeable pages.
export default function Welcome() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const scroller = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [page, setPage] = useState(0);
  const last = page === SLIDES.length - 1;

  const finish = () => {
    markWelcomeSeen();
    router.replace('/');
  };
  const next = () => {
    if (last) return finish();
    scroller.current?.scrollTo({ x: width * (page + 1), animated: true });
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={s.skipRow}>
        {!last && <Button label="Skip" kind="quiet" onPress={finish} />}
      </View>
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}>
        {SLIDES.map((slide, i) => (
          <View key={slide.title} style={[s.slide, { width }]}>
            <Float>
              <Image
                source={slide.image}
                style={{ width: width - 48, height: (width - 48) * 0.8 }}
                resizeMode="contain"
              />
            </Float>
            <FadeIn delay={i === 0 ? 150 : 0}>
              <Text style={[s.title, { color: t.text }]}>{slide.title}</Text>
              <Text style={[s.body, { color: t.muted }]}>{slide.body}</Text>
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
              { backgroundColor: i === page ? t.accent : t.border, width: i === page ? 22 : 8 },
            ]}
          />
        ))}
      </View>
      <View style={s.footer}>
        <Button label={last ? 'Let’s get you set up' : 'Next'} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  skipRow: { height: 48, alignItems: 'flex-end', paddingHorizontal: 12 },
  slide: { paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  body: { fontSize: 17, lineHeight: 25, textAlign: 'center', marginTop: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 12 },
});
