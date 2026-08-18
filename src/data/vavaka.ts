// Accès aux prières (Vavaka) — données locales embarquées (source/vavaka_all.json
// → src/data/vavaka.data.json via `npm run vavaka:build`). Contenu en malgache.

export type VavakaTradition = 'katolika' | 'protestanta';

export type VavakaRef = { raw: string; book: string; chapter: number; start: number; end: number };

export type Vavaka = {
  id: string;
  title: string;
  tradition: VavakaTradition;
  category: string | null;
  lines: string[]; // "" = saut de paragraphe
  refs: VavakaRef[];
};

const DATA = require('./vavaka.data.json') as Vavaka[];

export const VAVAKA: Vavaka[] = DATA;

export function getVavaka(id: string): Vavaka | undefined {
  return VAVAKA.find((v) => v.id === id);
}

export function getVavakaByTradition(t: VavakaTradition): Vavaka[] {
  return VAVAKA.filter((v) => v.tradition === t);
}

// Libellés lisibles des catégories (slugs de la source).
const CATEGORY_LABELS: Record<string, string> = {
  'vavaka-maraina': 'Vavaka maraina',
  'vavaka-hariva': 'Vavaka hariva',
  'sorona-masina': 'Sorona Masina',
  sakramenta: 'Sakramenta',
  'masina-maria': 'Masina Maria',
  'iraisam-pinoana': 'Iraisam-pinoana',
  samihafa: 'Samihafa',
  fanekena: 'Fanekena',
  'fanetren-tena': 'Fanetren-tena',
  'fiekem-pinoana': 'Fiekem-pinoana',
  'vavaka-nampianarin-ny-tompo': "Vavaka nampianarin'ny Tompo",
};

export function categoryLabel(slug: string | null): string {
  if (!slug) return 'Samihafa';
  return CATEGORY_LABELS[slug] ?? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}

/** Référence exploitable par le lecteur Bible local (getReading), ex. « Jaona 1.29 ». */
export function refToPassage(r: VavakaRef): string {
  return `${r.book} ${r.chapter}.${r.start}` + (r.end > r.start ? `-${r.end}` : '');
}
