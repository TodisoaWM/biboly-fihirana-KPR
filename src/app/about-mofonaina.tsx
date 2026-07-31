import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { getCalendarByMonth, MofonainaEntry, toISO } from '@/data/mofonaina';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function AboutMofonainaScreen() {
  const { theme } = useTheme();
  const { t, weekday } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/settings');
  const todayISO = toISO(new Date());

  const sections = getCalendarByMonth().map((g) => ({ key: g.key, title: g.label, data: g.entries }));

  const About = () => (
    <View style={styles.aboutWrap}>
      <View style={[styles.aboutCard, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
        <View style={[styles.aboutIcon, { backgroundColor: theme.chipBg }]}>
          <Icon name="book" size={20} color={theme.chipText} strokeWidth={1.8} />
        </View>
        <Text style={[styles.aboutTitle, { color: theme.text }]}>{t('about_mofonaina')}</Text>
        <Text style={[styles.aboutText, { color: theme.textMuted }]}>{t('about_desc')}</Text>
        <Text style={[styles.copyright, { color: theme.textFaint }]}>© 2026 Todisoa · v{APP_VERSION}</Text>
      </View>
      <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>
        {t('calendar_year')} · {sections.reduce((n, s) => n + s.data.length, 0)} {t('days_uc')}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: MofonainaEntry }) => {
    const isToday = item.date === todayISO;
    const d = item.date.slice(8); // jour
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/mofonaina', params: { date: item.date } })}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: theme.surface,
            borderColor: isToday ? theme.primary : theme.border,
            opacity: pressed ? 0.85 : 1,
          },
          cardShadow(theme.shadow, 'sm'),
        ]}
      >
        <View style={[styles.dayBadge, { backgroundColor: isToday ? theme.primary : theme.chipBg }]}>
          <Text style={[styles.dayNum, { color: isToday ? theme.onPrimary : theme.chipText }]}>{parseInt(d, 10)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.theme, { color: theme.text }]} numberOfLines={1}>
            {item.theme}
          </Text>
          <Text style={[styles.ref, { color: theme.textMuted }]}>
            {weekday(item.date)} · {item.reference}
          </Text>
        </View>
        {isToday && <View style={[styles.todayDot, { backgroundColor: theme.primary }]} />}
        <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
      </Pressable>
    );
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Mofon'aina 2026</Text>
        <ProfileButton />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        ListHeaderComponent={About}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.monthLabel, { color: theme.primary, backgroundColor: theme.bg }]}>{section.title}</Text>
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled
        initialNumToRender={16}
        windowSize={11}
      />
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
  title: { fontFamily: FONTS.display, fontSize: 21 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  aboutWrap: { paddingTop: 6 },
  aboutCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  aboutIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { fontFamily: FONTS.display, fontSize: 19, marginTop: 12 },
  aboutText: { fontFamily: FONTS.serif, fontSize: 14, lineHeight: 22, marginTop: 8 },
  copyright: { fontFamily: FONTS.sansSemi, fontSize: 11.5, marginTop: 12 },
  sectionLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1, marginTop: 22 },
  monthLabel: { fontFamily: FONTS.sansExtra, fontSize: 12, letterSpacing: 0.8, paddingVertical: 10, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  dayBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontFamily: FONTS.sansExtra, fontSize: 15 },
  theme: { fontFamily: FONTS.sansBold, fontSize: 14.5 },
  ref: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 2 },
  todayDot: { width: 8, height: 8, borderRadius: 4 },
});
