/* eslint-disable no-console */
/**
 * extract-hero-palettes.js
 * ------------------------------------------------------------------
 * Script de BUILD (à lancer quand on ajoute/retire des images héro).
 * Pour chaque image :
 *   1. décode le JPEG (jpeg-js, pur JS) ;
 *   2. quantifie les couleurs → dominante « vibrante » (primary) + accent ;
 *   3. recale S/L dans des bandes cibles et dérive TOUS les tokens du thème
 *      (clair + sombre), y compris un fond dégradé (bg → bg2) ;
 *   4. [idée 1] garde-fou de CONTRASTE WCAG : ajuste primary/onPrimary et le
 *      texte des puces pour rester lisibles (ratio ≥ 4.5:1) ;
 *   5. [idée 2] écrit une COPIE OPTIMISÉE (redimensionnée + recompressée) sous
 *      un nom ASCII dans assets/hero/ ;
 *   6. [idée 3] génère un placeholder FLOU (LQIP, data URI base64) ;
 *   7. [idée 5] met la couleur du splash (app.json) sur l'ambiance par défaut.
 *
 * Sortie figée en dur : src/theme/heroThemes.generated.ts
 * Lancer :  npm run hero:palettes
 */

const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'assets', 'images', 'hero');
const OUT_IMG_DIR = path.join(ROOT, 'assets', 'hero');
const OUT_TS = path.join(ROOT, 'src', 'theme', 'heroThemes.generated.ts');
const APP_JSON = path.join(ROOT, 'app.json');

const DISPLAY_WIDTH = 900; // largeur max des copies embarquées
const DISPLAY_QUALITY = 72;
const BLUR_WIDTH = 24; // largeur du placeholder flou
const BLUR_QUALITY = 45;

// ─────────────────────────────── utils couleur ───────────────────────────────

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function relLuminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

/** Ratio de contraste WCAG entre deux couleurs. */
function contrast(a, b) {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

const CREAM = '#FFFDF0';
const INK = '#232020';

/** Meilleure couleur de texte (crème/encre) au-dessus d'un fond. */
function bestOn(bg) {
  return contrast(CREAM, bg) >= contrast(INK, bg) ? CREAM : INK;
}

/** [idée 1] Primaire lisible : ajuste L jusqu'à contraste ≥ 4.5 avec son texte. */
function makePrimary(H, S) {
  let L = 0.38;
  for (let i = 0; i < 14; i++) {
    const hex = hslToHex(H, S, L);
    const on = bestOn(hex);
    if (contrast(on, hex) >= 4.5) return { primary: hex, onPrimary: on };
    L += on === CREAM ? -0.03 : 0.03;
    L = clamp(L, 0.14, 0.86);
  }
  const hex = hslToHex(H, S, L);
  return { primary: hex, onPrimary: bestOn(hex) };
}

/** [idée 1] Texte de puce lisible sur son fond : ajuste L dans un sens donné. */
function fixText(H, S, L, bg, darken) {
  for (let i = 0; i < 16; i++) {
    const hex = hslToHex(H, S, L);
    if (contrast(hex, bg) >= 4.5) return hex;
    L += darken ? -0.04 : 0.04;
    L = clamp(L, 0.02, 0.98);
  }
  return hslToHex(H, S, L);
}

function hueDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

// ─────────────────────────────── image ───────────────────────────────

function decode(filePath) {
  return jpeg.decode(fs.readFileSync(filePath), { maxMemoryUsageInMB: 1024, formatAsRGBA: true });
}

/** Réduction par moyenne de blocs (box filter). */
function downscale(img, targetW) {
  const { data, width, height } = img;
  if (width <= targetW) return img;
  const tw = targetW;
  const th = Math.max(1, Math.round((height * targetW) / width));
  const out = new Uint8Array(tw * th * 4);
  const bx = width / tw;
  const by = height / th;
  for (let y = 0; y < th; y++) {
    const sy0 = Math.floor(y * by);
    const sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * by));
    for (let x = 0; x < tw; x++) {
      const sx0 = Math.floor(x * bx);
      const sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * bx));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let sy = sy0; sy < sy1 && sy < height; sy++) {
        for (let sx = sx0; sx < sx1 && sx < width; sx++) {
          const i = (sy * width + sx) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          a += data[i + 3];
          n++;
        }
      }
      const o = (y * tw + x) * 4;
      out[o] = r / n;
      out[o + 1] = g / n;
      out[o + 2] = b / n;
      out[o + 3] = a / n;
    }
  }
  return { data: out, width: tw, height: th };
}

function encodeJpeg(img, quality) {
  return jpeg.encode({ data: Buffer.from(img.data), width: img.width, height: img.height }, quality).data;
}

