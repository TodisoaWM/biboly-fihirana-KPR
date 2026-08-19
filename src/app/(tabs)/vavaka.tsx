import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProfileButton } from '@/components/ProfileButton';
import { Screen } from '@/components/Screen';
import { categoryLabel, getVavakaByTradition, type VavakaTradition } from '@/data/vavaka';
import { useI18n } from '@/lib/i18n';
import { FONTS, RADII, SPACING } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';

function Tab({
  value,
  label,
  active,
  onPress,
}: {
  value: VavakaTradition;
  label: string;
  active: boolean;
  onPress: (v: VavakaTradition) => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[
        styles.tab,
        { borderColor: theme.border },
        active && { backgroundColor: value === 'katolika' ? theme.accent : theme.teal, borderColor: 'transparent' },
      ]}
    >
      <Text style={[styles.tabText, { color: active ? theme.onPrimary : theme.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

export default function VavakaScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const [tradition, setTradition] = useState<VavakaTradition>('katolika');

  const accent = tradition === 'katolika' ? theme.accent : theme.teal;

  // Prières de la tradition courante, regroupées par catégorie (ordre d'apparition).
  const groups = useMemo(() => {
    const list = getVavakaByTradition(tradition);
    const order: (string | null)[] = [];
    const map = new Map<string | null, typeof list>();
    for (const v of list) {
      if (!map.has(v.category)) {
        map.set(v.category, []);
        order.push(v.category);
      }
      map.get(v.category)!.push(v);
    }
    return order.map((cat) => ({ cat, items: map.get(cat)! }));
  }, [tradition]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>{t('tab_prayer')}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('prayer_subtitle')}</Text>
          </View>
          <ProfileButton />
        </View>

        {/* Bascule tradition */}
        <View style={styles.tabs}>
          <Tab value="katolika" label={t('catholic')} active={tradition === 'katolika'} onPress={setTradition} />
          <Tab value="protestanta" label={t('protestant')} active={tradition === 'protestanta'} onPress={setTradition} />
        </View>

        {groups.map(({ cat, items }) => (
          <View key={cat ?? 'samihafa'}>
            <Text style={[styles.sectionLabel, { color: theme.textFaint }]}>{categoryLabel(cat).toUpperCase()}</Text>
            {items.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => router.push({ pathname: '/vavaka-read', params: { id: v.id } })}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
                  cardShadow(theme.shadow, 'sm'),
                ]}
              >
                <View style={[styles.cardIcon, { backgroundColor: accent }]}>
                  <Icon name="pray" size={18} color={theme.onPrimary} strokeWidth={1.8} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                  {v.title}
                </Text>
                <Icon name="chevron-right" size={16} color={theme.textFaint} strokeWidth={2.2} />
              </Pressable>
            ))}
          </View>
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
  tabs: { flexDirection: 'row', gap: 10, marginTop: 18 },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: RADII.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontFamily: FONTS.sansExtra, fontSize: 13.5 },
  sectionLabel: { fontFamily: FONTS.sansExtra, fontSize: 11, letterSpacing: 1, marginTop: 22, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: FONTS.sansBold, fontSize: 15, flex: 1 },
});
