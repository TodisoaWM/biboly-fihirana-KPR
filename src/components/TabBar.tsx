import React from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/lib/i18n';
import { FONTS, RADII } from '@/theme/colors';
import { cardShadow } from '@/theme/elevation';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, IconName } from './Icon';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TABS: Record<string, { key: string; icon: IconName }> = {
  index: { key: 'tab_today', icon: 'sun' },
  baiboly: { key: 'tab_bible', icon: 'book' },
  fihirana: { key: 'tab_hymnal', icon: 'music' },
  vavaka: { key: 'tab_prayer', icon: 'pray' },
  tiana: { key: 'tab_favorites', icon: 'heart' },
};

type TabRoute = { key: string; name: string };
type TabBarProps = {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

/**
 * Barre pleine largeur, plaquée en bas (aucun cadre visible autour), coins
 * arrondis en haut seulement. L'onglet actif prend une pilule colorée (taille
 * fixe, indépendante de la hauteur de la barre) ; le changement d'onglet
 * déclenche une LayoutAnimation native (légère, pas de lib d'animation dédiée).
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(insets.bottom, Platform.OS === 'web' ? 14 : 10);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          paddingBottom: bottomGap,
          ...cardShadow(theme.shadow, 'md'),
        },
      ]}
    >
      {state.routes.map((route: TabRoute, index: number) => {
        const cfg = TABS[route.name];
        if (!cfg) return null;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.item}
            accessibilityRole="button"
            accessibilityLabel={t(cfg.key)}
            accessibilityState={{ selected: focused }}
          >
            <View
              style={[
                styles.pill,
                focused && {
                  backgroundColor: theme.primary,
                  ...cardShadow(theme.primary, 'sm'),
                },
              ]}
            >
              <Icon
                name={cfg.icon}
                size={18}
                color={focused ? theme.onPrimary : theme.textFaint}
                strokeWidth={1.8}
              />
              {focused && (
                <Text
                  numberOfLines={1}
                  style={[styles.pillLabel, { color: theme.onPrimary, fontFamily: FONTS.sansExtra }]}
                >
                  {t(cfg.key)}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingTop: 16,
    borderTopLeftRadius: RADII.xxl,
    borderTopRightRadius: RADII.xxl,
    borderTopWidth: 1,
  },
  item: { alignItems: 'center', justifyContent: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minWidth: 34,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: RADII.pill,
  },
  pillLabel: { fontSize: 11, maxWidth: 84 },
});
