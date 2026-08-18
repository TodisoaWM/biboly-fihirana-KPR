import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FavButton } from '@/components/FavButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { ReaderToolbar } from '@/components/ReaderToolbar';
import { Screen } from '@/components/Screen';
import { getReading } from '@/data/bible';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { addBibleRecent } from '@/lib/recents';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

/** Affiche uniquement les versets choisis d'une référence (ex. « Jao 2.3-6 »). */
export default function PassageScreen() {
  const { theme, fontScale } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/(tabs)');
  const { ref } = useLocalSearchParams<{ ref?: string }>();

  const reading = getReading(ref ?? '');
  const size = 16.5 * fontScale;

  useEffect(() => {
    if (reading) addBibleRecent(ref ?? '', reading.label);
  }, [ref, reading]);

  const openChapter = () => {
    if (!reading) return;
    router.push({
      pathname: '/reading',
      params: {
        book: reading.book.code,
        chapter: String(reading.chapter),
        ...(reading.firstVerse ? { v: String(reading.firstVerse) } : {}),
        ...(reading.lastVerse ? { vEnd: String(reading.lastVerse) } : {}),
      },
    });
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.topTitle, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {reading?.label ?? ref}
        </Text>
        <View style={styles.rightCluster}>
          {reading && <FavButton fav={{ type: 'bible', ref: ref ?? '', label: reading.label }} />}
          <ProfileButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {reading ? (
          <>
            <View style={[styles.chip, { backgroundColor: theme.chipBg }]}>
              <Icon name="bookmark" size={14} color={theme.chipText} strokeWidth={1.8} />
              <Text style={[styles.chipText, { color: theme.chipText }]}>{reading.label}</Text>
            </View>

            {reading.verses.map((v) => (
              <View key={v.n}>
                {v.headings?.map((h, i) => (
                  <Text key={i} style={[styles.heading, { color: theme.primary }]}>
                    {h}
                  </Text>
                ))}
                <Text style={[styles.verse, { color: theme.verse, fontSize: size, lineHeight: size * 1.85 }]}>
                  <Text style={[styles.verseNum, { color: theme.accent }]}>{v.n} </Text>
                  {v.text}
                </Text>
              </View>
            ))}

            <Pressable onPress={openChapter} style={[styles.fullBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              <Text style={[styles.fullBtnText, { color: theme.text }]}>{t('read_full_chapter')}</Text>
              <Icon name="arrow-right" size={17} color={theme.text} strokeWidth={2.2} />
            </Pressable>
          </>
        ) : (
          <Text style={[styles.notFound, { color: theme.textMuted }]}>{t('ref_unreadable')} « {ref} ».</Text>
        )}
      </ScrollView>
      <ReaderToolbar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    gap: 10,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: FONTS.display, fontSize: 19 },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { paddingHorizontal: 26, paddingTop: 18, paddingBottom: 40 },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: RADII.pill,
  },
  chipText: { fontFamily: FONTS.sansBold, fontSize: 12.5 },
  heading: { fontFamily: FONTS.sansBold, fontSize: 12, letterSpacing: 0.8, marginTop: 6, marginBottom: 12, textTransform: 'uppercase' },
  verse: { fontFamily: FONTS.serif, marginBottom: 14 },
  verseNum: { fontFamily: FONTS.sansBold, fontSize: 12 },
  fullBtn: {
    marginTop: 12,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fullBtnText: { fontFamily: FONTS.sansExtra, fontSize: 14 },
  notFound: { fontFamily: FONTS.sansSemi, fontSize: 14, marginTop: 30, textAlign: 'center' },
});