function analyze(img) {
  const { width, height, data } = img;
  const target = 6000;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / target)));
  const buckets = new Map();
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const a = data[i + 3];
      if (a < 125) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      const cur = buckets.get(key);
      if (cur) {
        cur.count++;
        cur.r += r;
        cur.g += g;
        cur.b += b;
      } else {
        buckets.set(key, { count: 1, r, g, b });
      }
    }
  }
  const swatches = [...buckets.values()].map((s) => {
    const r = s.r / s.count;
    const g = s.g / s.count;
    const b = s.b / s.count;
    const [h, sat, lum] = rgbToHsl(r, g, b);
    return { count: s.count, h, s: sat, l: lum };
  });
  const score = (sw) => sw.count * (0.35 + 0.65 * sw.s) * clamp(1 - Math.abs(sw.l - 0.5) * 1.2, 0.15, 1);
  const colorful = swatches.filter((s) => s.s > 0.16 && s.l > 0.08 && s.l < 0.92);
  const pool = colorful.length ? colorful : swatches;
  const primary = pool.slice().sort((a, b) => score(b) - score(a))[0];
  const accentCands = pool
    .filter((s) => hueDiff(s.h, primary.h) > 28 && s.s > 0.18)
    .sort((a, b) => b.count * (0.5 + b.s) - a.count * (0.5 + a.s));
  const accent = accentCands[0] || { h: primary.h + 150, s: 0.4, l: 0.6 };
  return { primary, accent };
}

// ─────────────────────────────── ambiance ───────────────────────────────

function deriveAmbiance(primary, accent) {
  const Hp = primary.h;
  const Ha = accent.h;
  const Sp = clamp(primary.s, 0.3, 0.52);

  const { primary: primaryHex, onPrimary } = makePrimary(Hp, Sp);
  const accentHex = hslToHex(Ha, clamp(accent.s, 0.32, 0.55), 0.64);

  // Fonds plus colorés + dégradé bg → bg2 (demande explicite).
  const lightChipBg = hslToHex(Hp, 0.3, 0.88);
  const darkChipBg = hslToHex(Hp, 0.34, 0.26);

  const light = {
    bg: hslToHex(Hp, 0.2, 0.955),
    bg2: hslToHex(Hp, 0.34, 0.915),
    surface: hslToHex(Hp, 0.08, 0.995),
    surfaceAlt: hslToHex(Hp, 0.14, 0.94),
    chipBg: lightChipBg,
    chipText: fixText(Hp, 0.5, 0.3, lightChipBg, true),
    tabActiveBg: hslToHex(Hp, 0.32, 0.86),
    heroFrom: hslToHex(Ha, 0.55, 0.9),
    heroTo: hslToHex(Hp, 0.45, 0.92),
    cardPinkFrom: hslToHex(Ha, 0.55, 0.9),
    cardPinkTo: hslToHex(Hp, 0.45, 0.92),
    cardTealFrom: hslToHex(Hp, 0.3, 0.94),
    cardTealTo: hslToHex(Hp, 0.18, 0.975),
  };

  const dark = {
    bg: hslToHex(Hp, 0.32, 0.11),
    bg2: hslToHex(Hp, 0.4, 0.16),
    surface: hslToHex(Hp, 0.24, 0.2),
    surfaceAlt: hslToHex(Hp, 0.26, 0.16),
    chipBg: darkChipBg,
    chipText: fixText(Hp, 0.55, 0.8, darkChipBg, false),
    tabActiveBg: darkChipBg,
    heroFrom: hslToHex(Ha, 0.32, 0.24),
    heroTo: hslToHex(Hp, 0.32, 0.2),
    cardPinkFrom: hslToHex(Ha, 0.32, 0.24),
    cardPinkTo: hslToHex(Hp, 0.32, 0.2),
    cardTealFrom: hslToHex(Hp, 0.28, 0.18),
    cardTealTo: hslToHex(Hp, 0.26, 0.23),
  };

  return { primary: primaryHex, accent: accentHex, onPrimary, light, dark };
}

