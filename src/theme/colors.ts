/**
 * Palette Mofon'aina — extraite des maquettes claire et sombre.
 * `primary` est surchargée par l'accent choisi dans les réglages (Loko fototra).
 */

export type ThemeName = 'light' | 'dark';

export type Palette = {
  /** Fond de l'écran (crème en clair, bleu nuit en sombre) */
  bg: string;
  /** Deuxième teinte du fond (dégradé bg → bg2) */
  bg2: string;
  /** Surfaces / cartes */
  surface: string;
  /** Surface légèrement plus foncée (barres, séparateurs de fond) */
  surfaceAlt: string;
  /** Puce teal (référence biblique) */
  chipBg: string;
  chipText: string;
  /** Onglet actif (pastille derrière l'icône) */
  tabActiveBg: string;
  text: string;
  textMuted: string;
  textFaint: string;
  /** Texte des versets (Lora) */
  verse: string;
  primary: string;
  onPrimary: string;
  accent: string;
  teal: string;
  gold: string;
  border: string;
  notch: string;
  /** Dégradés d'illustration */
  heroFrom: string;
  heroTo: string;
  cardPinkFrom: string;
  cardPinkTo: string;
  cardTealFrom: string;
  cardTealTo: string;
  shadow: string;
};

export const LIGHT: Palette = {
  bg: '#FFFDF0',
  bg2: '#F3EFDD',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F4F0',
  chipBg: '#DCEBEB',
  chipText: '#2F6076',
  tabActiveBg: '#CFE6E4',
  text: '#232020',
  textMuted: '#8A857D',
  textFaint: '#9AA79F',
  verse: '#7C766C',
  primary: '#3A718C',
  onPrimary: '#FFFDF0',
  accent: '#C77F86',
  teal: '#5EA3A6',
  gold: '#E7C86A',
  border: 'rgba(45,35,25,0.12)',
  notch: '#232020',
  heroFrom: '#F7DCDC',
  heroTo: '#E8F2F2',
  cardPinkFrom: '#F7DCDC',
  cardPinkTo: '#E8F2F2',
  cardTealFrom: '#E6F1F1',
  cardTealTo: '#EDF4F4',
  shadow: 'rgba(70,55,40,0.28)',
};

export const DARK: Palette = {
  bg: '#16252E',
  bg2: '#1D3440',
  surface: '#22333D',
  surfaceAlt: '#1E3138',
  chipBg: '#24414C',
  chipText: '#BFE0EA',
  tabActiveBg: '#24414C',
  text: '#F5F1E2',
  textMuted: '#9AA79F',
  textFaint: '#8FA09B',
  verse: '#B9C0B6',
  primary: '#3A718C',
  onPrimary: '#FFFDF0',
  accent: '#C77F86',
  teal: '#5EA3A6',
  gold: '#E7C86A',
  border: 'rgba(255,255,255,0.12)',
  notch: '#0B1419',
  heroFrom: '#38292F',
  heroTo: '#1E3138',
  cardPinkFrom: '#38292F',
  cardPinkTo: '#1E3138',
  cardTealFrom: '#1C2F36',
  cardTealTo: '#243742',
  shadow: 'rgba(0,0,0,0.45)',
};

/** Accents proposés dans « Loko fototra » (réglages). */
export const ACCENTS = ['#3A718C', '#5EA3A6', '#F0BEBE', '#C77F86', '#E7C86A'] as const;
export type Accent = (typeof ACCENTS)[number];

/** Texte lisible (crème/sombre) au-dessus d'une couleur de fond donnée. */
export function onColorFor(hex: string): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return lum < 0.5 ? '#FFFDF0' : '#232020';
}

export const RADII = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 30,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const FONTS = {
  display: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  sans: 'NunitoSans_400Regular',
  sansSemi: 'NunitoSans_600SemiBold',
  sansBold: 'NunitoSans_700Bold',
  sansExtra: 'NunitoSans_800ExtraBold',
  serif: 'Lora_400Regular',
  serifItalic: 'Lora_400Regular_Italic',
  serifMedium: 'Lora_500Medium',
} as const;
