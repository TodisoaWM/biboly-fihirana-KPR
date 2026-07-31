import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useProfile } from '@/lib/profile';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { ImageSlot } from './ImageSlot';

/** Avatar/bouton de profil (photo ou icône par défaut) → ouvre les réglages. */
export function ProfileButton({ style }: { style?: ViewStyle }) {
  const { theme } = useTheme();
  const profile = useProfile();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      style={[styles.avatar, { backgroundColor: theme.surfaceAlt, borderColor: theme.surface }, style]}
      accessibilityLabel="Profil"
    >
      <ImageSlot source={profile.photoUri} style={styles.img} accessibilityLabel="Sary">
        <Icon name="sunrise" size={20} color={theme.primary} />
      </ImageSlot>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', borderRadius: 20 },
});
