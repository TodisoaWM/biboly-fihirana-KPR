import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { Book, BOOKS, getBook, getChapter, normalize } from '@/data/bible';
import { GRID_GAP, gridCellSize } from '@/lib/grid';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

type Step = 'chapter' | 'v1' | 'v2';

export default function PickerScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/baiboly');
  const { width } = useWindowDimensions();
  const cell = gridCellSize(width);

  const [bookCode, setBookCode] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState<number | null>(null);
  const [v1, setV1] = useState<number | null>(null);
  const [v2, setV2] = useState<number | null>(null);

  const book = bookCode ? getBook(bookCode) : null;

  // Nombre d'andininy du chapitre choisi (dernier numéro de verset réel).
  const verseMax = useMemo(() => {
    if (!book || chapter == null) return 0;
    const verses = getChapter(book.code, chapter).verses;
    return verses.length ? verses[verses.length - 1].n : 0;
  }, [book, chapter]);

  const reset = () => {
    setChapter(null);
    setV1(null);
    setV2(null);
  };
  const toBooks = () => {
    setBookCode(null);
    reset();
    setQuery('');
  };

  // Étape courante : on choisit d'abord le toko, puis v1, puis v2.
  const step: Step = chapter == null ? 'chapter' : v1 == null ? 'v1' : 'v2';

  const pick = (n: number) => {
    if (step === 'chapter') {
      setChapter(n);
      setV1(null);
      setV2(null);
    } else if (step === 'v1') {
      setV1(n);
      setV2(null);
    } else {
      setV2(n);
    }
  };

  // Le ✕ efface le dernier élément choisi (v2 → v1 → toko → retour aux livres).
  const stepBack = () => {
    if (v2 != null) setV2(null);
    else if (v1 != null) setV1(null);
    else if (chapter != null) setChapter(null);
    else toBooks();
  };

  const read = () => {
    if (!book || chapter == null) return;
    let ref = `${book.code} ${chapter}`;
    if (v1 != null) ref += `.${v1}` + (v2 != null && v2 > v1 ? `-${v2}` : '');
    router.push({ pathname: '/passage', params: { ref } });
  };

  // ─────────────── Étape 1 : choix du livre ───────────────
  if (!book) {
    const q = normalize(query);
    const match = (b: Book) => !q || normalize(b.name).includes(q) || normalize(b.code).includes(q);
    const tt = BOOKS.filter((b) => b.testament === 'TT' && match(b));
    const tv = BOOKS.filter((b) => b.testament === 'TV' && match(b));

    const Row = (b: Book) => (
      <Pressable
        key={b.code}
        onPress={() => {
          setBookCode(b.code);
          reset();
        }}
        style={({ pressed }) => [styles.bookRow, { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
      >
        <View style={[styles.bookNum, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.bookNumText, { color: theme.textMuted }]}>{b.id}</Text>
        </View>
        <Text style={[styles.bookName, { color: theme.text }]} numberOfLines={1}>{b.name}</Text>
        <Text style={[styles.bookCh, { color: theme.textFaint }]} numberOfLines={1}>{b.chapters} {t('chapters_lc')}</Text>
        <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
      </Pressable>
    );

    return (
      <Screen>
        <View style={styles.header}>
          <View style={styles.leftCluster}>
            <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
            </Pressable>
            <HomeButton />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{t('choose_book')}</Text>
          <ProfileButton />
        </View>

        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="search" size={18} color={theme.textFaint} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_book_ph')}
            placeholderTextColor={theme.textFaint}
            style={[styles.searchInput, { color: theme.text }]}
          />
        </View>

        <ScrollView contentContainerStyle={styles.bookList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {tt.length > 0 && <Text style={[styles.section, { color: theme.primary }]}>{t('ot')}</Text>}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>{tt.map(Row)}</View>
          {tv.length > 0 && <Text style={[styles.section, { color: theme.primary, marginTop: 20 }]}>{t('nt')}</Text>}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>{tv.map(Row)}</View>
        </ScrollView>
      </Screen>
    );
  }

  // ─────────────── Étape 2 : grille des toko / andininy ───────────────
  // Numéros affichés selon l'étape.
  const numbers: number[] =
    step === 'chapter'
      ? Array.from({ length: book.chapters }, (_, i) => i + 1)
      : step === 'v1'
        ? Array.from({ length: verseMax }, (_, i) => i + 1)
        : // v2 : de v1+1 jusqu'au dernier andininy
          Array.from({ length: Math.max(0, verseMax - (v1 ?? 0)) }, (_, i) => (v1 ?? 0) + 1 + i);

  const gridLabel =
    step === 'chapter' ? t('pick_chapter_label') : step === 'v1' ? t('pick_verse_label') : t('pick_upto_label');

  // Libellé de la puce : « Matio 3 : 4 - 13 »
  const chip =
    book.name +
    (chapter != null ? ` ${chapter}` : '') +
    (v1 != null ? ` : ${v1}` : '') +
    (v2 != null ? ` - ${v2}` : '');

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={toBooks} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{t('chapter_verse')}</Text>
        <View style={{ width: 88 }} />
      </View>

      <View style={styles.pickerBody}>
        {/* Puce de sélection courante + effacer */}
        <View style={styles.displayRow}>
          <View style={[styles.display, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
            <Icon name="book" size={18} color={theme.primary} strokeWidth={1.8} />
            <Text style={[styles.chipText, { color: theme.text }]} numberOfLines={1}>
              {chip}
            </Text>
          </View>
          <Pressable onPress={stepBack} style={[styles.xBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} hitSlop={6}>
            <Text style={[styles.xText, { color: theme.textMuted }]}>✕</Text>
          </Pressable>
        </View>

        <Text style={[styles.gridLabel, { color: theme.text }]}>{gridLabel}</Text>

        <ScrollView contentContainerStyle={styles.gridScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {numbers.map((n) => (
              <Pressable
                key={n}
                onPress={() => pick(n)}
                style={({ pressed }) => [
                  styles.cell,
                  { width: cell, height: cell, backgroundColor: theme.surfaceAlt, borderColor: theme.border, opacity: pressed ? 0.55 : 1 },
                ]}
              >
                <Text style={[styles.cellText, { color: theme.text }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          {step === 'v1' && (
            <Text style={[styles.optional, { color: theme.textFaint }]}>{t('pick_optional_verse')}</Text>
          )}
        </ScrollView>

        {/* Lire : toko entier, un andininy, ou une plage — selon la sélection */}
        <Pressable
          onPress={read}
          style={({ pressed }) => [styles.okBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }, cardShadow(theme.primary, 'md')]}
        >
          <Icon name="book" size={19} color={theme.onPrimary} strokeWidth={1.9} />
          <Text style={[styles.okText, { color: theme.onPrimary }]}>{t('read_btn')}</Text>
        </Pressable>
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
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.display, fontSize: 21 },
  // book step
  search: {
    marginHorizontal: SPACING.xl,
    marginTop: 6,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, fontFamily: FONTS.sansSemi, fontSize: 15, paddingVertical: 0 },
  bookList: { paddingHorizontal: SPACING.xl, paddingTop: 14, paddingBottom: SPACING.xl },
  section: { fontFamily: FONTS.sansExtra, fontSize: 12, letterSpacing: 0.6, marginBottom: 10 },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16 },
  bookRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  bookNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bookNumText: { fontFamily: FONTS.sansExtra, fontSize: 12 },
  bookName: { fontFamily: FONTS.sansBold, fontSize: 15, flex: 1 },
  bookCh: { fontFamily: FONTS.sansSemi, fontSize: 11 },
  // grid step
  pickerBody: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 10 },
  displayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  display: {
    flex: 1,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chipText: { fontFamily: FONTS.display, fontSize: 22, flexShrink: 1 },
  xBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  xText: { fontFamily: FONTS.sansBold, fontSize: 20 },
  gridLabel: { fontFamily: FONTS.display, fontSize: 20, marginTop: 18, marginBottom: 4 },
  gridScroll: { paddingTop: 8, paddingBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, justifyContent: 'flex-start' },
  cell: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontFamily: FONTS.display, fontSize: 17 },
  optional: { fontFamily: FONTS.sansSemi, fontSize: 12.5, textAlign: 'center', marginTop: 18 },
  okBtn: {
    marginTop: 10,
    marginBottom: 6,
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  okText: { fontFamily: FONTS.sansExtra, fontSize: 18, letterSpacing: 1 },
});
