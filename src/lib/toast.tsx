import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { FONTS } from '@/theme/colors';
import { useTheme } from '@/theme/ThemeProvider';

type ToastKind = 'notfound';
type ToastContent = { mg: string; fr: string; en: string };

const NOT_FOUND: ToastContent = {
  mg: "Tsy hita — tsy misy izany.",
  fr: 'Résultat introuvable.',
  en: 'No results found.',
};

type ToastApi = {
  /** Notification « introuvable » (trilingue). */
  notFound: () => void;
  /** Notification personnalisée trilingue. */
  show: (content: ToastContent, kind?: ToastKind) => void;
};

const Ctx = createContext<ToastApi>({ notFound: () => {}, show: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState<ToastContent | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const op = useSharedValue(0);
  const ty = useSharedValue(-24);

  // API get/set de Reanimated 4 : l'identité des shared values est stable, d'où les deps vides.
  const hide = useCallback(() => {
    op.set(withTiming(0, { duration: 220 }));
    ty.set(
      withTiming(-24, { duration: 220 }, (done) => {
        if (done) runOnJS(setContent)(null);
      }),
    );
  }, [op, ty]);

  const show = useCallback(
    (c: ToastContent) => {
      setContent(c);
      op.set(withTiming(1, { duration: 240 }));
      ty.set(withTiming(0, { duration: 240 }));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(hide, 3000);
    },
    [op, ty, hide],
  );

  const notFound = useCallback(() => show(NOT_FOUND), [show]);

  const cardStyle = useAnimatedStyle(() => ({ opacity: op.get(), transform: [{ translateY: ty.get() }] }));

  return (
    <Ctx.Provider value={{ notFound, show }}>
      {children}
      {content && (
        <View style={[styles.wrap, { top: insets.top + 12 }]} pointerEvents="none">
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow },
              cardStyle,
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.chipBg }]}>
              <Icon name="search" size={18} color={theme.chipText} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mg, { color: theme.text }]}>{content.mg}</Text>
              <Text style={[styles.other, { color: theme.textMuted }]}>{content.fr}</Text>
              <Text style={[styles.other, { color: theme.textFaint }]}>{content.en}</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 22,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 380,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mg: { fontFamily: FONTS.sansExtra, fontSize: 14 },
  other: { fontFamily: FONTS.sansSemi, fontSize: 12, marginTop: 1 },
});
