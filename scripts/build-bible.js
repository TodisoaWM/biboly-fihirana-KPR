/* eslint-disable no-console */
/**
 * build-bible.js — transforme la Baiboly MG1865 corrigée (source/verses_complete_66books.json,
 * décodée depuis l'app « Baiboly & Fihirana Protestanta », cf. source/RAPPORT_verification_bible.md)
 * en un bundle compact pour l'app : src/data/bible.data.json  { books:[...], text:{ code:[[verset...]] } }
 *
 * Le texte des versets garde les balises <n>[sous-titre]</n> (rendues comme
 * intertitres côté écran de lecture).
 *
 * Lancer :  node scripts/build-bible.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'source', 'verses_complete_66books.json');
const OUT = path.join(ROOT, 'src', 'data', 'bible.data.json');

// num MyBible → { code (référence), name (affichage), abbr (abréviation courte) }.
const CANON = {
  10: ['Gen', 'Genesisy', 'Gen'], 20: ['Eks', 'Eksodosy', 'Eks'], 30: ['Lev', 'Levitikosy', 'Lev'],
  40: ['Nom', 'Nomery', 'Nom'], 50: ['Deo', 'Deoteronomia', 'Deo'], 60: ['Jos', 'Josoa', 'Jos'],
  70: ['Mpits', 'Mpitsara', 'Mpi'], 80: ['Rota', 'Rota', 'Rot'], 90: ['1Sam', '1 Samoela', '1Sa'],
  100: ['2Sam', '2 Samoela', '2Sa'], 110: ['1Mpan', '1 Mpanjaka', '1Mp'], 120: ['2Mpan', '2 Mpanjaka', '2Mp'],
  130: ['1Tan', '1 Tantara', '1Ta'], 140: ['2Tan', '2 Tantara', '2Ta'], 150: ['Ezra', 'Ezra', 'Ezr'],
  160: ['Neh', 'Nehemia', 'Neh'], 190: ['Est', 'Estera', 'Est'], 220: ['Joba', 'Joba', 'Job'],
  230: ['Sal', 'Salamo', 'Slm'], 240: ['Ohab', 'Ohabolana', 'Ohab'], 250: ['Mpit', 'Mpitoriteny', 'Mpit'],
  260: ['Ton', "Tononkiran'i Solomona", 'Ton'], 290: ['Isa', 'Isaia', 'Isa'], 300: ['Jer', 'Jeremia', 'Jer'],
  310: ['Fita', 'Fitomaniana', 'Fit'], 330: ['Ezek', 'Ezekiela', 'Ezek'], 340: ['Dan', 'Daniela', 'Dan'],
  350: ['Hos', 'Hosea', 'Hos'], 360: ['Joe', 'Joela', 'Joel'], 370: ['Amo', 'Amosa', 'Amos'],
  380: ['Oba', 'Obadia', 'Obad'], 390: ['Jon', 'Jona', 'Jona'], 400: ['Mika', 'Mika', 'Mika'],
  410: ['Nah', 'Nahoma', 'Nah'], 420: ['Hab', 'Habakoka', 'Hab'], 430: ['Zef', 'Zefania', 'Zef'],
  440: ['Hag', 'Hagay', 'Hag'], 450: ['Zak', 'Zakaria', 'Zak'], 460: ['Mal', 'Malakia', 'Mal'],
  470: ['Mat', 'Matio', 'Mat'], 480: ['Mar', 'Marka', 'Mark'], 490: ['Lio', 'Lioka', 'Liok'],
  500: ['Jao', 'Jaona', 'Joan'], 510: ['Asa', "Asan'ny Apostoly", 'Asan'], 520: ['Rom', 'Romana', 'Rom'],
  530: ['1Kor', '1 Korintiana', '1Kor'], 540: ['2Kor', '2 Korintiana', '2Kor'], 550: ['Gal', 'Galatiana', 'Gal'],
  560: ['Efe', 'Efesiana', 'Efez'], 570: ['Fil', 'Filipiana', 'Fil'], 580: ['Kol', 'Kolosiana', 'Kol'],
  590: ['1Tes', '1 Tesaloniana', '1Tes'], 600: ['2Tes', '2 Tesaloniana', '2Tes'], 610: ['1Tim', '1 Timoty', '1Tim'],
  620: ['2Tim', '2 Timoty', '2Tim'], 630: ['Tit', 'Titosy', 'Tito'], 640: ['Flm', 'Filemona', 'Flm'],
  650: ['Heb', 'Hebreo', 'Hebr'], 660: ['Jak', 'Jakoba', 'Jak'], 670: ['1Pet', '1 Petera', '1Pie'],
  680: ['2Pet', '2 Petera', '2Pie'], 690: ['1Jao', '1 Jaona', '1Jo'], 700: ['2Jao', '2 Jaona', '2Jo'],
  710: ['3Jao', '3 Jaona', '3Jo'], 720: ['Joda', 'Joda', 'Joda'], 730: ['Apok', 'Apokalypsy', 'Apok'],
};

async function main() {
  if (!fs.existsSync(SRC)) {
    throw new Error(`Source introuvable : ${SRC} (voir source/RAPPORT_verification_bible.md)`);
  }
  const db = JSON.parse(fs.readFileSync(SRC, 'utf8'));

  // db = { mg_1: { "mg1865::mg_1::ch::v": {verse_chapter, verse_number, verse_title, verse_text}, ... }, ..., mg_66: {...} }
  // mg_<id> correspond à l'id séquentiel 1..66, dans le même ordre canonique que CANON.
  const nums = Object.keys(CANON).map(Number).sort((a, b) => a - b);

  // text[code][chapterIndex][verseIndex] = texte
  const text = {};
  const chapters = {};
  nums.forEach((num, i) => {
    const id = i + 1;
    const code = CANON[num][0];
    const verses = db[`mg_${id}`];
    if (!verses) return;
    text[code] = [];
    for (const key of Object.keys(verses)) {
      const { verse_chapter: ch, verse_number: v, verse_title: title, verse_text: t } = verses[key];
      if (!text[code][ch - 1]) text[code][ch - 1] = [];
      text[code][ch - 1][v - 1] = title ? `<n>[${title}]</n> ${t}` : t;
      chapters[code] = Math.max(chapters[code] || 0, ch);
    }
  });

  const books = nums.map((num, i) => {
    const [code, name, abbr] = CANON[num];
    return {
      id: i + 1,
      num,
      code,
      name,
      abbr,
      testament: num < 470 ? 'TT' : 'TV',
      chapters: chapters[code] || (text[code] ? text[code].length : 0),
    };
  });

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
