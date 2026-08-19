import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import {
  COLLECTIONS,
  getHymn,
  hymnRef,
  stanzaPreview,
  suggestHymns,
  type HymnSuggestion,
} from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

function CollectionCard({ name, count, accent, k }: { name: string; count: number; accent: string; k: string }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/hymns', params: { collection: k } })}
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
        <Text style={[styles.collName, { color: theme.text }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.collCount, { color: theme.textFaint }]}>{count} {t('songs_lc')}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
    </Pressable>
  );
}

function SuggestionCard({ s, gradient, badgeBg }: { s: HymnSuggestion; gradient: [string, string]; badgeBg: string }) {
  const { theme } = useTheme();
  const router = useRouter();
  const hymn = getHymn(s.id);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/hymn', params: { id: s.id, c: s.collectionKey, p: String(s.page) } })}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.suggest, { borderColor: theme.border }, cardShadow(theme.shadow, 'md')]}
      >
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={styles.badgeText} numberOfLines={1}>{hymnRef(s.tradition, s.collectionKey, s.page)}</Text>
        </View>
        <Text style={[styles.suggestTitle, { color: theme.text }]} numberOfLines={2}>
          {s.title}
        </Text>
        {hymn ? (
          <Text style={[styles.stanza, { color: theme.verse }]} numberOfLines={2}>
            {stanzaPreview(hymn)}
          </Text>
        ) : null}
        <View style={[styles.playBtn, { backgroundColor: theme.primary }, cardShadow(theme.primary, 'md')]}>
          <Icon name="arrow-right" size={20} color={theme.onPrimary} strokeWidth={2.2} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function FihiranaScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const suggestions = suggestHymns();

  const protestanta = COLLECTIONS.filter((c) => c.tradition === 'protestanta');
  const katolika = COLLECTIONS.filter((c) => c.tradition === 'katolika');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Fihirana</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('hymns_subtitle')}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/recents')}
            style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            accessibilityLabel={t('recent_readings')}
          >
            <Icon name="bookmark" size={19} color={theme.accent} strokeWidth={1.9} />
          </Pressable>
          <ProfileButton />
        </View>

        <Pressable
          onPress={() => router.push('/search')}
          style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}
        >
          <Icon name="search" size={19} color={theme.textFaint} strokeWidth={2} />
          <Text style={[styles.searchPlaceholder, { color: theme.textFaint }]}>{t('search_hymn_ph')}</Text>
        </Pressable>

        {/* Proposition du jour : un chant protestant + un chant catholique */}
        {(suggestions.protestanta || suggestions.katolika) && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{t('song_suggestion')}</Text>
            {suggestions.protestanta && (
              <SuggestionCard s={suggestions.protestanta} gradient={[theme.cardTealFrom, theme.cardTealTo]} badgeBg={theme.teal} />
            )}
            {suggestions.katolika && (
              <SuggestionCard s={suggestions.katolika} gradient={[theme.cardPinkFrom, theme.cardPinkTo]} badgeBg={theme.accent} />
            )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
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
  suggest: { borderRadius: RADII.xl, padding: 20, overflow: 'hidden', borderWidth: 1, marginBottom: 12 },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADII.pill },
  badgeText: { color: '#fff', fontFamily: FONTS.sansExtra, fontSize: 11 },
  suggestTitle: { fontFamily: FONTS.display, fontSize: 20, lineHeight: 25, marginTop: 12, maxWidth: '80%' },
  stanza: { fontFamily: FONTS.serif, fontSize: 13.5, lineHeight: 22, marginTop: 10, maxWidth: '80%' },
  playBtn: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 46,
    height: 46,
    borderRadius: 23,
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
