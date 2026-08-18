import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { useI18n } from '@/lib/i18n';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

function ChoiceCard({
  icon,
  iconBg,
  gradient,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  iconBg: string;
  gradient: [string, string];
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.choice, { borderColor: theme.border }, cardShadow(theme.shadow, 'lg')]}
      >
        <View style={[styles.iconSquare, { backgroundColor: iconBg }]}>
          <Icon name={icon} size={28} color={theme.onPrimary} strokeWidth={1.7} />
        </View>
        <View>
          <Text style={[styles.choiceTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.choiceSub, { color: theme.verse }]}>{subtitle}</Text>
        </View>
        <View style={[styles.chevBtn, { backgroundColor: theme.surface }]}>
          <Icon name="chevron-right" size={18} color={theme.text} strokeWidth={2.4} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function BaibolyScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/search')}
              style={[styles.searchBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Icon name="search" size={20} color={theme.text} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/picker')}
              style={[styles.searchBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              accessibilityLabel={t('chapter_verse')}
            >
              <Icon name="book-search" size={24} color={theme.primary} strokeWidth={1.7} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/recents')}
              style={[styles.searchBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              accessibilityLabel={t('recent_readings')}
            >
              <Icon name="bookmark" size={20} color={theme.accent} strokeWidth={1.9} />
            </Pressable>
          </View>
          <ProfileButton />
        </View>

        <Text style={[styles.eyebrow, { color: theme.accent }]}>{t('choose_reading')}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t('choose_topic')}</Text>

        <View style={{ height: SPACING.xl }} />

        <ChoiceCard
          icon="book"
          iconBg={theme.notch === '#232020' ? '#232020' : '#0B1419'}
          gradient={[theme.cardPinkFrom, theme.cardPinkTo]}
          title={t('tab_bible')}
          subtitle={t('bible_subtitle')}
          onPress={() => router.push('/books')}
        />

        <View style={{ height: SPACING.lg }} />

        <ChoiceCard
          icon="music"
          iconBg={theme.teal}
          gradient={[theme.cardTealFrom, theme.cardTealTo]}
          title={t('tab_hymnal')}
          subtitle={t('hymnal_subtitle')}
          onPress={() => router.navigate('/fihirana')}
        />

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 26, paddingTop: 14, paddingBottom: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 20 },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRow: { flexDirection: 'row', gap: 12 },
  quick: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickText: { fontFamily: FONTS.sansExtra, fontSize: 13 },
  eyebrow: { fontFamily: FONTS.sansBold, fontSize: 13, letterSpacing: 0.3, marginTop: 22 },
  title: { fontFamily: FONTS.display, fontSize: 30, lineHeight: 32, marginTop: 2 },
  choice: {
    borderRadius: RADII.xxl,
    padding: 24,
    minHeight: 170,
    justifyContent: 'space-between',
    gap: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 26,
    elevation: 5,
  },
  iconSquare: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: { fontFamily: FONTS.display, fontSize: 27 },
  choiceSub: { fontFamily: FONTS.sansSemi, fontSize: 13.5, marginTop: 4 },
  chevBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
