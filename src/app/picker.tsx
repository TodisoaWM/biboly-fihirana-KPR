import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { Book, BOOKS, getBook, normalize } from '@/data/bible';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

type Field = 'chapter' | 'v1' | 'v2';

export default function PickerScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/baiboly');

  const [bookCode, setBookCode] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [active, setActive] = useState<Field>('chapter');
  const [error, setError] = useState('');

  const book = bookCode ? getBook(bookCode) : null;

  const reset = () => {
    setChapter('');
    setV1('');
    setV2('');
    setActive('chapter');
    setError('');
  };
  const toBooks = () => {
    setBookCode(null);
    reset();
  };

  const get = (f: Field) => (f === 'chapter' ? chapter : f === 'v1' ? v1 : v2);
  const set = (f: Field, val: string) => (f === 'chapter' ? setChapter(val) : f === 'v1' ? setV1(val) : setV2(val));

  const pressDigit = (d: string) => {
    setError('');
    const cur = get(active);
    if (cur.length >= 3) return;
    set(active, cur + d);
  };

  const advance = () => {
    setError('');
    if (active === 'chapter' && chapter) setActive('v1');
    else if (active === 'v1') setActive('v2');
  };

  const pressDelete = () => {
    setError('');
    const cur = get(active);
    if (cur.length > 0) {
      set(active, cur.slice(0, -1));
    } else if (active === 'v2') setActive('v1');
    else if (active === 'v1') setActive('chapter');
    else toBooks(); // rien à supprimer sur le chapitre → retour au choix du livre
  };

  const validate = () => {
    if (!book || !chapter) return setError(t('err_chapter'));
    const ch = parseInt(chapter, 10);
    if (ch < 1 || ch > book.chapters) return setError(`${t('chapter_word')} 1–${book.chapters}`);
    let ref = `${book.code} ${ch}`;
    if (v1) ref += `.${v1}` + (v2 ? `-${v2}` : '');
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
        <Text style={[styles.bookName, { color: theme.text }]}>{b.name}</Text>
        <Text style={[styles.bookCh, { color: theme.textFaint }]}>{b.chapters} {t('chapters_lc')}</Text>
        <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
      </Pressable>
    );

    return (
      <Screen>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
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

  // ─────────────── Étape 2 : pavé numérique ───────────────
  const Slot = ({ f, val, placeholder }: { f: Field; val: string; placeholder: string }) => (
    <Pressable onPress={() => setActive(f)}>
      <Text
        style={[
          styles.slot,
          { color: val ? theme.text : theme.textFaint },
          active === f && { color: theme.primary, borderBottomColor: theme.primary, borderBottomWidth: 2 },
        ]}
      >
        {val || placeholder}
      </Text>
    </Pressable>
  );

  const Key = ({ label, onPress, kind }: { label: string; onPress: () => void; kind?: 'del' | 'next' }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: kind === 'next' ? theme.tabActiveBg : theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
        cardShadow(theme.shadow, 'sm'),
      ]}
    >
      <Text
        style={[
          styles.keyText,
          kind === 'del' && styles.keyTextSmall,
          { color: kind === 'del' ? theme.accent : kind === 'next' ? theme.primary : theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={toBooks} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{t('chapter_verse')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.pickerBody}>
        {/* Champ d'affichage */}
        <View style={styles.displayRow}>
          <View style={[styles.display, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
            <Text style={[styles.bookLabel, { color: theme.text }]} numberOfLines={1}>
              {book.name}
            </Text>
            <View style={styles.slots}>
              <Slot f="chapter" val={chapter} placeholder="—" />
              <Text style={[styles.sep, { color: theme.textFaint }]}>:</Text>
              <Slot f="v1" val={v1} placeholder="—" />
              <Text style={[styles.sep, { color: theme.textFaint }]}>-</Text>
              <Slot f="v2" val={v2} placeholder="—" />
            </View>
          </View>
          <Pressable onPress={toBooks} style={styles.xBtn} hitSlop={8}>
            <Text style={[styles.xText, { color: theme.textMuted }]}>✕</Text>
          </Pressable>
        </View>

        <Text style={[styles.hint, { color: error ? theme.accent : theme.textFaint }]}>
          {error ||
            (active === 'chapter'
              ? t('hint_chapter')
              : active === 'v1'
                ? t('hint_v1')
                : t('hint_v2'))}
        </Text>

        {/* Pavé */}
        <View style={styles.pad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
            <Key key={d} label={d} onPress={() => pressDigit(d)} />
          ))}
          <Key label="→" onPress={advance} kind="next" />
          <Key label="AMAFA" onPress={pressDelete} kind="del" />
        </View>

        <Pressable
          onPress={validate}
          style={({ pressed }) => [styles.okBtn, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }, cardShadow(theme.primary, 'md')]}
        >
          <Text style={[styles.okText, { color: theme.onPrimary }]}>OK</Text>
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
  // keypad step
  pickerBody: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 10 },
  displayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  display: { flex: 1, borderRadius: RADII.pill, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookLabel: { fontFamily: FONTS.display, fontSize: 22, flexShrink: 1 },
  slots: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  slot: { fontFamily: FONTS.display, fontSize: 24, minWidth: 24, textAlign: 'center' },
  sep: { fontFamily: FONTS.display, fontSize: 22 },
  xBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  xText: { fontFamily: FONTS.sansBold, fontSize: 22 },
  hint: { fontFamily: FONTS.sansSemi, fontSize: 12.5, textAlign: 'center', marginTop: 14 },
  pad: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  key: {
    width: '22%',
    aspectRatio: 1.35,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontFamily: FONTS.sansExtra, fontSize: 22 },
  keyTextSmall: { fontSize: 13, letterSpacing: 0.5 },
  okBtn: { marginTop: 14, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  okText: { fontFamily: FONTS.sansExtra, fontSize: 18, letterSpacing: 1 },
});

