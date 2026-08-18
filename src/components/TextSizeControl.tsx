import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

const MIN = 0.85;
const MAX = 1.6;
const STEP = 0.15;
const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Contrôle de taille du texte, à placer dans une barre (lecture Baiboly / Fihirana).
 * Garde l'icône « Tt » (tap = remise à 100 %) encadrée de A− / A+ pour ajuster vite.
 */
export function TextSizeControl() {
  const { theme, fontScale, setFontScale } = useTheme();
  const atMin = fontScale <= MIN + 0.001;
  const atMax = fontScale >= MAX - 0.001;

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setFontScale(Math.max(MIN, round(fontScale - STEP)))}
        disabled={atMin}
        hitSlop={8}
        style={styles.step}
      >
        <Text style={[styles.aSmall, { color: theme.text, opacity: atMin ? 0.35 : 1 }]}>A</Text>
      </Pressable>

      <Pressable onPress={() => setFontScale(1)} hitSlop={8} style={styles.tt} accessibilityLabel="100%">
        <Icon name="format" size={21} color={theme.text} strokeWidth={1.8} />
      </Pressable>

      <Pressable
        onPress={() => setFontScale(Math.min(MAX, round(fontScale + STEP)))}
        disabled={atMax}
        hitSlop={8}
        style={styles.step}
      >
        <Text style={[styles.aBig, { color: theme.text, opacity: atMax ? 0.35 : 1 }]}>A</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  step: { minWidth: 22, alignItems: 'center', justifyContent: 'center' },
  tt: { paddingHorizontal: 2 },
  aSmall: { fontFamily: FONTS.sansExtra, fontSize: 13 },
  aBig: { fontFamily: FONTS.sansExtra, fontSize: 20 },
});
