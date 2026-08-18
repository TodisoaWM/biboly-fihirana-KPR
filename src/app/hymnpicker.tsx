import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HomeButton } from '@/components/HomeButton';
import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { collectionName, getCollection, getHymnsByCollection } from '@/data/fihirana';
import { useI18n } from '@/lib/i18n';
import { useSafeBack } from '@/lib/nav';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

/** Pavé numérique pour ouvrir un chant par son numéro/page dans un recueil. */
export default function HymnPickerScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const goBack = useSafeBack('/fihirana');
  const { collection } = useLocalSearchParams<{ collection?: string }>();
  const key = collection ?? 'ffpm';
  const coll = getCollection(key);

  const [num, setNum] = useState('');
  const [error, setError] = useState('');

  const isKatolika = coll?.tradition === 'katolika';
  const label = isKatolika ? t('page') : t('number');

  const pressDigit = (d: string) => {
    setError('');
    if (num.length >= 4) return;
    setNum(num + d);
  };
  const pressDelete = () => {
    setError('');
    if (num.length > 0) setNum(num.slice(0, -1));
    else goBack();
  };
  const validate = () => {
    if (!num) return setError(t('err_number'));
    const n = parseInt(num, 10);
    const items = getHymnsByCollection(key);
    const hit = items.find((it) => it.page === n);
    if (!hit) return setError(`${label} ${n}: ${t('no_results')}`);
    router.push({ pathname: '/hymn', params: { id: hit.id, c: key, p: String(hit.page) } });
  };

  const Key = ({ lbl, onPress, kind }: { lbl: string; onPress: () => void; kind?: 'ok' | 'del' }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: kind === 'ok' ? theme.primary : theme.surface, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
        cardShadow(theme.shadow, 'sm'),
      ]}
    >
      <Text style={[styles.keyText, kind === 'del' && styles.keyTextSmall, { color: kind === 'ok' ? theme.onPrimary : kind === 'del' ? theme.accent : theme.text }]}>
        {lbl}
      </Text>
    </Pressable>
  );

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View style={styles.leftCluster}>
          <Pressable onPress={goBack} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="chevron-left" size={19} color={theme.text} strokeWidth={2.2} />
          </Pressable>
          <HomeButton />
        </View>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{collectionName(key)}</Text>
        <View style={styles.rightCluster}>
          <Pressable onPress={() => router.push('/search')} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Icon name="search" size={18} color={theme.text} strokeWidth={2} />
          </Pressable>
          <ProfileButton />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.displayRow}>
          <View style={[styles.display, { backgroundColor: theme.surface, borderColor: theme.border }, cardShadow(theme.shadow, 'sm')]}>
            <Text style={[styles.collLabel, { color: theme.text }]} numberOfLines={1}>{collectionName(key)}</Text>
            <Text style={[styles.num, { color: num ? theme.primary : theme.textFaint }]}>{num || '—'}</Text>
          </View>
          <Pressable onPress={() => setNum('')} style={styles.xBtn} hitSlop={8}>
            <Text style={[styles.xText, { color: theme.textMuted }]}>✕</Text>
          </Pressable>
        </View>

        <Text style={[styles.hint, { color: error ? theme.accent : theme.textFaint }]}>
          {error || `${label} · 🔍 ${t('search_hymn_ph')}`}
        </Text>

        <View style={styles.pad}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((d) => (
            <Key key={d} lbl={d} onPress={() => pressDigit(d)} />
          ))}
          <Key lbl="OK" onPress={validate} kind="ok" />
          <Key lbl="AMAFA" onPress={pressDelete} kind="del" />
        </View>
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
  leftCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONTS.display, fontSize: 20, flex: 1, textAlign: 'center', paddingHorizontal: 8 },
  rightCluster: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 10 },
  displayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  display: { flex: 1, borderRadius: RADII.pill, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  collLabel: { fontFamily: FONTS.display, fontSize: 20, flexShrink: 1 },
  num: { fontFamily: FONTS.display, fontSize: 22, minWidth: 30, textAlign: 'right' },
  xBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  xText: { fontFamily: FONTS.sansBold, fontSize: 22 },
  hint: { fontFamily: FONTS.sansSemi, fontSize: 12.5, textAlign: 'center', marginTop: 14 },
  pad: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  // Le BOUTON centre le texte (flexbox) → marche sur web ET natif. Le texte est
  // à taille de contenu (pas de flex:1). includeFontPadding:false enlève la marge
  // de police Android qui poussait le chiffre vers le haut.
  key: {
    width: '22%',
    aspectRatio: 1.35,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontFamily: FONTS.sansExtra,
    fontSize: 19,
    textAlign: 'center',
    includeFontPadding: false,
  },
  keyTextSmall: { fontSize: 13, letterSpacing: 0.5 },
});
