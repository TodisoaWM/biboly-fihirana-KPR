/* eslint-disable no-console */
/**
 * build-fihirana.js — fusionne les deux sources Fihirana (usage privé/familial)
 * en un bundle compact pour l'app : src/data/fihirana.data.json
 *
 * Sources (déposées dans source/) :
 *  - fihirana_ffpm_complet.json  : FFPM 814 + Fanampiny 54 + Antema 24 (protestanta)
 *      { recueil, numero, titre, auteurs, versets:[{andininy, tononkira, fiverenany}] }
 *  - fihirana_katolika.json      : 2359 chants, 7 recueils (katolika)
 *      { id, title, recueils:[{recueil, page}], lyrics }
 *
 * Modèle unifié : chaque chant a `places` (recueil + page/numéro) → un chant
 * katolika peut appartenir à plusieurs recueils (pages différentes).
 *
 * Lancer :  npm run fihirana:build
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HANDOFF = path.join(ROOT, 'source');
const OUT = path.join(ROOT, 'src', 'data', 'fihirana.data.json');

// recueil (source) → clé de collection
const KEY = {
  FFPM: 'ffpm',
  Fanampiny: 'fanampiny',
  Antema: 'antema',
  Fifohazana: 'fifohazana',
  'Fihirana Dera': 'dera',
  'Fihirana Hasina': 'hasina',
  'Vavaka sy Hira': 'vavaka',
  'Fihirana Vaovao': 'vaovao',
  'Ankalazao ny Tompo': 'ankalazao',
  'Karine Dera': 'karine',
  'Antsao ny Tompo': 'antsao',
};

// Métadonnées d'affichage + ordre des collections.
const COLLECTIONS_META = [
  { key: 'ffpm', tradition: 'protestanta', name: 'FFPM' },
  { key: 'fanampiny', tradition: 'protestanta', name: 'Fanampiny' },
  { key: 'antema', tradition: 'protestanta', name: 'Antema' },
  { key: 'fifohazana', tradition: 'protestanta', name: 'Fifohazana' },
  { key: 'dera', tradition: 'katolika', name: 'Fihirana Dera' },
  { key: 'hasina', tradition: 'katolika', name: 'Fihirana Hasina' },
  { key: 'vavaka', tradition: 'katolika', name: 'Vavaka sy Hira' },
  { key: 'vaovao', tradition: 'katolika', name: 'Fihirana Vaovao' },
  { key: 'ankalazao', tradition: 'katolika', name: 'Ankalazao ny Tompo' },
  { key: 'karine', tradition: 'katolika', name: 'Karine Dera' },
  { key: 'antsao', tradition: 'katolika', name: 'Antsao ny Tompo' },
];

function firstLine(txt) {
  return (txt || '').split('\n')[0].trim();
}

// Décodage des entités HTML (les paroles katolika viennent de fichiers HTML).
const NAMED = {
  ocirc: 'ô', Ocirc: 'Ô', acirc: 'â', Acirc: 'Â', ecirc: 'ê', Ecirc: 'Ê',
  icirc: 'î', Icirc: 'Î', ucirc: 'û', Ucirc: 'Û',
  agrave: 'à', Agrave: 'À', egrave: 'è', Egrave: 'È', ugrave: 'ù', Ugrave: 'Ù',
  eacute: 'é', Eacute: 'É', aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú',
  auml: 'ä', euml: 'ë', iuml: 'ï', ouml: 'ö', uuml: 'ü',
  ntilde: 'ñ', ccedil: 'ç', Ccedil: 'Ç',
  quot: '"', apos: "'", laquo: '«', raquo: '»', hellip: '…',
  ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  nbsp: ' ', amp: '&', lt: '<', gt: '>',
};

function decodeEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => (name in NAMED ? NAMED[name] : m))
    .replace(/&amp;/g, '&');
}

const NUM_MARK = /^\s*(\d+)\s*[.\-)]\s*(.*)$/; // « 1. … » ou « 2- … »
const REFRAIN_MARK = /^\s*(?:fiv\.?|fiveren\w*|iverenana)\s*[:.\-]?\s*(.*)$/i;

/**
 * Découpe les paroles katolika en strophes (couplets numérotés + refrain).
 * Les lignes sont séparées par des sauts de ligne ; les couplets par un marqueur
 * numérique ; le bloc d'introduction (avant le 1er couplet) est un refrain.
 */
