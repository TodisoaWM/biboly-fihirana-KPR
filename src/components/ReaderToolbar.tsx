import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { TextSizeControl } from './TextSizeControl';

/**
 * Barre fine en bas d'un écran de lecture, contenant le réglage de taille de
 * texte. Posée SOUS le contenu défilant (ne recouvre donc jamais le texte) et
 * gère la marge de sécurité du bas (barre de gestes).
 */
export function ReaderToolbar() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <TextSizeControl />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: 1, paddingTop: 10, alignItems: 'center', justifyContent: 'center' },
});
