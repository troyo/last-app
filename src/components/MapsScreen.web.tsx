import { View } from 'react-native';
import { useTheme } from '../lib/theme';
import { Text } from './ui';

// Maps need the phone's own map engine, so the browser preview shows a note.
export function MapsScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: t.text, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>
        Offline maps work in the phone app
      </Text>
    </View>
  );
}