function parseKatolika(lyrics) {
  const lines = decodeEntities(lyrics)
    .split(/\r?\n\s*\r?\n|\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const stanzas = [];
  let cur = null;
  const flush = () => {
    if (cur && cur.lines.length) {
      const t = cur.lines.join('\n').trim();
      if (t) stanzas.push({ t, n: cur.n, refrain: cur.refrain });
    }
    cur = null;
  };

  for (const line of lines) {
    const num = line.match(NUM_MARK);
    const fiv = line.match(REFRAIN_MARK);
    if (num) {
      flush();
      cur = { n: parseInt(num[1], 10), lines: num[2] ? [num[2]] : [] };
    } else if (fiv) {
      flush();
      cur = { refrain: true, lines: fiv[1] ? [fiv[1]] : [] };
    } else {
      if (!cur) cur = { intro: true, lines: [] };
      cur.lines.push(line);
    }
  }
  flush();

  const hasNumbered = stanzas.some((s) => s.n != null);
  return stanzas.map((s) => {
    if (s.refrain || (s.n == null && hasNumbered)) return { t: s.t, r: 1 };
    if (s.n != null) return { t: s.t, n: s.n };
    return { t: s.t };
  });
}

function main() {
  const ffpm = JSON.parse(fs.readFileSync(path.join(HANDOFF, 'fihirana_ffpm_complet.json'), 'utf8'));
  const kato = JSON.parse(fs.readFileSync(path.join(HANDOFF, 'fihirana_katolika.json'), 'utf8'));
  const fifo = JSON.parse(fs.readFileSync(path.join(HANDOFF, 'fihirana_fifohazana.json'), 'utf8'));

  const hymns = [];

  // Protestanta
  for (const s of ffpm) {
    const key = KEY[s.recueil];
    if (!key) continue;
    const num = parseInt(s.numero, 10);
    let vn = 0;
    const verses = (s.versets || []).map((v) => {
      const t = decodeEntities(v.tononkira).trim();
      if (v.fiverenany) return { t, r: 1 };
      vn += 1;
      return { t, n: typeof v.andininy === 'number' && v.andininy > 0 ? v.andininy : vn };
    });
    const title = decodeEntities(s.titre || '').trim() || firstLine(verses.find((v) => !v.r)?.t) || `Hira ${s.numero}`;
    hymns.push({
      id: `p-${key}-${s.numero}`,
      tradition: 'protestanta',
      title,
      places: [{ c: key, p: num }],
      verses,
    });
  }

  // Fifohazana (protestanta) — format légèrement différent : `numero` entier,
  // `auteur` singulier, refrain marqué `fiverenana`, titre préfixé « N. ».
  for (const s of fifo) {
    const key = KEY[s.recueil]; // 'fifohazana'
    if (!key) continue;
    const num = typeof s.numero === 'number' ? s.numero : parseInt(s.numero, 10);
    let vn = 0;
    const verses = (s.versets || []).map((v) => {
      const t = decodeEntities(v.tononkira).trim();
      if (v.fiverenana) return { t, r: 1 };
      vn += 1;
      return { t, n: typeof v.andininy === 'number' && v.andininy > 0 ? v.andininy : vn };
    });
    const cleanTitle = decodeEntities(s.titre || '').replace(/^\s*\d+\s*[.\-)]\s*/, '').trim();
    const title = cleanTitle || firstLine(verses.find((v) => !v.r)?.t) || `Hira ${num}`;
    hymns.push({
      id: `p-${key}-${num}`,
      tradition: 'protestanta',
      title,
      places: [{ c: key, p: num }],
      verses,
    });
  }

  // Katolika (un chant → plusieurs recueils possibles)
  for (const s of kato) {
    const places = (s.recueils || [])
      .map((r) => ({ c: KEY[r.recueil], p: r.page }))
      .filter((p) => p.c);
    if (!places.length) continue;
    hymns.push({
      id: `k-${s.id}`,
      tradition: 'katolika',
      title: decodeEntities(s.title || '').trim() || 'Hira',
      places,
      verses: parseKatolika(s.lyrics),
    });
  }

  // Comptes par collection
  const counts = {};
  for (const h of hymns) for (const pl of h.places) counts[pl.c] = (counts[pl.c] || 0) + 1;
  const collections = COLLECTIONS_META.map((c) => ({ ...c, count: counts[c.key] || 0 }));

  fs.writeFileSync(OUT, JSON.stringify({ collections, hymns }));
  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`✓ ${hymns.length} chants (${ffpm.length + fifo.length} protestanta + ${kato.length} katolika)`);
  collections.forEach((c) => console.log(`   ${c.name} (${c.tradition}) : ${c.count}`));
  console.log(`→ src/data/fihirana.data.json (${sizeMB} Mo)`);
}

main();
