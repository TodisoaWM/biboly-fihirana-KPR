/* eslint-disable no-console */
/**
 * build-mofonaina.js — transforme le calendrier CSV (184 jours, Jolay→Desambra
 * 2026) en bundle app : src/data/mofonaina.data.json  [{ date, theme, reference }]
 *
 * Source : claude-code-handoff/mofonaina_2026.csv
 *   colonnes : Mois, Jour, Thème, Référence (abrégée), Référence (nom complet)
 *
 * Lancer :  npm run mofonaina:build
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'claude-code-handoff', 'mofonaina_2026.csv');
const OUT = path.join(ROOT, 'src', 'data', 'mofonaina.data.json');
const YEAR = 2026;

const MONTHS = {
  Janoary: 1, Febroary: 2, Martsa: 3, Aprily: 4, Mey: 5, Jona: 6,
  Jolay: 7, Aogositra: 8, Septambra: 9, Oktobra: 10, Novambra: 11, Desambra: 12,
};

/** Parse une ligne CSV en tenant compte des champs entre guillemets. */
function parseLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQ = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function main() {
  const raw = fs.readFileSync(SRC, 'utf8').replace(/^﻿/, '');
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  lines.shift(); // en-tête

  const entries = [];
  for (const line of lines) {
    const [mois, jour, theme, refAbbr] = parseLine(line);
    const m = MONTHS[mois];
    const d = parseInt(jour, 10);
    if (!m || !d) {
      console.warn(`ligne ignorée: ${line}`);
      continue;
    }
    const date = `${YEAR}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    entries.push({ date, theme: theme.trim(), reference: refAbbr.trim() });
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));
  fs.writeFileSync(OUT, JSON.stringify(entries));
  console.log(`✓ ${entries.length} jours (${entries[0].date} → ${entries[entries.length - 1].date}) → src/data/mofonaina.data.json`);
}

main();
