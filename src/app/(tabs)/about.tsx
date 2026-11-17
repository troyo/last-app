import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from '../../components/ui';
import { useTheme } from '../../lib/theme';

const STEPS = [
  {
    icon: 'cloud-download-outline',
    title: 'Save a pack',
    body: 'Pick a pack while you have internet. It downloads straight onto your phone.',
  },
  {
    icon: 'airplane-outline',
    title: 'Go anywhere',
    body: 'Everything you saved opens with no signal, no Wi-Fi and no account.',
  },
  {
    icon: 'search-outline',
    title: 'Find it fast',
    body: 'Browse by topic or search for what’s happening, like “burn” or “water”.',
  },
] as const;

const PROMISES = [
  {
    icon: 'lock-closed-outline',
    text: 'Private. No account, no tracking, and nothing you read ever leaves your phone.',
  },
  {
    icon: 'library-outline',
    text: 'From sources you can check: US government guides, Wikipedia and Wikibooks. Every page says where it came from.',
  },
  {
    icon: 'gift-outline',
    text: 'The Small pack is free forever. The bigger packs are a one-time unlock, never a subscription.',
  },
] as const;

// The explainer: what this app is, how it works, and why you can trust it.
export default function About() {
  const t = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={[s.h1, { color: t.text }]}>About Last App</Text>
        <Image
          source={require('../../../assets/illustrations/offline.png')}
          style={{ width: '100%', height: 200 }}
          resizeMode="contain"
        />
        <Text style={{ color: t.text, fontSize: 17, lineHeight: 25 }}>
          Last App is a calm, practical guide that lives on your phone. It’s there for the moments
          when you can’t look things up: the power is out, the signal is gone, or you’re far from
          help.
        </Text>

        <Text style={[s.h2, { color: t.text }]}>How it works</Text>
        {STEPS.map((step, i) => (
          <Card key={step.title} style={s.row}>
            <View style={[s.icon, { backgroundColor: t.soft }]}>
              <Ionicons name={step.icon} size={22} color={t.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>
                {i + 1}. {step.title}
              </Text>
              <Text style={{ color: t.muted, fontSize: 15, lineHeight: 21, marginTop: 2 }}>
                {step.body}
              </Text>
            </View>
          </Card>
        ))}

        <Text style={[s.h2, { color: t.text }]}>Our promises</Text>
        <Card style={{ gap: 14 }}>
          {PROMISES.map((p) => (
            <View key={p.text} style={s.row}>
              <Ionicons name={p.icon} size={22} color={t.accent} />
              <Text style={{ color: t.text, fontSize: 15, lineHeight: 22, flex: 1 }}>{p.text}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ backgroundColor: t.soft, borderColor: t.soft }}>
          <Text style={{ color: t.text, fontSize: 15, lineHeight: 22 }}>
            A gentle note: these guides are general information, not a replacement for a doctor or
            emergency services. If you can reach help, please do that first.
          </Text>
        </Card>

        <Button
          label="Where the guides come from"
          kind="secondary"
          onPress={() => router.push('/sources')}
        />
        <Button
          label="Show the welcome tour again"
          kind="quiet"
          onPress={() => router.push('/welcome')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 14, paddingBottom: 32 },
  h1: { fontSize: 32, fontWeight: '800' },
  h2: { fontSize: 20, fontWeight: '800', marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
