import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { collectionName, getCollection, getHymnsByCollection, HymnListItem } from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function HymnsScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/fihirana');
  const { collection } = useLocalSearchParams<{ collection?: string }>();
  const key = collection ?? 'ffpm';
  const coll = getCollection(key);
  const items = getHymnsByCollection(key);

  const renderItem = ({ item }: { item: HymnListItem }) => {
    const katolika = item.tradition === 'katolika';
    return (
      <Pressable
        onPress={() => router.push({ pathname: '/hymn', params: { id: item.id, c: key, p: String(item.page) } })}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
          cardShadow(theme.shadow, 'sm'),
        ]}
      >
        <View style={[styles.num, { backgroundColor: theme.chipBg }]}>
          <Text style={[styles.numText, { color: theme.chipText }]}>{katolika ? item.index : item.page}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.hTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {katolika && item.page > 0 && (
            <Text style={[styles.hPage, { color: theme.textFaint }]}>{t('page')} {item.page}</Text>
          )}
        </View>
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
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {collectionName(key)}
          </Text>
          <Text style={[styles.sub, { color: theme.textFaint }]}>
            {coll ? t(coll.tradition === 'katolika' ? 'catholic' : 'protestant') : ''} · {items.length} {t('songs_uc')}
          </Text>
        </View>
        <View style={styles.rightCluster}>
          <Pressable
            onPress={() => router.push({ pathname: '/hymnpicker', params: { collection: key } })}
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Icon name="format" size={18} color={theme.primary} strokeWidth={1.9} />
          </Pressable>
          <ProfileButton />
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => `${it.id}-${it.page}`}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
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
  headerCenter: { alignItems: 'center', flex: 1, paddingHorizontal: 8 },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.display, fontSize: 21 },
  sub: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  num: { minWidth: 42, height: 40, borderRadius: 12, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: FONTS.sansExtra, fontSize: 14 },
  hTitle: { fontFamily: FONTS.sansBold, fontSize: 14.5, lineHeight: 19 },
  hPage: { fontFamily: FONTS.sansSemi, fontSize: 11.5, marginTop: 2 },
});
