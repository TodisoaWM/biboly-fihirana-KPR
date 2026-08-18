/* eslint-disable no-console */
/**
 * build-vavaka.js — transforme les prières (source/vavaka_all.json) en bundle
 * app compact : src/data/vavaka.data.json
 *
 * Source : source/vavaka_all.json
 *   { title, tradition, category, source_url, lines[], text, scripture_references[] }
 *
 * Modèle app (allégé) : on garde title/tradition/category/lines + refs bibliques
 * (source_url et text sont retirés : non affichés, `text` se rederive de `lines`).
 *
 * Lancer :  npm run vavaka:build
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'source', 'vavaka_all.json');
const OUT = path.join(ROOT, 'src', 'data', 'vavaka.data.json');

const raw = JSON.parse(fs.readFileSync(SRC, 'utf-8'));

const out = raw.map((v, i) => ({
  id: `v-${i + 1}`,
  title: v.title,
  tradition: v.tradition, // "katolika" | "protestanta"
  category: v.category || null,
  lines: v.lines, // "" = saut de paragraphe
  refs: (v.scripture_references || []).map((r) => ({
    raw: r.raw,
    book: r.book,
    chapter: r.chapter,
    start: r.verse_start,
    end: r.verse_end,
  })),
}));

fs.writeFileSync(OUT, JSON.stringify(out), 'utf-8');
const byTrad = out.reduce((a, v) => ((a[v.tradition] = (a[v.tradition] || 0) + 1), a), {});
console.log(`✓ ${out.length} vavaka → src/data/vavaka.data.json`, byTrad);
