import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Retour direct à l'accueil depuis n'importe quelle profondeur de navigation.
 * `dismissAll()` vide la pile jusqu'au premier écran (le groupe `(tabs)`),
 * contrairement à `router.replace('/(tabs)')` qui empilerait sans purger.
 */
export function HomeButton() {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.dismissAll()}
      hitSlop={6}
      accessibilityLabel="Androany"
      style={[styles.btn, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Icon name="home" size={17} color={theme.text} strokeWidth={2.1} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
