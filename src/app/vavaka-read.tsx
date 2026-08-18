import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { ReaderToolbar } from '@/components/ReaderToolbar';
import { Screen } from '@/components/Screen';
import { getReading } from '@/data/bible';
import { categoryLabel, getVavaka, refToPassage, type VavakaRef } from '@/data/vavaka';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

// Encadré « corail clair » pour le texte du verset (popup de référence).
const CORAL_BG = 'rgba(216,90,48,0.10)';
const CORAL_BORDER = 'rgba(216,90,48,0.28)';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function VavakaReadScreen() {
  const { theme, fontScale } = useTheme();
  const { t } = useI18n();
  const goBack = useSafeBack('/vavaka');
  const bodySize = 15.5 * fontScale;
  const { id } = useLocalSearchParams<{ id?: string }>();
  const vavaka = id ? getVavaka(id) : undefined;

  const [sheetRef, setSheetRef] = useState<VavakaRef | null>(null);
  const reading = sheetRef ? getReading(refToPassage(sheetRef)) : null;

  // Index des références par texte brut + regex pour repérer les liens dans les lignes.
  const refByRaw = useMemo(() => {
    const m = new Map<string, VavakaRef>();
    (vavaka?.refs ?? []).forEach((r) => m.set(r.raw, r));
    return m;
  }, [vavaka]);
  const linkRe = useMemo(() => {
    const raws = (vavaka?.refs ?? []).map((r) => r.raw).sort((a, b) => b.length - a.length);
    return raws.length ? new RegExp('(' + raws.map(escapeRe).join('|') + ')') : null;
  }, [vavaka]);

  if (!vavaka) {
    return (
      <Screen>
        <View style={styles.header}>
          <View style={styles.leftCluster}>
            <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
            </Pressable>
            <HomeButton />
          </View>
        </View>
        <Text style={[styles.notFound, { color: theme.textFaint }]}>{t('hymn_not_found')}</Text>
      </Screen>
    );
  }

  const accent = vavaka.tradition === 'katolika' ? theme.accent : theme.teal;
  const traditionLabel = vavaka.tradition === 'katolika' ? t('catholic') : t('protestant');

  // Rend une ligne en transformant les références (ex. « Jaona 4:29 ») en liens cliquables.
  const renderLine = (line: string, key: number) => {
    if (!linkRe) return <Text key={key} style={[styles.line, { color: theme.verse, fontSize: bodySize, lineHeight: bodySize * 1.6 }]}>{line}</Text>;
    const segs = line.split(linkRe);
    return (
      <Text key={key} style={[styles.line, { color: theme.verse, fontSize: bodySize, lineHeight: bodySize * 1.6 }]}>
        {segs.map((seg, i) =>
          refByRaw.has(seg) ? (
            <Text
              key={i}
              onPress={() => setSheetRef(refByRaw.get(seg)!)}
              style={[styles.link, { color: theme.primary }]}
            >
              {seg}
            </Text>
          ) : (
            seg
          ),
        )}
      </Text>
    );
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <ProfileButton />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {traditionLabel} · {categoryLabel(vavaka.category)}
          </Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{vavaka.title}</Text>

        {/* Corps de la prière : ligne vide = saut de paragraphe ; références cliquables inline */}
        <View style={styles.body}>
          {vavaka.lines.map((line, i) => (line.trim() === '' ? <View key={i} style={styles.gap} /> : renderLine(line, i)))}
        </View>
      </ScrollView>

      <ReaderToolbar />

      {/* Popup de référence — overlay INTERNE au cadre de l'app (pas un Modal plein écran) */}
      {sheetRef && (
        <View style={styles.overlayRoot}>
          <Pressable style={styles.backdrop} onPress={() => setSheetRef(null)} />
          <Animated.View
            entering={SlideInDown.duration(240)}
            style={[styles.sheet, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'lg')]}
          >
            <View style={[styles.handle, { backgroundColor: theme.border }]} />

            <View style={styles.sheetTop}>
              {/* Badge doré : Livre | Chapitre */}
              <View style={[styles.sheetBadge, { backgroundColor: theme.gold }]}>
                <Text style={styles.sheetBadgeBook}>{sheetRef.book}</Text>
                <View style={styles.sheetBadgeDivider} />
                <Text style={styles.sheetBadgeChapter}>{sheetRef.chapter}</Text>
              </View>
              <Icon name="book" size={22} color={theme.textFaint} strokeWidth={1.8} />
            </View>

            {/* Encadré corail : texte du/des verset(s) */}
            <View style={[styles.verseBox, { backgroundColor: CORAL_BG, borderColor: CORAL_BORDER }]}>
              {reading && reading.verses.length > 0 ? (
                reading.verses.map((v) => (
                  <Text key={v.n} style={[styles.verseText, { color: theme.text, fontSize: bodySize, lineHeight: bodySize * 1.55 }]}>
                    <Text style={[styles.verseNum, { color: accent }]}>{v.n} </Text>
                    {v.text}
                  </Text>
                ))
              ) : (
                <Text style={[styles.verseText, { color: theme.textFaint }]}>{t('no_results')}</Text>
              )}
            </View>

            <Pressable
              onPress={() => setSheetRef(null)}
              style={({ pressed }) => [styles.closeBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={[styles.closeText, { color: theme.onPrimary }]}>{t('close')}</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
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
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notFound: { fontFamily: FONTS.sansSemi, fontSize: 15, textAlign: 'center', marginTop: 50 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: 6, paddingBottom: 50 },
  badge: { alignSelf: 'flex-start', paddingVertical: 5, paddingHorizontal: 12, borderRadius: RADII.pill },
  badgeText: { color: '#fff', fontFamily: FONTS.sansExtra, fontSize: 11 },
  title: { fontFamily: FONTS.display, fontSize: 27, lineHeight: 32, marginTop: 12 },
  body: { marginTop: 22 },
  line: { fontFamily: FONTS.serif, fontSize: 15.5, lineHeight: 25 },
  link: { fontFamily: FONTS.serifMedium, textDecorationLine: 'underline' },
  gap: { height: 14 },
  // overlay (confiné au cadre de l'app)
  overlayRoot: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 50 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 12,
    paddingBottom: 30,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, marginBottom: 16 },
  sheetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: RADII.lg,
  },
  sheetBadgeBook: { fontFamily: FONTS.display, fontSize: 22, color: '#4A2F12' },
  sheetBadgeDivider: { width: 1.5, height: 26, backgroundColor: 'rgba(74,47,18,0.35)' },
  sheetBadgeChapter: { fontFamily: FONTS.display, fontSize: 22, color: '#4A2F12' },
  verseBox: { marginTop: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  verseText: { fontFamily: FONTS.serif, fontSize: 15.5, lineHeight: 24 },
  verseNum: { fontFamily: FONTS.sansExtra, fontSize: 12 },
  closeBtn: { marginTop: 18, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontFamily: FONTS.sansExtra, fontSize: 15 },
});
