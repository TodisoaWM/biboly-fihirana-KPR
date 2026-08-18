import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ImageSlot } from '@/components/ImageSlot';
import { Screen } from '@/components/Screen';
import { getReading } from '@/data/bible';
import { getHymn, hymnRef, stanzaPreview, suggestHymns, type HymnSuggestion } from '@/data/fihirana';
import { getMofonainaForDate } from '@/data/mofonaina';
import { birthdayMessage, birthdaysOn } from '@/lib/birthdays';
import { useDailyTitle } from '@/lib/dailyTitle';
import { useI18n } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function AndroanyScreen() {
  const { theme, heroImage, heroBlur } = useTheme();
  const router = useRouter();
  const { t, weekday, dayLabel, language } = useI18n();
  const profile = useProfile();
  const firstName = profile.name.trim().split(/\s+/)[0];

  const dailyTitle = useDailyTitle();
  const todaysBirthdays = birthdaysOn(new Date());
  const isBirthday = todaysBirthdays.length > 0;
  // Un anniversaire aujourd'hui remplace le titre quotidien habituel sur le hero.
  const heroText = isBirthday ? birthdayMessage('today', todaysBirthdays, language) : dailyTitle;
  const entry = getMofonainaForDate();
  const reading = getReading(entry.reference);
  const referenceLabel = reading?.label ?? entry.reference;
  const excerpt = reading?.verses[0]?.text ? `« ${reading.verses[0].text} »` : '';

  const suggestions = suggestHymns();

  const openReading = () => router.push({ pathname: '/mofonaina', params: { date: entry.date } });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête : salutation + avatar */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: theme.textFaint }]}>
              {weekday(entry.date)} · {dayLabel(entry.date)}
            </Text>
            <Text style={[styles.greeting, { color: theme.text }]}>
              {firstName ? `${t('hello')},\n${firstName}` : `${t('hello')}!`}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            style={[styles.avatar, { backgroundColor: theme.surfaceAlt, borderColor: theme.surface }]}
          >
            <ImageSlot source={profile.photoUri} style={styles.avatarImg} accessibilityLabel="Sary">
              <Icon name="sunrise" size={22} color={theme.primary} />
            </ImageSlot>
          </Pressable>
        </View>

        {/* Illustration du jour */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[theme.heroFrom, theme.heroTo]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <ImageSlot source={heroImage} blur={heroBlur} style={StyleSheet.absoluteFill} accessibilityLabel="Sary andro">
            <View style={styles.heroIconLeft}>
              <Icon name="music" size={40} color={theme.accent} strokeWidth={1.2} />
            </View>
            <View style={styles.heroIconRight}>
              <Icon name="sunrise" size={40} color={theme.accent} strokeWidth={1.3} />
            </View>
          </ImageSlot>
          {/* Cadre transparent + titre (photo visible mais texte lisible) */}
          <LinearGradient
            colors={['rgba(15,20,25,0.05)', 'rgba(15,20,25,0.28)', 'rgba(15,20,25,0.62)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={[styles.heroTitleWrap, isBirthday && styles.birthdayTitleWrap]} pointerEvents="none">
            {isBirthday && (
              <View style={[styles.birthdayBadge, { backgroundColor: theme.gold }]}>
                <Icon name="gift" size={13} color="#4A2F12" strokeWidth={2} />
                <Text style={styles.birthdayBadgeText}>{t('birthday_badge')}</Text>
              </View>
            )}
            <Text
              style={[styles.heroTitle, isBirthday && styles.birthdayTitle, isBirthday && { color: theme.gold }]}
              numberOfLines={isBirthday ? 3 : 2}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {heroText}
            </Text>
          </View>
        </View>

        {/* Carte Mofon'aina du jour */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'lg')]}>
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: theme.textFaint }]}>{t('today_label')}</Text>
            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.theme, { color: theme.text }]}>{entry.theme}</Text>

          <View style={[styles.chip, { backgroundColor: theme.chipBg }]}>
            <Icon name="bookmark" size={14} color={theme.chipText} strokeWidth={1.8} />
            <Text style={[styles.chipText, { color: theme.chipText }]} numberOfLines={1}>{referenceLabel}</Text>
          </View>

          {excerpt ? <Text style={[styles.excerpt, { color: theme.verse }]} numberOfLines={3}>{excerpt}</Text> : null}

          <Pressable
            onPress={openReading}
            style={[styles.cta, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
          >
            <Text style={[styles.ctaText, { color: theme.onPrimary }]}>{t('read_today')}</Text>
            <Icon name="arrow-right" size={18} color={theme.onPrimary} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Proposition de chant du jour (protestant + catholique) */}
        {(suggestions.protestanta || suggestions.katolika) && (
          <>
            <View style={styles.suggHead}>
              <View style={[styles.suggHeadDot, { backgroundColor: theme.accent }]}>
                <Icon name="music" size={13} color={theme.onPrimary} strokeWidth={2} />
              </View>
              <Text style={[styles.suggLabel, { color: theme.accent }]}>{t('song_suggestion')}</Text>
            </View>
            {([suggestions.protestanta, suggestions.katolika].filter(Boolean) as HymnSuggestion[]).map((sg) => {
              const hymn = getHymn(sg.id);
              const isProt = sg.tradition === 'protestanta';
              const gradient: [string, string] = isProt
                ? [theme.cardTealFrom, theme.cardTealTo]
                : [theme.cardPinkFrom, theme.cardPinkTo];
              const badgeBg = isProt ? theme.teal : theme.accent;
              return (
                <Pressable
                  key={`${sg.id}-${sg.collectionKey}`}
                  onPress={() => router.push({ pathname: '/hymn', params: { id: sg.id, c: sg.collectionKey, p: String(sg.page) } })}
                  style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                >
                  <LinearGradient
                    colors={gradient}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={[styles.suggCard, { borderColor: theme.border }, cardShadow(theme.shadow, 'md')]}
                  >
                    <View style={[styles.suggBadge, { backgroundColor: badgeBg }]}>
                      <Text style={styles.suggBadgeText}>{hymnRef(sg.tradition, sg.collectionKey, sg.page)}</Text>
                    </View>
                    <Text style={[styles.suggTitle, { color: theme.text }]} numberOfLines={1}>
                      {sg.title}
                    </Text>
                    {hymn ? (
                      <Text style={[styles.suggPreview, { color: theme.verse }]} numberOfLines={1}>
                        {stanzaPreview(hymn).split('\n')[0]}
                      </Text>
                    ) : null}
                    <View style={[styles.suggPlay, { backgroundColor: theme.primary }, cardShadow(theme.primary, 'md')]}>
                      <Icon name="arrow-right" size={18} color={theme.onPrimary} strokeWidth={2.2} />
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.sm, paddingBottom: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  eyebrow: { fontFamily: FONTS.sansBold, fontSize: 12, letterSpacing: 0.4, marginBottom: 5 },
  greeting: { fontFamily: FONTS.display, fontSize: 26, lineHeight: 29 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 23 },
  hero: {
    marginTop: 14,
    height: 166,
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroIconLeft: { position: 'absolute', top: 12, left: 16, opacity: 0.9, transform: [{ rotate: '8deg' }] },
  heroIconRight: { position: 'absolute', top: 16, right: 18, opacity: 0.85 },
  heroTitleWrap: { position: 'absolute', left: 20, right: 20, bottom: 18 },
  // Anniversaire : badge ancré à position FIXE depuis le haut du hero (sous les
  // icônes décoratives), pas depuis le bas — sur un écran étroit, le texte prend
  // plus de lignes et un ancrage bas ferait remonter le badge hors du cadre (clip
  // par overflow:hidden). Ici le badge reste toujours visible ; seul le texte
  // s'étend vers le bas, contenu par adjustsFontSizeToFit/numberOfLines.
  birthdayTitleWrap: { top: 44, bottom: 10, justifyContent: 'flex-start' },
  birthdayBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
  },
  birthdayBadgeText: { fontFamily: FONTS.sansExtra, fontSize: 10.5, letterSpacing: 0.8, color: '#4A2F12' },
  birthdayTitle: { fontFamily: FONTS.display, fontSize: 22, lineHeight: 27 },
  heroTitle: {
    fontFamily: FONTS.hand,
    fontSize: 26,
    lineHeight: 32,
    color: '#FFFDF0',
    // @ts-expect-error web textShadow for legibility over the photo
    textShadow: '0 1px 8px rgba(0,0,0,0.55)',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  card: {
    marginTop: 18,
    borderRadius: RADII.xl,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 6,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1.4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  theme: { fontFamily: FONTS.display, fontSize: 22, lineHeight: 26, marginTop: 9 },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
  },
  chipText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  excerpt: { fontFamily: FONTS.serifItalic, fontSize: 14, lineHeight: 21, marginTop: 12 },
  cta: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 5,
  },
  ctaText: { fontFamily: FONTS.sansExtra, fontSize: 15 },
  suggHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28, marginBottom: 12 },
  suggHeadDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  suggLabel: { fontFamily: FONTS.sansExtra, fontSize: 12, letterSpacing: 0.8 },
  suggCard: {
    borderRadius: RADII.xl,
    padding: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 96,
  },
  suggBadge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADII.pill },
  suggBadgeText: { color: '#fff', fontFamily: FONTS.sansExtra, fontSize: 10.5 },
  suggTitle: { fontFamily: FONTS.display, fontSize: 19, marginTop: 10, maxWidth: '76%' },
  suggPreview: { fontFamily: FONTS.serif, fontSize: 13, marginTop: 4, maxWidth: '76%' },
  suggPlay: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
