import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { getBook } from '@/data/bible';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { GRID_GAP, gridCellSize } from '@/lib/grid';
import { FONTS, HEADER, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function ChaptersScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/books');
  const { width } = useWindowDimensions();
  const cell = gridCellSize(width);
  const { book: bookCode } = useLocalSearchParams<{ book?: string }>();
  const book = getBook(bookCode ?? 'Gen');
  const count = book?.chapters ?? 1;
  const chapters = Array.from({ length: count }, (_, i) => i + 1);

  const open = (c: number) =>
    router.push({ pathname: '/reading', params: { book: book?.code ?? 'Gen', chapter: String(c) } });

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <View style={styles.headerCenter}>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.title, { color: theme.text }]}>
            {book?.name ?? bookCode}
          </Text>
          <Text numberOfLines={1} style={[styles.sub, { color: theme.textFaint }]}>
            {(book ? (book.testament === 'TT' ? t('ot') : t('nt')) : '').toUpperCase()} · {count} {t('chapters_uc')}
          </Text>
        </View>
        <ProfileButton />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {chapters.map((c) => (
            <Pressable
              key={c}
              onPress={() => open(c)}
              style={({ pressed }) => [
                styles.cell,
                { width: cell, height: cell, backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
                cardShadow(theme.shadow, 'sm'),
              ]}
            >
              <Text style={[styles.cellText, { color: theme.text }]}>{c}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: HEADER.pad,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: { width: HEADER.btn, height: HEADER.btn, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: HEADER.gap, flexShrink: 0 },
  headerCenter: { alignItems: 'center', flex: 1, minWidth: 0, paddingHorizontal: 6 },
  title: { fontFamily: FONTS.display, fontSize: HEADER.title },
  sub: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  content: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, paddingBottom: SPACING.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP, justifyContent: 'flex-start' },
  cell: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontFamily: FONTS.display, fontSize: 17 },
});
