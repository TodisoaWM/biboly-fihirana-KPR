import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { Accent, DARK, LIGHT, onColorFor, Palette, ThemeName } from './colors';
import { HERO_KEYS, HERO_THEMES } from './heroThemes.generated';

type Mode = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Palette;
  scheme: ThemeName;
  mode: Mode;
  /** Override manuel de la couleur primaire (« Loko fototra »). null = suit l'image. */
  accentOverride: Accent | null;
  fontScale: number;
  /** Ambiance du jour (automatique, non modifiable par l'utilisateur). */
  heroKey: string | null;
  heroImage: number | null;
  heroBlur: string | undefined;
  heroLabel: string | undefined;
  setMode: (m: Mode) => void;
  setAccentOverride: (a: Accent | null) => void;
  setFontScale: (s: number) => void;
};

const STORAGE_KEY = 'mofonaina.prefs.v2';

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Ambiance du jour : rotation déterministe d'une image par date. */
function heroKeyForDate(d = new Date()): string | null {
  if (!HERO_KEYS.length) return null;
  const start = new Date(d.getFullYear(), 0, 0).getTime();
  const day = Math.floor((d.getTime() - start) / 86400000);
  return HERO_KEYS[day % HERO_KEYS.length];
}

function buildTheme(scheme: ThemeName, heroKey: string | null, accentOverride: Accent | null): Palette {
  const base = scheme === 'dark' ? DARK : LIGHT;
  const hero = heroKey ? HERO_THEMES[heroKey] : null;

  let out: Palette = { ...base };
  if (hero) {
    const amb = scheme === 'dark' ? hero.dark : hero.light;
    out = { ...out, ...amb, primary: hero.primary, accent: hero.accent, onPrimary: hero.onPrimary };
  }
  if (accentOverride) {
    out = { ...out, primary: accentOverride, onPrimary: onColorFor(accentOverride) };
  }
  return out;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<Mode>('light');
  const [accentOverride, setAccentState] = useState<Accent | null>(null);
  const [fontScale, setFontScaleState] = useState(1);
  // L'image héro n'est plus choisie par l'utilisateur : elle change chaque jour.
  const [heroKey, setHeroKey] = useState<string | null>(() => heroKeyForDate());

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (p.mode) setModeState(p.mode);
          if (p.accentOverride !== undefined) setAccentState(p.accentOverride);
          if (typeof p.fontScale === 'number') setFontScaleState(p.fontScale);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Recalcule l'ambiance du jour si l'app reste ouverte au changement de date.
  useEffect(() => {
    const id = setInterval(() => setHeroKey(heroKeyForDate()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const persist = (next: Partial<{ mode: Mode; accentOverride: Accent | null; fontScale: number }>) => {
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode, accentOverride, fontScale, ...next }),
    ).catch(() => {});
  };

  const setMode = (m: Mode) => {
    setModeState(m);
    persist({ mode: m });
  };
  const setAccentOverride = (a: Accent | null) => {
    setAccentState(a);
    persist({ accentOverride: a });
  };
  const setFontScale = (s: number) => {
    setFontScaleState(s);
    persist({ fontScale: s });
  };

  const scheme: ThemeName = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const theme = useMemo(
    () => buildTheme(scheme, heroKey, accentOverride),
    [scheme, heroKey, accentOverride],
  );

  const hero = heroKey ? HERO_THEMES[heroKey] : null;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      scheme,
      mode,
      accentOverride,
      fontScale,
      heroKey,
      heroImage: hero ? hero.image : null,
      heroBlur: hero ? hero.blur : undefined,
      heroLabel: hero ? hero.label : undefined,
      setMode,
      setAccentOverride,
      setFontScale,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, scheme, mode, accentOverride, fontScale, heroKey],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return ctx;
}
