import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FavButton } from '@/components/FavButton';
import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { TextSizeControl } from '@/components/TextSizeControl';
import { getBook, getChapter } from '@/data/bible';
import { useI18n } from '@/lib/i18n';
import { addBibleRecent } from '@/lib/recents';
import { FONTS, RADII } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

export default function ReadingScreen() {
  const { theme, fontScale } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ book?: string; chapter?: string; v?: string; vEnd?: string }>();

  const bookCode = params.book ?? 'Eks';
  const chapter = Math.max(1, parseInt(params.chapter ?? '32', 10) || 1);
  const book = getBook(bookCode);
  const content = getChapter(bookCode, chapter);

  const vStart = params.v ? parseInt(params.v, 10) : null;
  const vEnd = params.vEnd ? parseInt(params.vEnd, 10) : vStart;

  const maxChapter = book?.chapters ?? chapter;
  const hasPrev = chapter > 1;
  const hasNext = chapter < maxChapter;

  useEffect(() => {
    if (book) addBibleRecent(`${book.code} ${chapter}`, `${book.name} ${chapter}`);
  }, [book, chapter]);

  const scrollRef = useRef<ScrollView>(null);
  const startVerseRef = useRef<View>(null);

  // Défile vers le 1er verset choisi. onLayout n'est pas fiable ici (RN Web),
  // donc : sur le web on localise le verset par son id DOM ; sur natif on
  // mesure via measureLayout. On réessaie tant que le nœud n'est pas prêt.
  useEffect(() => {
    if (vStart == null) return;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      const sv: any = scrollRef.current;
      if (Platform.OS === 'web') {
        const node: any = sv?.getScrollableNode?.();
        const el = typeof document !== 'undefined' ? document.getElementById(`v-${vStart}`) : null;
        if (node && el) {
          const top = el.getBoundingClientRect().top - node.getBoundingClientRect().top + node.scrollTop;
          node.scrollTop = Math.max(0, top - 20);
          clearInterval(id);
        }
      } else {
        const inner = sv?.getInnerViewNode?.() ?? sv?.getScrollableNode?.();
        const view: any = startVerseRef.current;
        if (view && inner && view.measureLayout) {
          view.measureLayout(
            inner,
            (_x: number, y: number) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true }),
            () => {},
          );
          clearInterval(id);
        }
      }
      if (tries > 20) clearInterval(id);
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookCode, chapter, vStart, vEnd]);

  const goto = (c: number) =>
    router.replace({ pathname: '/reading', params: { book: bookCode, chapter: String(c) } });
  const clearSelection = () =>
    router.replace({ pathname: '/reading', params: { book: bookCode, chapter: String(chapter) } });
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const verseSize = 16.5 * fontScale;
  const rangeLabel =
    vStart != null ? `${t('verses')} ${vStart}${vEnd != null && vEnd !== vStart ? `–${vEnd}` : ''}` : null;

  return (
    <Screen edges={['top']}>
      {/* Barre supérieure */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <Pressable style={styles.topCenter} onPress={() => router.push({ pathname: '/chapters', params: { book: bookCode } })}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[styles.bookTitle, { color: theme.text }]}
          >
            {book?.name ?? bookCode} {chapter}
          </Text>
          <Text numberOfLines={1} style={[styles.bookSub, { color: theme.textFaint }]}>
            {(book ? (book.testament === 'TT' ? t('ot') : t('nt')) : '').toUpperCase()} · {t('chapter_word')} {chapter}
          </Text>
        </Pressable>
        <View style={styles.rightCluster}>
          <FavButton fav={{ type: 'bible', ref: `${bookCode} ${chapter}`, label: `${book?.name ?? bookCode} ${chapter}` }} />
          <ProfileButton />
        </View>
      </View>

      {/* Bandeau « versets choisis » */}
      {rangeLabel && (
        <View style={[styles.refBanner, { backgroundColor: theme.chipBg }]}>
          <Icon name="bookmark" size={14} color={theme.chipText} strokeWidth={1.9} />
          <Text style={[styles.refBannerText, { color: theme.chipText }]}>{rangeLabel}</Text>
          <Pressable onPress={clearSelection} hitSlop={8} style={styles.refClear}>
            <Text style={[styles.refClearText, { color: theme.chipText }]}>{t('whole_chapter')} ✕</Text>
          </Pressable>
        </View>
      )}

      {/* Texte */}
      <View style={{ flex: 1 }}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.readContent} showsVerticalScrollIndicator={false}>
          {content.verses.map((v) => {
            const hi = vStart != null && v.n >= vStart && v.n <= (vEnd ?? vStart);
            const isStart = vStart != null && v.n === vStart;
            return (
              <View key={v.n} nativeID={`v-${v.n}`} ref={isStart ? startVerseRef : undefined}>
                {v.headings?.map((h, i) => (
                  <Text key={i} style={[styles.heading, { color: theme.primary }]}>
                    {h}
                  </Text>
                ))}
                <View style={hi ? [styles.hiWrap, { backgroundColor: theme.chipBg, borderLeftColor: theme.primary }] : styles.plainWrap}>
                  <Text style={[styles.verse, { color: hi ? theme.text : theme.verse, fontSize: verseSize, lineHeight: verseSize * 1.85 }]}>
                    <Text style={[styles.verseNum, { color: hi ? theme.primary : theme.accent }]}>{v.n} </Text>
                    {v.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <LinearGradient colors={['transparent', theme.bg]} style={styles.fade} pointerEvents="none" />
      </View>

      {/* Barre de navigation de chapitre */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <Pressable
          disabled={!hasPrev}
          onPress={() => goto(chapter - 1)}
          style={[styles.navChip, { backgroundColor: theme.surfaceAlt, opacity: hasPrev ? 1 : 0.4 }]}
        >
          <Icon name="chevron-left" size={16} color={theme.textMuted} strokeWidth={2.1} />
          <Text style={[styles.navChipText, { color: theme.textMuted }]} numberOfLines={1}>
            {book?.name} {chapter - 1}
          </Text>
        </Pressable>

        <TextSizeControl />

        <Pressable
          disabled={!hasNext}
          onPress={() => goto(chapter + 1)}
          style={[styles.navChip, { backgroundColor: theme.tabActiveBg, opacity: hasNext ? 1 : 0.4 }]}
        >
          <Text style={[styles.navChipText, { color: theme.text }]} numberOfLines={1}>
            {book?.name} {chapter + 1}
          </Text>
          <Icon name="chevron-right" size={16} color={theme.text} strokeWidth={2.1} />
        </Pressable>
      </View>
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
  },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topCenter: { alignItems: 'center', flex: 1 },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookTitle: { fontFamily: FONTS.display, fontSize: 21 },
  bookSub: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  refBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADII.pill,
  },
  refBannerText: { fontFamily: FONTS.sansExtra, fontSize: 12.5, flex: 1 },
  refClear: {},
  refClearText: { fontFamily: FONTS.sansBold, fontSize: 11.5 },
  readContent: { paddingHorizontal: 26, paddingTop: 18, paddingBottom: 40 },
  heading: { fontFamily: FONTS.sansBold, fontSize: 12, letterSpacing: 0.8, marginTop: 6, marginBottom: 12, textTransform: 'uppercase' },
  plainWrap: {},
  hiWrap: {
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 10,
    paddingVertical: 8,
    marginBottom: 6,
    marginTop: 2,
  },
  verse: { fontFamily: FONTS.serif, marginBottom: 13 },
  verseNum: { fontFamily: FONTS.sansBold, fontSize: 12 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 130,
  },
  navChipText: { fontFamily: FONTS.sansBold, fontSize: 12.5, flexShrink: 1 },
  centerIcons: { flexDirection: 'row', alignItems: 'center', gap: 14 },
});
