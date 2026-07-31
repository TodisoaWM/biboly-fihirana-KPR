import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { collectionName, COLLECTIONS, getHymn, placeIn, RECENT_HYMN_ID, stanzaPreview } from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { useRecents } from '@/lib/recents';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function FihiranaScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const recents = useRecents();
  const lastHymn = recents.find((r) => r.type === 'hymn');
  const recent = getHymn(lastHymn?.id ?? RECENT_HYMN_ID) ?? getHymn(RECENT_HYMN_ID);
  const recentColl = lastHymn && lastHymn.type === 'hymn' ? lastHymn.collectionKey : recent ? placeIn(recent).c : 'ffpm';
  const recentPage = lastHymn && lastHymn.type === 'hymn' ? lastHymn.page : recent ? placeIn(recent).p : 0;

  const protestanta = COLLECTIONS.filter((c) => c.tradition === 'protestanta');
  const katolika = COLLECTIONS.filter((c) => c.tradition === 'katolika');

  const openCollection = (key: string) => router.push({ pathname: '/hymns', params: { collection: key } });

  const CollectionCard = ({ name, count, accent, k }: { name: string; count: number; accent: string; k: string }) => (
    <Pressable
      onPress={() => openCollection(k)}
      style={({ pressed }) => [
        styles.coll,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
        cardShadow(theme.shadow, 'sm'),
      ]}
    >
      <View style={[styles.collIcon, { backgroundColor: accent }]}>
        <Icon name="music" size={18} color={theme.onPrimary} strokeWidth={1.9} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.collName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.collCount, { color: theme.textFaint }]}>{count} {t('songs_lc')}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
    </Pressable>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Fihirana</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('hymns_subtitle')}</Text>
          </View>
          <ProfileButton />
        </View>

        <Pressable
          onPress={() => router.push('/search')}
          style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}
        >
          <Icon name="search" size={19} color={theme.textFaint} strokeWidth={2} />
          <Text style={[styles.searchPlaceholder, { color: theme.textFaint }]}>{t('search_hymn_ph')}</Text>
        </Pressable>

        {recent && (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('recently_opened')}</Text>
              <Pressable onPress={() => router.push('/recents')} hitSlop={6}>
                <Text style={[styles.seeAll, { color: theme.accent }]}>{t('see_all')}</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.push({ pathname: '/hymn', params: { id: recent.id, c: recentColl } })}>
              <LinearGradient
                colors={[theme.cardTealFrom, theme.cardTealTo]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={[styles.recent, { borderColor: theme.border }, cardShadow(theme.shadow, 'lg')]}
              >
                <View style={[styles.badge, { backgroundColor: theme.teal }]}>
                  <Text style={styles.badgeText}>{collectionName(recentColl)} {recentPage}</Text>
                </View>
                <Text style={[styles.recentTitle, { color: theme.text }]}>{recent.title}</Text>
                <Text style={[styles.stanza, { color: theme.verse }]}>{stanzaPreview(recent)}</Text>
                <View style={[styles.playBtn, { backgroundColor: theme.primary }, cardShadow(theme.primary, 'md')]}>
                  <Icon name="arrow-right" size={22} color={theme.onPrimary} strokeWidth={2.2} />
                </View>
              </LinearGradient>
            </Pressable>
          </>
        )}

        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('protestant')}</Text>
        {protestanta.map((c) => (
          <CollectionCard key={c.key} k={c.key} name={c.name} count={c.count} accent={theme.teal} />
        ))}

        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('catholic')}</Text>
        {katolika.map((c) => (
          <CollectionCard key={c.key} k={c.key} name={c.name} count={c.count} accent={theme.accent} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACING.xl, paddingTop: 12, paddingBottom: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  title: { fontFamily: FONTS.display, fontSize: 29, marginTop: 6 },
  subtitle: { fontFamily: FONTS.sansSemi, fontSize: 13, marginTop: 3 },
  search: {
    marginTop: 16,
    height: 48,
    borderRadius: RADII.md,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
  },
  searchPlaceholder: { fontFamily: FONTS.sansSemi, fontSize: 14 },
  sectionLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seeAll: { fontFamily: FONTS.sansExtra, fontSize: 11.5, marginTop: 20 },
  recent: { borderRadius: RADII.xl, padding: 22, overflow: 'hidden', borderWidth: 1 },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADII.pill },
  badgeText: { color: '#fff', fontFamily: FONTS.sansExtra, fontSize: 11 },
  recentTitle: { fontFamily: FONTS.display, fontSize: 22, lineHeight: 26, marginTop: 12 },
  stanza: { fontFamily: FONTS.serif, fontSize: 14, lineHeight: 24, marginTop: 14, maxWidth: '82%' },
  playBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  collIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  collName: { fontFamily: FONTS.sansExtra, fontSize: 15 },
  collCount: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 1 },
});
