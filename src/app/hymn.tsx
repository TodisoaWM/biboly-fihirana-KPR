import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FavButton } from '@/components/FavButton';
import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { TextSizeControl } from '@/components/TextSizeControl';
import { collectionName, getHymn, getHymnsByCollection, hymnRef, placeIn } from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { addHymnRecent } from '@/lib/recents';
import { FONTS, HEADER } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

export default function HymnScreen() {
  const { theme, fontScale } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { id, c, p } = useLocalSearchParams<{ id?: string; c?: string; p?: string }>();
  const goBack = useSafeBack('/fihirana');
  const hymn = getHymn(id ?? '');

  useEffect(() => {
    if (!hymn) return;
    const pl = placeIn(hymn, c);
    addHymnRecent({
      id: hymn.id,
      collectionKey: c ?? pl.c,
      page: p != null ? parseInt(p, 10) : pl.p,
      title: hymn.title,
      tradition: hymn.tradition,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, c, p]);

  if (!hymn) {
    return (
      <Screen>
        <View style={styles.header}>
          <View style={styles.leftCluster}>
            <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
            </Pressable>
            <HomeButton />
          </View>
          <View style={{ width: 88 }} />
        </View>
        <Text style={{ textAlign: 'center', marginTop: 40, fontFamily: FONTS.sansSemi, color: theme.textMuted }}>{t('hymn_not_found')}</Text>
      </Screen>
    );
  }

  const base = placeIn(hymn, c);
  const collKey = c ?? base.c;
  const page = p != null ? parseInt(p, 10) : base.p;
  const katolika = hymn.tradition === 'katolika';

  const siblings = getHymnsByCollection(collKey);
  const idx =
    siblings.findIndex((h) => h.id === hymn.id && h.page === page) >= 0
      ? siblings.findIndex((h) => h.id === hymn.id && h.page === page)
      : siblings.findIndex((h) => h.id === hymn.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;
  const go = (hid: string, pg: number) => router.replace({ pathname: '/hymn', params: { id: hid, c: collKey, p: String(pg) } });

  // Libellé court d'un voisin pour la barre de navigation.
  const navLabel = (it: { page: number; index: number }) =>
    katolika ? (it.page > 0 ? `Pejy ${it.page}` : `#${it.index}`) : `${collectionName(collKey)} ${it.page}`;

  const size = 17 * fontScale;

  // Numérotation des strophes calculée en amont (les refrains ne comptent pas).
  let counter = 0;
  const stanzaLabels = hymn.verses.map((v) => (v.r ? null : v.n ?? ++counter));

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <View style={styles.headerCenter}>
          <Text style={[styles.hTitle, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {katolika ? collectionName(collKey) : `${collectionName(collKey)} ${page}`}
          </Text>
          <Text numberOfLines={1} style={[styles.hSub, { color: theme.textFaint }]}>
            {katolika ? (page > 0 ? `${t('page').toUpperCase()} ${page}` : t('catholic')) : t('number').toUpperCase()}
          </Text>
        </View>
        <View style={styles.rightCluster}>
          <FavButton fav={{ type: 'hymn', id: hymn.id, collectionKey: collKey, page, title: hymn.title, tradition: hymn.tradition }} />
          <ProfileButton />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>{hymn.title}</Text>
        <View style={[styles.chip, { backgroundColor: theme.chipBg }]}>
          <Icon name="music" size={13} color={theme.chipText} strokeWidth={1.9} />
          <Text style={[styles.chipText, { color: theme.chipText }]}>{hymnRef(hymn.tradition, collKey, page)}</Text>
        </View>

        {/* Autres recueils / pages (katolika multi-recueil) */}
        {hymn.places.filter((pl) => !(pl.c === collKey && pl.p === page)).length > 0 && (
          <Text style={[styles.also, { color: theme.textFaint }]}>
            {t('also_in')}:{' '}
            {hymn.places
              .filter((pl) => !(pl.c === collKey && pl.p === page))
              .map((pl) => `${collectionName(pl.c)}${pl.p > 0 ? ` p.${pl.p}` : ''}`)
              .join(' · ')}
          </Text>
        )}

        {hymn.verses.map((v, i) => {
          if (v.r) {
            return (
              <View key={i} style={[styles.refrainBox, { borderLeftColor: theme.primary }]}>
                <Text style={[styles.refrainLabel, { color: theme.primary }]}>{t('refrain')}</Text>
                <Text style={[styles.refrain, { color: theme.primary, fontSize: size, lineHeight: size * 1.7 }]}>{v.t}</Text>
              </View>
            );
          }
          const label = stanzaLabels[i];
          return (
            <View key={i} style={styles.stanzaRow}>
              <Text style={[styles.stanzaNum, { color: theme.accent }]}>{label}</Text>
              <Text style={[styles.stanza, { color: theme.verse, fontSize: size, lineHeight: size * 1.7 }]}>{v.t}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <Pressable
          disabled={!prev}
          onPress={() => prev && go(prev.id, prev.page)}
          style={[styles.navChip, { backgroundColor: theme.surfaceAlt, opacity: prev ? 1 : 0.4 }]}
        >
          <Icon name="chevron-left" size={16} color={theme.textMuted} strokeWidth={2.1} />
          <Text style={[styles.navChipText, { color: theme.textMuted }]} numberOfLines={1}>
            {prev ? navLabel(prev) : '—'}
          </Text>
        </Pressable>

        <TextSizeControl />

        <Pressable
          disabled={!next}
          onPress={() => next && go(next.id, next.page)}
          style={[styles.navChip, { backgroundColor: theme.tabActiveBg, opacity: next ? 1 : 0.4 }]}
        >
          <Text style={[styles.navChipText, { color: theme.text }]} numberOfLines={1}>
            {next ? navLabel(next) : '—'}
          </Text>
          <Icon name="chevron-right" size={16} color={theme.text} strokeWidth={2.1} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: HEADER.pad,
    paddingTop: 6,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  iconBtn: { width: HEADER.btn, height: HEADER.btn, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: HEADER.gap, flexShrink: 0 },
  headerCenter: { alignItems: 'center', flex: 1, minWidth: 0, paddingHorizontal: 6 },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: HEADER.gap, flexShrink: 0 },
  hTitle: { fontFamily: FONTS.display, fontSize: 18 },
  hSub: { fontFamily: FONTS.sansBold, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  content: { paddingHorizontal: 26, paddingTop: 18, paddingBottom: 40 },
  title: { fontFamily: FONTS.display, fontSize: 26, lineHeight: 31 },
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: { fontFamily: FONTS.sansBold, fontSize: 12 },
  also: { fontFamily: FONTS.sansSemi, fontSize: 11.5, marginTop: 10, lineHeight: 17 },
  stanzaRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  stanzaNum: { fontFamily: FONTS.sansExtra, fontSize: 14, marginTop: 2, width: 22 },
  stanza: { flex: 1, fontFamily: FONTS.serif },
  refrainBox: {
    marginTop: 16,
    marginLeft: 30,
    paddingLeft: 14,
    borderLeftWidth: 3,
  },
  refrainLabel: { fontFamily: FONTS.sansExtra, fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  refrain: { fontFamily: FONTS.serifItalic },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 15, flexShrink: 1, minWidth: 0, maxWidth: 130 },
  navChipText: { fontFamily: FONTS.sansBold, fontSize: 12.5, flexShrink: 1 },
});
