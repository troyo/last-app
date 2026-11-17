import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Text } from '../components/ui';
import { hasAgreed, recordAgreement } from '../lib/agreement';
import { useTheme } from '../lib/theme';

const POINTS = [
  'This is general information, not medical or professional advice.',
  'It doesn’t replace doctors or emergency services. If you can reach them, do that first.',
  'Guides can be incomplete or wrong. You use them at your own risk.',
  'Things change. Check important facts with a second source when you can.',
];

// Shown once after the welcome tour. Nobody gets into the app without ticking the box.
export default function Agree() {
  const t = useTheme();
  const [checked, setChecked] = useState(hasAgreed);

  const go = () => {
    recordAgreement();
    router.replace('/');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={[s.title, { color: t.text }]}>Before you start</Text>
        <Text style={{ color: t.muted, fontSize: 16, lineHeight: 23 }}>
          We want you safe, so please read this first.
        </Text>

        <Card style={{ gap: 14 }}>
          {POINTS.map((p) => (
            <View key={p} style={s.point}>
              <Ionicons name="shield-checkmark-outline" size={22} color={t.accent} />
              <Text style={{ color: t.text, fontSize: 16, lineHeight: 23, flex: 1 }}>{p}</Text>
            </View>
          ))}
        </Card>

        <Button label="Read the full terms" kind="quiet" onPress={() => router.push('/legal')} />
      </ScrollView>

      <View style={[s.footer, { borderTopColor: t.border }]}>
        <Pressable
          onPress={() => setChecked((c) => !c)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          hitSlop={8}
          style={s.checkRow}
        >
          <View
            style={[
              s.box,
              { borderColor: t.accent, backgroundColor: checked ? t.accent : 'transparent' },
            ]}
          >
            {checked && <Ionicons name="checkmark" size={20} color={t.accentText} />}
          </View>
          <Text style={{ color: t.text, fontSize: 15, lineHeight: 21, flex: 1 }}>
            I have read and agree to the terms, and I understand I use Last App at my own risk.
          </Text>
        </Pressable>
        <Button label="Agree and continue" onPress={go} disabled={!checked} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '800', marginTop: 8 },
  point: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  footer: { padding: 20, gap: 14, borderTopWidth: StyleSheet.hairlineWidth },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  box: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
