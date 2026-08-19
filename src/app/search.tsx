import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { getBook, parseReference, searchBooks, searchVerses } from '@/data/bible';
import { hymnRef, searchHymns } from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { useToast } from '@/lib/toast';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

function Label({ children }: { children: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.label, { color: theme.textFaint }]}>{children}</Text>;
}

export default function SearchScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/(tabs)');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const reference = useMemo(() => parseReference(query), [query]);
  const books = useMemo(() => searchBooks(query), [query]);
  const hymns = useMemo(() => searchHymns(query), [query]);
  const verses = useMemo(() => searchVerses(debounced), [debounced]);

  const refBook = reference ? getBook(reference.bookCode) : undefined;
  const hasAny = reference || books.length || hymns.length || verses.length;

  // Notification « introuvable » quand une recherche aboutie ne renvoie rien.
  const toast = useToast();
  useEffect(() => {
    if (debounced.trim().length >= 2 && !hasAny) toast.notFound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const rowStyle = ({ pressed }: { pressed: boolean }) => [
    styles.row,
    { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
    cardShadow(theme.shadow, 'sm'),
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Icon name="search" size={18} color={theme.textFaint} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder={t('search_ph')}
            placeholderTextColor={theme.textFaint}
            style={[styles.input, { color: theme.text }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Text style={{ color: theme.textFaint, fontFamily: FONTS.sansBold }}>✕</Text>
            </Pressable>
          )}
        </View>
        <ProfileButton />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Référence directe */}
        {reference && refBook && (
          <>
            <Label>{t('go_to')}</Label>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/reading',
                  params: {
                    book: reference.bookCode,
                    chapter: String(reference.chapter),
                    ...(reference.verseStart ? { v: String(reference.verseStart) } : {}),
                    ...(reference.verseEnd ? { vEnd: String(reference.verseEnd) } : {}),
                  },
                })
              }
              style={rowStyle}
            >
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Icon name="book" size={17} color={theme.onPrimary} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
                  {refBook.name} {reference.chapter}
                  {reference.verseStart ? `:${reference.verseStart}${reference.verseEnd ? `-${reference.verseEnd}` : ''}` : ''}
                </Text>
                <Text style={[styles.rowSub, { color: theme.textMuted }]}>{t('read_chapter')}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
            </Pressable>
          </>
        )}

        {/* Livres */}
        {books.length > 0 && (
          <>
            <Label>{t('books_uc')}</Label>
            {books.map((b) => (
              <Pressable key={b.code} onPress={() => router.push({ pathname: '/chapters', params: { book: b.code } })} style={rowStyle}>
                <View style={[styles.badge, { backgroundColor: theme.chipBg }]}>
                  <Icon name="book" size={16} color={theme.chipText} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>{b.name}</Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>{b.chapters} {t('chapters_lc')}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
              </Pressable>
            ))}
          </>
        )}

        {/* Hira */}
        {hymns.length > 0 && (
          <>
            <Label>{t('songs_uc')}</Label>
            {hymns.map((h) => (
              <Pressable
                key={`${h.id}-${h.collectionKey}`}
                onPress={() => router.push({ pathname: '/hymn', params: { id: h.id, c: h.collectionKey, p: String(h.page) } })}
                style={rowStyle}
              >
                <View style={[styles.badge, { backgroundColor: '#F0BEBE' }]}>
                  <Icon name="music" size={16} color={theme.accent} strokeWidth={1.9} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
                    {h.title}
                  </Text>
                  <Text style={[styles.rowSub, { color: theme.textMuted }]}>{hymnRef(h.tradition, h.collectionKey, h.page)}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
              </Pressable>
            ))}
          </>
        )}

        {/* Versets (plein-texte) */}
        {verses.length > 0 && (
          <>
            <Label>{t('verses_uc')}</Label>
            {verses.map((v) => (
              <Pressable
                key={`${v.bookCode}-${v.chapter}-${v.verse}`}
                onPress={() =>
                  router.push({ pathname: '/reading', params: { book: v.bookCode, chapter: String(v.chapter), v: String(v.verse) } })
                }
                style={rowStyle}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ref, { color: theme.primary }]}>
                    {v.bookName} {v.chapter}:{v.verse}
                  </Text>
                  <Text style={[styles.verseText, { color: theme.verse }]} numberOfLines={2}>
                    {v.text}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {query.length > 0 && !hasAny && (
          <Text style={[styles.empty, { color: theme.textFaint }]}>{t('no_results')}</Text>
        )}
        {query.length === 0 && (
          <Text style={[styles.hint, { color: theme.textFaint }]}>{t('search_hint')}</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBox: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, fontFamily: FONTS.sansSemi, fontSize: 15, paddingVertical: 0 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  label: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1, marginTop: 18, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: FONTS.sansBold, fontSize: 15 },
  rowSub: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 2 },
  ref: { fontFamily: FONTS.sansExtra, fontSize: 12.5 },
  verseText: { fontFamily: FONTS.serif, fontSize: 14, lineHeight: 20, marginTop: 4 },
  empty: { fontFamily: FONTS.sansSemi, fontSize: 14, textAlign: 'center', marginTop: 40 },
  hint: { fontFamily: FONTS.sansSemi, fontSize: 13, textAlign: 'center', marginTop: 40, paddingHorizontal: 30, lineHeight: 20 },
});
