/**
 * Baiboly Malagasy (MG 1865, domaine public).
 * Données générées par `node scripts/build-bible.js` depuis le dump
 * Rohan29-AN/MG-Bible-65 → src/data/bible.data.json (66 livres, 31 099 versets).
 */

export type Testament = 'TT' | 'TV';

export type Book = {
  id: number;
  num: number;
  code: string;
  name: string;
  abbr: string;
  testament: Testament;
  chapters: number;
};

type BibleData = { books: Book[]; text: Record<string, string[][]> };

// require : évite que TS infère le type littéral (énorme) du JSON.
const DATA = require('./bible.data.json') as BibleData;

export const BOOKS: Book[] = DATA.books;
const TEXT = DATA.text;

export const TESTAMENT_LABEL: Record<Testament, string> = {
  TT: 'Testamenta Taloha',
  TV: 'Testamenta Vaovao',
};

const BY_CODE: Record<string, Book> = {};
BOOKS.forEach((b) => (BY_CODE[b.code] = b));

export function getBook(code: string): Book | undefined {
  return BY_CODE[code];
}

// ─────────────────────────── contenu d'un chapitre ───────────────────────────

export type Verse = {
  n: number;
  text: string;
  /** Sous-titres de section (issus des balises <n>[...]</n>). */
  headings?: string[];
};

export type ChapterContent = {
  bookCode: string;
  chapter: number;
  verses: Verse[];
};

/** Extrait les sous-titres <n>[...]</n> et renvoie le texte nettoyé. */
function parseVerse(n: number, raw: string): Verse {
  const headings: string[] = [];
  const text = raw
    .replace(/<n>\s*\[?([^\]<]*?)\]?\s*<\/n>/g, (_m, h) => {
      const t = String(h).trim();
      if (t) headings.push(t);
      return '';
    })
    .replace(/\s+/g, ' ')
    .trim();
  return headings.length ? { n, text, headings } : { n, text };
}

export function getChapter(bookCode: string, chapter: number): ChapterContent {
  const chArr = TEXT[bookCode]?.[chapter - 1] ?? [];
  const verses: Verse[] = [];
  chArr.forEach((raw, i) => {
    if (raw != null) verses.push(parseVerse(i + 1, raw));
  });
  return { bookCode, chapter, verses };
}

// ─────────────────────────── normalisation / recherche ───────────────────────────

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Index d'alias → code (nom, code, abréviation, variantes sans espace).
const ALIAS: Record<string, string> = {};
BOOKS.forEach((b) => {
  const keys = [b.code, b.name, b.abbr, b.name.replace(/\s+/g, '')];
  keys.forEach((k) => {
    const nk = normalize(k).replace(/\s+/g, '');
    if (nk) ALIAS[nk] = b.code;
  });
});

// Abréviations malgaches usuelles (calendrier Mofon'aina) non couvertes par les codes.
const EXTRA_ALIASES: Record<string, string> = {
  apo: 'Apok',
  eze: 'Ezek',
  oha: 'Ohab',
  file: 'Flm',
  filem: 'Flm',
  '1mpa': '1Mpan',
  '2mpa': '2Mpan',
  mpits: 'Mpits',
  mpit: 'Mpit',
};
Object.assign(ALIAS, EXTRA_ALIASES);

export type Reference = {
  bookCode: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
};

/**
 * Analyse une référence, forme courte OU langage naturel malgache :
 *   « Sal 23 », « Jao 3.16 », « 1 Kor 13:4-7 »,
 *   « Genesisy toko 1 andininy 2 à 3 », « Gen toko 1 and 2 ka hatramin'ny 3 »…
 * Renvoie null si le livre est inconnu ou le chapitre hors limites.
 */
export function parseReference(input: string): Reference | null {
  const r = resolveReference(input);
  if (!r) return null;
  return {
    bookCode: r.bookCode,
    chapter: r.chapter,
    verseStart: r.verses[0],
    verseEnd: r.verses.length ? r.verses[r.verses.length - 1] : undefined,
  };
}

/** Libellé compact d'une référence, ex. « Genesisy 1:2-3 ». */
export function formatReference(ref: Reference): string {
  const name = BY_CODE[ref.bookCode]?.name ?? ref.bookCode;
  let s = `${name} ${ref.chapter}`;
  if (ref.verseStart != null) {
    s += `:${ref.verseStart}`;
    if (ref.verseEnd != null && ref.verseEnd !== ref.verseStart) s += `-${ref.verseEnd}`;
  }
  return s;
}

// ─────────────────────────── résolution d'une lecture ───────────────────────────

