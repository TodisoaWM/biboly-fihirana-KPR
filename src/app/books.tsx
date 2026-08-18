import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { BOOKS, Book, normalize } from '@/data/bible';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function BooksScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/baiboly');

  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const q = normalize(query);
  const match = (b: Book) => !q || normalize(b.name).includes(q) || normalize(b.code).includes(q);
  const tt = BOOKS.filter((b) => b.testament === 'TT' && match(b));
  const tv = BOOKS.filter((b) => b.testament === 'TV' && match(b));

  const openBook = (b: Book) => router.push({ pathname: '/chapters', params: { book: b.code } });
  const toggleSearch = () => {
    if (searching) {
      setSearching(false);
      setQuery('');
    } else setSearching(true);
  };

  const renderRow = (b: Book) => (
    <Pressable
      key={b.id}
      onPress={() => openBook(b)}
      style={({ pressed }) => [styles.row, { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 }]}
    >
      <View style={[styles.num, { backgroundColor: theme.surfaceAlt }]}>
        <Text style={[styles.numText, { color: theme.textMuted }]}>{b.id}</Text>
      </View>
      <Text style={[styles.bookName, { color: theme.text }]} numberOfLines={1}>{b.name}</Text>
      <Text style={[styles.chapters, { color: theme.textFaint }]} numberOfLines={1}>{b.chapters} {t('chapters_lc')}</Text>
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

        {searching ? (
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder={t('search_book_ph')}
            placeholderTextColor={theme.textFaint}
            style={[styles.searchInput, { color: theme.text, borderBottomColor: theme.primary }]}
          />
        ) : (
          <Text style={[styles.title, { color: theme.text }]}>{t('tab_bible')}</Text>
        )}

        <View style={styles.rightCluster}>
          <Pressable
            onPress={() => router.push('/picker')}
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            accessibilityLabel={t('chapter_verse')}
          >
            <Icon name="book-search" size={23} color={theme.primary} strokeWidth={1.7} />
          </Pressable>
          <Pressable onPress={toggleSearch} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {searching ? (
              <Text style={[styles.closeX, { color: theme.text }]}>✕</Text>
            ) : (
              <Icon name="search" size={18} color={theme.text} strokeWidth={2} />
            )}
          </Pressable>
          <ProfileButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tt.length > 0 && (
          <>
            <Text style={[styles.section, { color: theme.primary }]}>{t('ot')}</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow)]}>{tt.map(renderRow)}</View>
          </>
        )}
        {tv.length > 0 && (
          <>
            <Text style={[styles.section, { color: theme.primary, marginTop: tt.length ? 22 : 0 }]}>{t('nt')}</Text>
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow)]}>{tv.map(renderRow)}</View>
          </>
        )}
        {tt.length === 0 && tv.length === 0 && <Text style={[styles.empty, { color: theme.textFaint }]}>{t('no_results')}</Text>}
      </ScrollView>
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
    gap: 12,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closeX: { fontFamily: FONTS.sansBold, fontSize: 17 },
  title: { flex: 1, fontFamily: FONTS.display, fontSize: 21 },
  searchInput: { flex: 1, fontFamily: FONTS.sansSemi, fontSize: 16, paddingVertical: 4, borderBottomWidth: 2 },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  section: { fontFamily: FONTS.sansExtra, fontSize: 12, letterSpacing: 0.6, marginBottom: 10 },
  card: {
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: FONTS.sansExtra, fontSize: 12 },
  bookName: { fontFamily: FONTS.sansBold, fontSize: 15, flex: 1 },
  chapters: { fontFamily: FONTS.sansSemi, fontSize: 11 },
  empty: { fontFamily: FONTS.sansSemi, fontSize: 14, textAlign: 'center', marginTop: 40 },
});
