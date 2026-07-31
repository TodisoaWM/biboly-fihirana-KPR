/**
 * Fihirana — données réelles (usage privé/familial).
 * Généré par `npm run fihirana:build` → src/data/fihirana.data.json
 *   - Protestanta : FFPM (814) + Fanampiny (54) + Antema (24)
 *   - Katolika    : 7 recueils (Dera, Hasina, Vavaka sy Hira, Vaovao,
 *                   Ankalazao ny Tompo, Karine Dera, Antsao ny Tompo)
 * Sources : github Rohan29-AN/Fihirana-FFPM et heriniaina/fihirana-katolika.
 */

export type Tradition = 'protestanta' | 'katolika';

/** Strophe. `n` = numéro d'andininy ; `r` = fiverenany (refrain). */
export type Verse = { t: string; n?: number; r?: 1 };

/** Appartenance à un recueil (numéro FFPM ou page katolika). */
export type Place = { c: string; p: number };

export type Hymn = {
  id: string;
  tradition: Tradition;
  title: string;
  places: Place[];
  verses: Verse[];
};

export type Collection = { key: string; tradition: Tradition; name: string; count: number };

type FihiranaData = { collections: Collection[]; hymns: Hymn[] };

const DATA = require('./fihirana.data.json') as FihiranaData;

export const COLLECTIONS: Collection[] = DATA.collections;
const HYMNS: Hymn[] = DATA.hymns;

const BY_ID: Record<string, Hymn> = {};
HYMNS.forEach((h) => (BY_ID[h.id] = h));

const COLL_NAME: Record<string, string> = {};
COLLECTIONS.forEach((c) => (COLL_NAME[c.key] = c.name));

export function collectionName(key: string): string {
  return COLL_NAME[key] ?? key;
}

export function getCollection(key: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}

export function getHymn(id: string): Hymn | undefined {
  return BY_ID[id];
}

/** Page/numéro d'un chant dans un recueil donné (ou le 1er si non précisé). */
export function placeIn(h: Hymn, collectionKey?: string): Place {
  if (collectionKey) {
    const p = h.places.find((pl) => pl.c === collectionKey);
    if (p) return p;
  }
  return h.places[0];
}

export type HymnListItem = { id: string; title: string; page: number; index: number; tradition: Tradition };

/**
 * Chants d'un recueil, triés par page/numéro, avec un index séquentiel (1,2,3…).
 * Un même chant peut apparaître à plusieurs pages du recueil (katolika) → une
 * entrée par (chant, page), jamais dédupliqué.
 */
export function getHymnsByCollection(key: string): HymnListItem[] {
  const items: HymnListItem[] = [];
  for (const h of HYMNS) {
    for (const pl of h.places) {
      if (pl.c === key) items.push({ id: h.id, title: h.title, page: pl.p, index: 0, tradition: h.tradition });
    }
  }
  items.sort((a, b) => a.page - b.page || a.title.localeCompare(b.title));
  items.forEach((it, i) => (it.index = i + 1));
  return items;
}

/**
 * Libellé de référence d'un chant :
 *  - protestanta : « FFPM 753 » (vrai numéro) ;
 *  - katolika    : « Fihirana Dera · pejy 40 » (page physique), ou juste le
 *    recueil si la page est inconnue (0).
 */
export function hymnRef(tradition: Tradition, collectionKey: string, page: number): string {
  const name = collectionName(collectionKey);
  if (tradition === 'protestanta') return `${name} ${page}`;
  return page > 0 ? `${name} · pejy ${page}` : name;
}

export type HymnHit = {
  id: string;
  title: string;
  tradition: Tradition;
  collectionKey: string;
  page: number;
};

/** Recherche par numéro (« 3 », « FFPM 3 ») ou par titre. */
export function searchHymns(query: string, limit = 20): HymnHit[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const numMatch = q.match(/(\d+)/);
  const num = numMatch ? parseInt(numMatch[1], 10) : null;
  // indice de recueil dans la requête (ex. « ffpm », « hasina »)
  const collHint = COLLECTIONS.find((c) => q.includes(c.key) || q.includes(c.name.toLowerCase()));
  const hits: HymnHit[] = [];

  for (const h of HYMNS) {
    let place: Place | undefined;
    if (num != null) {
      place = h.places.find((p) => p.p === num && (!collHint || p.c === collHint.key));
    }
    const titleMatch = h.title.toLowerCase().includes(q);
    if (!place && !titleMatch) continue;
    const pl = place ?? (collHint ? h.places.find((p) => p.c === collHint.key) : undefined) ?? h.places[0];
    if (collHint && pl.c !== collHint.key && num != null) continue;
    hits.push({ id: h.id, title: h.title, tradition: h.tradition, collectionKey: pl.c, page: pl.p });
    if (hits.length >= limit) break;
  }
  return hits;
}

export function stanzaPreview(h: Hymn): string {
  const first = h.verses.find((v) => !v.r) ?? h.verses[0];
  return (first?.t || '').split('\n').slice(0, 3).join('\n');
}

/** Dernier chant ouvert (mis en avant sur l'écran Fihirana). */
export const RECENT_HYMN_ID = 'p-ffpm-1';
