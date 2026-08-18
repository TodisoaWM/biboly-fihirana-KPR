import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/lib/i18n';
import { FONTS, RADII } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, IconName } from './Icon';

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

export function TabBar({ state, navigation }: TabBarProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 14 : 10) + 10;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: bottomPad,
        },
      ]}
    >
      {state.routes.map((route: TabRoute, index: number) => {
        const cfg = TABS[route.name];
        if (!cfg) return null;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button">
            <View
              style={[
                styles.pill,
                focused && { backgroundColor: theme.tabActiveBg },
              ]}
            >
              <Icon
                name={cfg.icon}
                size={21}
                color={focused ? theme.text : theme.textFaint}
                strokeWidth={1.8}
              />
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[
                styles.label,
                {
                  color: focused ? theme.text : theme.textFaint,
                  fontFamily: focused ? FONTS.sansExtra : FONTS.sansSemi,
                },
              ]}
            >
              {t(cfg.key)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 22,
    borderTopWidth: 1,
  },
  item: { flex: 1, alignItems: 'center', gap: 5 },
  pill: {
    width: 48,
    height: 32,
    // Toujours une pilule : rayon >= moitié de la hauteur, garanti quelle que
    // soit la langue/largeur du label. `overflow: hidden` force le clip natif.
    borderRadius: RADII.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 10 },
});
