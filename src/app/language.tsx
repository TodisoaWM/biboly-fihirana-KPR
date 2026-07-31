import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { languageName, useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { Lang, setProfile, useProfile } from '@/lib/profile';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

const LANGS: Lang[] = ['mg', 'fr', 'en'];

export default function LanguageScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const goBack = useSafeBack('/settings');
  const profile = useProfile();

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{t('language')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.hint, { color: theme.textFaint }]}>{t('choose_language')}</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
          {LANGS.map((l, i) => {
            const selected = profile.language === l;
            return (
              <Pressable
                key={l}
                onPress={() => setProfile({ language: l })}
                style={[styles.row, i < LANGS.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }]}
              >
                <View style={[styles.flag, { backgroundColor: theme.chipBg }]}>
                  <Icon name="globe" size={17} color={theme.chipText} strokeWidth={1.8} />
                </View>
                <Text style={[styles.langName, { color: theme.text }]}>{languageName(l)}</Text>
                {selected && (
                  <View style={[styles.check, { backgroundColor: theme.primary }]}>
                    <Icon name="arrow-right" size={13} color={theme.onPrimary} strokeWidth={2.6} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontFamily: FONTS.display, fontSize: 20 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 10 },
  hint: { fontFamily: FONTS.sansSemi, fontSize: 12.5, marginBottom: 12 },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  flag: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  langName: { flex: 1, fontFamily: FONTS.sansBold, fontSize: 15 },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
