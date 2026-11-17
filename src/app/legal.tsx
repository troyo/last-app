import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../components/ui';
import { TERMS } from '../lib/agreement';
import { useTheme } from '../lib/theme';

// The full safety terms, readable any time from the About tab.
export default function Legal() {
  const t = useTheme();
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={s.wrap}>
      {TERMS.map((section) => (
        <View key={section.title} style={{ gap: 4 }}>
          <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>{section.title}</Text>
          <Text style={{ color: t.text, fontSize: 16, lineHeight: 24 }}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({ wrap: { padding: 20, gap: 18, paddingBottom: 40 } });
