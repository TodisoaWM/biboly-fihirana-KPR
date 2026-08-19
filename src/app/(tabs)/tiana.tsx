import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { collectionName } from '@/data/fihirana';
import { clearFavorites, Fav, keyOf, removeFavorite, useFavorites } from '@/lib/favorites';
import { useI18n } from '@/lib/i18n';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

function Item({ f }: { f: Fav }) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const open = () => {
    if (f.type === 'bible') router.push({ pathname: '/passage', params: { ref: f.ref } });
    else router.push({ pathname: '/hymn', params: { id: f.id, c: f.collectionKey } });
  };

  const isBible = f.type === 'bible';
  return (
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
        <Pressable onPress={open} style={styles.rowMain}>
          <View style={[styles.rowIcon, { backgroundColor: isBible ? theme.chipBg : '#F0BEBE' }]}>
            <Icon name={isBible ? 'book' : 'music'} size={18} color={isBible ? theme.chipText : theme.accent} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
              {isBible ? f.label : f.title}
            </Text>
            <Text style={[styles.rowSub, { color: theme.textMuted }]} numberOfLines={1}>
              {isBible ? t('tab_bible') : `${collectionName(f.collectionKey)} ${f.page}`}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => removeFavorite(keyOf(f))} hitSlop={8} style={styles.del}>
          <Icon name="heart-filled" size={20} color={theme.accent} />
        </Pressable>
      </View>
  );
}

function Section({ label, list, section }: { label: string; list: Fav[]; section: 'bible' | 'protestanta' | 'katolika' }) {
  const { theme } = useTheme();
  const { t } = useI18n();

  if (!list.length) return null;
  return (
    <>
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{label}</Text>
        <Pressable onPress={() => clearFavorites(section)} hitSlop={6}>
          <Text style={[styles.clearBtn, { color: theme.accent }]}>{t('clear')}</Text>
        </Pressable>
      </View>
      {list.map((f) => (
        <Item key={keyOf(f)} f={f} />
      ))}
    </>
  );
}

export default function TianaScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const favs = useFavorites();

  const bible = favs.filter((f) => f.type === 'bible');
  const prot = favs.filter((f) => f.type === 'hymn' && f.tradition === 'protestanta');
  const kato = favs.filter((f) => f.type === 'hymn' && f.tradition === 'katolika');

  const empty = favs.length === 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>{t('tab_favorites')}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('favorites_sub')}</Text>
          </View>
          <ProfileButton />
        </View>

        {empty ? (
          <Text style={[styles.emptyText, { color: theme.textFaint }]}>{t('empty_favorites')}</Text>
        ) : (
          <>
            <Section label={t('sec_bible_fav')} list={bible} section="bible" />
            <Section label={t('sec_prot')} list={prot} section="protestanta" />
            <Section label={t('sec_kato')} list={kato} section="katolika" />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACING.xl, paddingTop: 12, paddingBottom: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: FONTS.display, fontSize: 29, marginTop: 6 },
  subtitle: { fontFamily: FONTS.sansSemi, fontSize: 13, marginTop: 3 },
  clearAll: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  sectionLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1 },
  clearBtn: { fontFamily: FONTS.sansExtra, fontSize: 11.5 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, marginBottom: 10, paddingRight: 6 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: FONTS.sansExtra, fontSize: 14.5 },
  rowSub: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 2 },
  del: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONTS.sansSemi, fontSize: 14, textAlign: 'center', marginTop: 50, paddingHorizontal: 40, lineHeight: 21 },
});