// ─────────────────────────────── nom de fichier ───────────────────────────────

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function titleFor(name) {
  const base = name.replace(/\.[a-z0-9]+$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return (base.charAt(0).toUpperCase() + base.slice(1)).slice(0, 30) || 'Sary';
}

// ─────────────────────────────── main ───────────────────────────────

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Dossier source introuvable: ${SRC_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_IMG_DIR, { recursive: true });

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /\.(jpe?g)$/i.test(f))
    .sort();
  if (!files.length) {
    console.error('Aucune image .jpg dans assets/images/hero/');
    process.exit(1);
  }

  const entries = [];
  const usedSlugs = new Set();
  const orphans = new Set(fs.readdirSync(OUT_IMG_DIR));
  let savedBytes = 0;

  files.forEach((file, idx) => {
    const src = path.join(SRC_DIR, file);
    let slug = slugify(file) || `hero-${idx + 1}`;
    while (usedSlugs.has(slug)) slug = `${slug}-${idx + 1}`;
    usedSlugs.add(slug);

    try {
      const img = decode(src);
      const { primary, accent } = analyze(img);
      const amb = deriveAmbiance(primary, accent);

      // [idée 2] copie optimisée
      const display = encodeJpeg(downscale(img, DISPLAY_WIDTH), DISPLAY_QUALITY);
      const outName = `${slug}.jpg`;
      fs.writeFileSync(path.join(OUT_IMG_DIR, outName), display);
      orphans.delete(outName);
      savedBytes += fs.statSync(src).size - display.length;

      // [idée 3] placeholder flou
      const blurBuf = encodeJpeg(downscale(img, BLUR_WIDTH), BLUR_QUALITY);
      const blur = `data:image/jpeg;base64,${Buffer.from(blurBuf).toString('base64')}`;

      entries.push({ key: slug, label: titleFor(file), file: outName, blur, ...amb });
      console.log(`✓ ${file}  →  ${amb.primary} / ${amb.accent}  (${(display.length / 1024) | 0} Ko)`);
    } catch (e) {
      console.warn(`✗ ${file} ignorée: ${e.message}`);
    }
  });

  for (const stale of orphans) {
    if (/\.jpe?g$/i.test(stale)) {
      fs.unlinkSync(path.join(OUT_IMG_DIR, stale));
      console.log(`– copie orpheline supprimée: ${stale}`);
    }
  }

  writeTs(entries);
  if (entries[0]) patchSplash(entries[0]);
  console.log(
    `\n${entries.length} ambiances → src/theme/heroThemes.generated.ts` +
      `\n~${(savedBytes / 1024 / 1024).toFixed(1)} Mo économisés sur les copies.`,
  );
}

/** [idée 5] Couleur du splash = ambiance par défaut. */
function patchSplash(first) {
  try {
    const app = JSON.parse(fs.readFileSync(APP_JSON, 'utf8'));
    const plugins = app.expo?.plugins || [];
    for (const p of plugins) {
      if (Array.isArray(p) && p[0] === 'expo-splash-screen' && p[1]) {
        p[1].backgroundColor = first.primary;
      }
    }
    fs.writeFileSync(APP_JSON, JSON.stringify(app, null, 2) + '\n', 'utf8');
    console.log(`✓ splash backgroundColor = ${first.primary} (app.json)`);
  } catch (e) {
    console.warn(`splash non mis à jour: ${e.message}`);
  }
}

function writeTs(entries) {
  const amb = (a) =>
    `{ bg: '${a.bg}', bg2: '${a.bg2}', surface: '${a.surface}', surfaceAlt: '${a.surfaceAlt}', chipBg: '${a.chipBg}', chipText: '${a.chipText}', tabActiveBg: '${a.tabActiveBg}', heroFrom: '${a.heroFrom}', heroTo: '${a.heroTo}', cardPinkFrom: '${a.cardPinkFrom}', cardPinkTo: '${a.cardPinkTo}', cardTealFrom: '${a.cardTealFrom}', cardTealTo: '${a.cardTealTo}' }`;

  const body = entries
    .map(
      (e) => `  '${e.key}': {
    key: '${e.key}',
    label: ${JSON.stringify(e.label)},
    image: require('../../assets/hero/${e.file}'),
    blur: ${JSON.stringify(e.blur)},
    primary: '${e.primary}',
    accent: '${e.accent}',
    onPrimary: '${e.onPrimary}',
    light: ${amb(e.light)},
    dark: ${amb(e.dark)},
  },`,
    )
    .join('\n');

  const ts = `/* AUTO-GÉNÉRÉ par scripts/extract-hero-palettes.js — NE PAS ÉDITER À LA MAIN.
 * Relancer avec: npm run hero:palettes
 */
export type HeroAmbianceTokens = {
  bg: string;
  bg2: string;
  surface: string;
  surfaceAlt: string;
  chipBg: string;
  chipText: string;
  tabActiveBg: string;
  heroFrom: string;
  heroTo: string;
  cardPinkFrom: string;
  cardPinkTo: string;
  cardTealFrom: string;
  cardTealTo: string;
};

export type HeroTheme = {
  key: string;
  label: string;
  image: number;
  blur: string;
  primary: string;
  accent: string;
  onPrimary: string;
  light: HeroAmbianceTokens;
  dark: HeroAmbianceTokens;
};

export const HERO_THEMES: Record<string, HeroTheme> = {
${body}
};

export const HERO_KEYS: string[] = Object.keys(HERO_THEMES);
export const DEFAULT_HERO_KEY: string | null = HERO_KEYS[0] ?? null;
`;

  fs.writeFileSync(OUT_TS, ts, 'utf8');
}

main();
