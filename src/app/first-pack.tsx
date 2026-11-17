import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../components/ui';
import { formatBytes, packBytes } from '../lib/catalog';
import { recordPackOffered } from '../lib/first-pack';
import { useLibrary } from '../lib/LibraryContext';
import { useTheme } from '../lib/theme';

const POINTS = [
  'First aid, safe water, fire, shelter and a basic kit',
  'Opens with no signal, no Wi-Fi and no account',
  'Free forever. Add bigger packs any time',
];

// The last step of setup. Without guides on the phone the app can't help when the
// signal is gone, so we ask for this while the internet still works.
export default function FirstPack() {
  const t = useTheme();
  const { start } = useLibrary();
  const size = packBytes('small');

  const done = (save: boolean) => {
    recordPackOffered();
    if (save) start('small');
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={s.wrap}>
        <Image
          source={require('../../assets/illustrations/pack-small.png')}
          style={s.picture}
          resizeMode="contain"
        />
        <Text style={[s.title, { color: t.text }]}>One last thing: save your free guides</Text>
        <Text style={[s.body, { color: t.text }]}>
          Do this now, while you have internet. After that they work anywhere.
        </Text>
        <View style={[s.card, { backgroundColor: t.card }]}>
          {POINTS.map((p) => (
            <View key={p} style={s.point}>
              <Ionicons name="checkmark-circle" size={22} color={t.accent} />
              <Text style={{ color: t.text, fontSize: 16, lineHeight: 23, flex: 1 }}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.footer}>
        <Button
          label={size > 0 ? `Save the free guides (${formatBytes(size)})` : 'Save the free guides'}
          onPress={() => done(true)}
        />
        <Button label="Not now" kind="quiet" onPress={() => done(false)} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 24, gap: 14, justifyContent: 'center' },
  picture: { width: 120, height: 120, alignSelf: 'center' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 17, lineHeight: 25, textAlign: 'center' },
  card: { borderRadius: 22, padding: 18, gap: 12, marginTop: 6 },
  point: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 6 },
});
