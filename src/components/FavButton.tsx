import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { FavInput, keyOf, toggleFavorite, useFavorites } from '@/lib/favorites';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

/** Bouton 🔖 qui ajoute/retire l'élément des favoris (Tiana). */
export function FavButton({ fav, style }: { fav: FavInput; style?: ViewStyle }) {
  const { theme } = useTheme();
  const favs = useFavorites();
  const active = favs.some((f) => keyOf(f) === keyOf(fav));

  return (
    <Pressable
      onPress={() => toggleFavorite(fav)}
      style={[styles.btn, { backgroundColor: active ? theme.chipBg : theme.surface, borderColor: theme.border }, style]}
      accessibilityLabel="Tiana"
    >
      <Icon name={active ? 'bookmark-filled' : 'bookmark'} size={18} color={theme.accent} strokeWidth={1.9} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
