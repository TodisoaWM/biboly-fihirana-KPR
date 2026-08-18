import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { collectionName } from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { clearRecents, keyOf, Recent, removeRecent, useRecents } from '@/lib/recents';
import { FONTS, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

export default function RecentsScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/baiboly');
  const recents = useRecents();

  const bible = recents.filter((r) => r.type === 'bible');
  const prot = recents.filter((r) => r.type === 'hymn' && r.tradition === 'protestanta');
  const kato = recents.filter((r) => r.type === 'hymn' && r.tradition === 'katolika');

  const open = (r: Recent) => {
    if (r.type === 'bible') router.push({ pathname: '/passage', params: { ref: r.ref } });
    else router.push({ pathname: '/hymn', params: { id: r.id, c: r.collectionKey } });
  };

  const Item = (r: Recent) => {
    const isBible = r.type === 'bible';
    return (
      <View key={keyOf(r)} style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
        <Pressable onPress={() => open(r)} style={styles.rowMain}>
          <View style={[styles.rowIcon, { backgroundColor: isBible ? theme.chipBg : '#F0BEBE' }]}>
            <Icon name={isBible ? 'book' : 'music'} size={18} color={isBible ? theme.chipText : theme.accent} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
              {isBible ? r.label : r.title}
            </Text>
            <Text style={[styles.rowSub, { color: theme.textMuted }]} numberOfLines={1}>
              {isBible ? t('tab_bible') : `${collectionName(r.collectionKey)} ${r.page}`}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => removeRecent(keyOf(r))} hitSlop={8} style={styles.del}>
          <Text style={[styles.delX, { color: theme.textFaint }]}>✕</Text>
        </Pressable>
      </View>
    );
  };

  const Section = ({ label, list, section }: { label: string; list: Recent[]; section: 'bible' | 'protestanta' | 'katolika' }) => {
    if (!list.length) return null;
    return (
      <>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{label}</Text>
          <Pressable onPress={() => clearRecents(section)} hitSlop={6}>
            <Text style={[styles.clearBtn, { color: theme.accent }]}>{t('clear')}</Text>
          </Pressable>
        </View>
        {list.map(Item)}
      </>
    );
  };

  const empty = recents.length === 0;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{t('recent_readings')}</Text>
        <ProfileButton />
      </View>

      {empty ? (
        <Text style={[styles.emptyText, { color: theme.textFaint }]}>
          {t('empty_recents')}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Section label={t('sec_bible_recent')} list={bible} section="bible" />
          <Section label={t('sec_prot')} list={prot} section="protestanta" />
          <Section label={t('sec_kato')} list={kato} section="katolika" />
        </ScrollView>
      )}
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
  clearAll: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONTS.display, fontSize: 20 },
  content: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 10 },
  sectionLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1 },
  clearBtn: { fontFamily: FONTS.sansExtra, fontSize: 11.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    paddingRight: 6,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: FONTS.sansBold, fontSize: 14.5 },
  rowSub: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 2 },
  del: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  delX: { fontFamily: FONTS.sansBold, fontSize: 16 },
  emptyText: { fontFamily: FONTS.sansSemi, fontSize: 14, textAlign: 'center', marginTop: 50, paddingHorizontal: 40, lineHeight: 21 },
});
