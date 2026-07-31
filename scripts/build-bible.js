/* eslint-disable no-console */
/**
 * build-bible.js — transforme le dump MG'65 (scripts/tmp/Bible_MG65.json,
 * domaine public : « Ny Baiboly Malagasy, 1865 ») en un bundle compact pour
 * l'app : src/data/bible.data.json  { books:[...], text:{ code:[[verset...]] } }
 *
 * Le texte des versets garde les balises <n>[sous-titre]</n> (rendues comme
 * intertitres côté écran de lecture).
 *
 * Lancer :  node scripts/build-bible.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'scripts', 'tmp', 'Bible_MG65.json');
const OUT = path.join(ROOT, 'src', 'data', 'bible.data.json');
const SRC_URL = 'https://raw.githubusercontent.com/Rohan29-AN/MG-Bible-65/main/Bible_MG65.json';

async function ensureSource() {
  if (fs.existsSync(SRC)) return;
  console.log('Téléchargement du texte MG 1865 (domaine public)…');
  fs.mkdirSync(path.dirname(SRC), { recursive: true });
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`Téléchargement échoué: HTTP ${res.status}`);
  fs.writeFileSync(SRC, Buffer.from(await res.arrayBuffer()));
}

// num MyBible → { code (référence), name (affichage) }. Noms malgaches usuels.
const CANON = {
  10: ['Gen', 'Genesisy'], 20: ['Eks', 'Eksodosy'], 30: ['Lev', 'Levitikosy'],
  40: ['Nom', 'Nomery'], 50: ['Deo', 'Deoteronomia'], 60: ['Jos', 'Josoa'],
  70: ['Mpits', 'Mpitsara'], 80: ['Rota', 'Rota'], 90: ['1Sam', '1 Samoela'],
  100: ['2Sam', '2 Samoela'], 110: ['1Mpan', '1 Mpanjaka'], 120: ['2Mpan', '2 Mpanjaka'],
  130: ['1Tan', '1 Tantara'], 140: ['2Tan', '2 Tantara'], 150: ['Ezra', 'Ezra'],
  160: ['Neh', 'Nehemia'], 190: ['Est', 'Estera'], 220: ['Joba', 'Joba'],
  230: ['Sal', 'Salamo'], 240: ['Ohab', 'Ohabolana'], 250: ['Mpit', 'Mpitoriteny'],
  260: ['Ton', "Tononkiran'i Solomona"], 290: ['Isa', 'Isaia'], 300: ['Jer', 'Jeremia'],
  310: ['Fita', 'Fitomaniana'], 330: ['Ezek', 'Ezekiela'], 340: ['Dan', 'Daniela'],
  350: ['Hos', 'Hosea'], 360: ['Joe', 'Joela'], 370: ['Amo', 'Amosa'],
  380: ['Oba', 'Obadia'], 390: ['Jon', 'Jona'], 400: ['Mika', 'Mika'],
  410: ['Nah', 'Nahoma'], 420: ['Hab', 'Habakoka'], 430: ['Zef', 'Zefania'],
  440: ['Hag', 'Hagay'], 450: ['Zak', 'Zakaria'], 460: ['Mal', 'Malakia'],
  470: ['Mat', 'Matio'], 480: ['Mar', 'Marka'], 490: ['Lio', 'Lioka'],
  500: ['Jao', 'Jaona'], 510: ['Asa', "Asan'ny Apostoly"], 520: ['Rom', 'Romana'],
  530: ['1Kor', '1 Korintiana'], 540: ['2Kor', '2 Korintiana'], 550: ['Gal', 'Galatiana'],
  560: ['Efe', 'Efesiana'], 570: ['Fil', 'Filipiana'], 580: ['Kol', 'Kolosiana'],
  590: ['1Tes', '1 Tesaloniana'], 600: ['2Tes', '2 Tesaloniana'], 610: ['1Tim', '1 Timoty'],
  620: ['2Tim', '2 Timoty'], 630: ['Tit', 'Titosy'], 640: ['Flm', 'Filemona'],
  650: ['Heb', 'Hebreo'], 660: ['Jak', 'Jakoba'], 670: ['1Pet', '1 Petera'],
  680: ['2Pet', '2 Petera'], 690: ['1Jao', '1 Jaona'], 700: ['2Jao', '2 Jaona'],
  710: ['3Jao', '3 Jaona'], 720: ['Joda', 'Joda'], 730: ['Apok', 'Apokalypsy'],
};

async function main() {
  await ensureSource();
  const db = JSON.parse(fs.readFileSync(SRC, 'utf8'));
  const booksRows = db.objects.find((o) => o.name === 'books').rows;
  const verseRows = db.objects.find((o) => o.name === 'verses').rows;

  const byNum = {};
  booksRows.forEach(([, num, short]) => (byNum[num] = { num, short }));

  // text[code][chapterIndex][verseIndex] = texte
  const text = {};
  const chapters = {};
  for (const [num, ch, v, t] of verseRows) {
    const canon = CANON[num];
    if (!canon) continue;
    const code = canon[0];
    if (!text[code]) text[code] = [];
    if (!text[code][ch - 1]) text[code][ch - 1] = [];
    text[code][ch - 1][v - 1] = t;
    chapters[code] = Math.max(chapters[code] || 0, ch);
  }

  const books = booksRows
    .map(([, num, short]) => {
      const canon = CANON[num];
      if (!canon) return null;
      const [code, name] = canon;
      return {
        id: num / 10, // 1..73 (approx) — on met un id séquentiel ensuite
        num,
        code,
        name,
        abbr: short,
        testament: num < 470 ? 'TT' : 'TV',
        chapters: chapters[code] || (text[code] ? text[code].length : 0),
      };
    })
    .filter(Boolean);

  // id séquentiel 1..66
  books.forEach((b, i) => (b.id = i + 1));

  const totalVerses = Object.values(text).reduce(
    (n, chs) => n + chs.reduce((m, arr) => m + (arr ? arr.filter(Boolean).length : 0), 0),
    0,
  );

  fs.writeFileSync(OUT, JSON.stringify({ books, text }));
  const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`✓ ${books.length} livres, ${totalVerses} versets → src/data/bible.data.json (${sizeMB} Mo)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