/** Normalise les mots-clés malgaches d'une référence en séparateurs canoniques. */
function normalizeRefKeywords(input: string): string {
  return input
    .trim()
    .replace(/\btoko\b/gi, ' ')
    .replace(/\band(?:inin[’']?[iy])?\b\.?/gi, ':')
    .replace(/\bversets?\b/gi, ':')
    .replace(/\bhatramin[’']?\s*ny\b/gi, '-')
    .replace(/\bhatramin\b/gi, '-')
    .replace(/\bka\b/gi, '-')
    .replace(/\s+[àa]\s+/gi, '-')
    .replace(/[–—→]/g, '-')
    .replace(/\.\./g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Regroupe des numéros triés en libellé compact : [1,2,3,7] → « 1-3,7 ». */
function compressRanges(nums: number[]): string {
  if (!nums.length) return '';
  const out: string[] = [];
  let start = nums[0];
  let prev = nums[0];
  for (let i = 1; i <= nums.length; i++) {
    const n = nums[i];
    if (n === prev + 1) {
      prev = n;
    } else {
      out.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = prev = n;
    }
  }
  return out.join(',');
}

/**
 * Résout une référence de lecture, y compris les formes du Mofon'aina :
 *   « Eks 32.1-14 », « 1 Tes 5.14,15 », « Sal 23 », « Genesisy toko 1 andininy 2 à 3 »
 * Renvoie le livre, le chapitre et la liste des versets (vide = tout le chapitre).
 */
export type ReadingRef = { bookCode: string; chapter: number; verses: number[] };

/** Résout le code d'un livre depuis un texte (nom, code, abréviation ou préfixe). */
function lookupBookCode(bookText: string): string | null {
  const key = normalize(bookText).replace(/\s+/g, '');
  if (!key) return null;
  if (ALIAS[key]) return ALIAS[key];
  // Repli : abréviation = préfixe unique d'un code ou d'un nom (ex. « Apo »→Apok,
  // « Eze »→Ezek, « Oha »→Ohab, « File »→Filemona, « 1 Mpa »→1 Mpanjaka).
  const cands = BOOKS.filter((b) => {
    const c = normalize(b.code).replace(/\s+/g, '');
    const n = normalize(b.name).replace(/\s+/g, '');
    return c.startsWith(key) || n.startsWith(key) || key.startsWith(c);
  });
  return cands.length === 1 ? cands[0].code : null;
}

/** Développe une liste de versets : « 14,15 », « 1-14 », « 4-7,20 » → [nombres]. */
function parseVerseSpec(spec: string): number[] {
  const verses: number[] = [];
  for (const tok of spec.split(/[,;]/)) {
    const rng = tok.trim().match(/^(\d+)\s*-\s*(\d+)/);
    const one = tok.trim().match(/^(\d+)/);
    if (rng) {
      const a = parseInt(rng[1], 10);
      const b = parseInt(rng[2], 10);
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) verses.push(i);
    } else if (one) {
      verses.push(parseInt(one[1], 10));
    }
  }
  return [...new Set(verses)].sort((a, b) => a - b);
}

export function resolveReference(input: string): ReadingRef | null {
  const s = normalizeRefKeywords(input);
  // Isole le « localisateur » final (chapitre[.versets] ou versets seuls).
  const loc = s.match(/[\d][\d.,:\s-]*$/);
  if (!loc) return null;
  const locator = loc[0].trim();
  const code = lookupBookCode(s.slice(0, loc.index).trim());
  if (!code) return null;
  const book = BY_CODE[code];

  let chapter: number;
  let versePart = '';
  const dot = locator.match(/^(\d+)\s*[.:]\s*(.+)$/);
  if (dot) {
    chapter = parseInt(dot[1], 10);
    versePart = dot[2];
  } else if (book.chapters === 1) {
    // Livre à un seul chapitre : « File 1-7 » = chapitre 1, versets 1-7.
    chapter = 1;
    versePart = locator;
  } else {
    const c = locator.match(/^(\d+)/);
    chapter = c ? parseInt(c[1], 10) : NaN;
  }
  if (!chapter || chapter < 1 || chapter > book.chapters) return null;

  return { bookCode: code, chapter, verses: parseVerseSpec(versePart) };
}

export type Reading = {
  book: Book;
  chapter: number;
  /** Versets demandés (filtrés du chapitre), avec sous-titres <n>. */
  verses: Verse[];
  /** Bornes pour surligner dans l'écran de lecture du chapitre. */
  firstVerse?: number;
  lastVerse?: number;
  /** Libellé normalisé, ex. « 1 Tesaloniana 5:14,15 ». */
  label: string;
};

/** Prépare la lecture d'une référence (versets réels depuis la Baiboly). */
export function getReading(reference: string): Reading | null {
  const ref = resolveReference(reference);
  if (!ref) return null;
  const book = BY_CODE[ref.bookCode];
  const chapter = getChapter(ref.bookCode, ref.chapter);
  const verses = ref.verses.length ? chapter.verses.filter((v) => ref.verses.includes(v.n)) : chapter.verses;
  const label = `${book.name} ${ref.chapter}${ref.verses.length ? `:${compressRanges(ref.verses)}` : ''}`;
  return {
    book,
    chapter: ref.chapter,
    verses,
    firstVerse: ref.verses[0],
    lastVerse: ref.verses[ref.verses.length - 1],
    label,
  };
}

/** Livres dont le nom/abréviation contient la requête. */
export function searchBooks(query: string, limit = 8): Book[] {
  const q = normalize(query);
  if (!q) return [];
  return BOOKS.filter((b) => normalize(b.name).includes(q) || normalize(b.code).includes(q)).slice(0, limit);
}

export type VerseHit = { bookCode: string; bookName: string; chapter: number; verse: number; text: string };

/** Recherche plein-texte dans les 31 099 versets (texte nettoyé). */
export function searchVerses(query: string, limit = 40): VerseHit[] {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];
  const hits: VerseHit[] = [];
  for (const b of BOOKS) {
    const chs = TEXT[b.code];
    if (!chs) continue;
    for (let ci = 0; ci < chs.length; ci++) {
      const arr = chs[ci];
      if (!arr) continue;
      for (let vi = 0; vi < arr.length; vi++) {
        const raw = arr[vi];
        if (!raw) continue;
        if (raw.toLowerCase().includes(q)) {
          hits.push({
            bookCode: b.code,
            bookName: b.name,
            chapter: ci + 1,
            verse: vi + 1,
            text: parseVerse(vi + 1, raw).text,
          });
          if (hits.length >= limit) return hits;
        }
      }
    }
  }
  return hits;
}
