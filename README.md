# Mofon'aina — application mobile

Application familiale (usage privé) de lecture biblique quotidienne malgache,
construite à partir de la maquette `Mofonaina.dc.html` (versions claire + sombre).

Stack : **Expo (SDK 57) · React Native · expo-router · React Native Web**.

## Lancer l'app

```bash
npm install
npm run web       # navigateur (http://localhost:8081)
npm run android   # émulateur / appareil Android
npm run ios        # simulateur iOS (macOS)
```

## Écrans (repris 1:1 de la maquette)

| Route | Écran | Contenu |
|-------|-------|---------|
| `(tabs)/index` | **Androany** | Salutation, illustration du jour, carte Mofon'aina + bouton « Vakio androany » |
| `(tabs)/baiboly` | **Safidio ny lohahevitrao** | Choix Baiboly / Fihirana |
| `(tabs)/fihirana` | **Fihirana** | Recherche, recueils FFPM/Fanampiny, dernier chant ouvert |
| `(tabs)/tiana` | **Tiana** | Éléments favoris (non détaillé dans la maquette, aligné sur le design) |
| `reading` | **Lecture biblique** | Chapitre, versets numérotés, navigation toko précédent/suivant |
| `books` | Liste des livres | 66 livres groupés par testament |
| `settings` | **Kirakira** | Profil, thème clair/sombre, couleur d'accent, taille de police, réglages |

Barre d'onglets personnalisée (`src/components/TabBar.tsx`) fidèle à la maquette
(pastille active, libellés malgaches).

## Thème

- `src/theme/colors.ts` — palettes claire/sombre extraites des deux maquettes,
  rayons, espacements, familles de police.
- `src/theme/ThemeProvider.tsx` — mode (clair/sombre/système), **accent choisi**
  (Loko fototra), **échelle de police** (Habe soratra), persistés via
  `AsyncStorage`. `useTheme()` expose la palette courante.
- Polices : Playfair Display (titres), Nunito Sans (UI), Lora (versets), chargées
  via `@expo-google-fonts/*` dans `src/app/_layout.tsx`.
- Icônes : `src/components/Icon.tsx` reproduit les tracés SVG de la maquette
  (`react-native-svg`).

## Données

### Baiboly (texte complet, réel)

`src/data/bible.data.json` contient **le texte intégral de la Baiboly Malagasy
MG 1865 (domaine public) : 66 livres, 31 099 versets**, généré depuis le dépôt
public [Rohan29-AN/MG-Bible-65](https://github.com/Rohan29-AN/MG-Bible-65) :

```bash
npm run bible:build   # (re)télécharge la source et régénère le JSON compact
```

`src/data/bible.ts` expose : `BOOKS`, `getChapter`, un **parseur de références**
et une recherche. Les sous-titres `<n>[...]</n>` sont extraits et affichés en
intertitres dans l'écran de lecture.

**Choisir une référence précise (plage de versets)** — `parseReference` comprend
la forme courte ET le langage naturel malgache :

- « Sal 23 », « Jao 3.16 », « 1 Kor 13:4-7 »
- « Genesisy toko 1 andininy 2 à 3 », « … ka hatramin'ny 3 », « … andininy 2-3 »

Quand une plage est ouverte (depuis la recherche), l'écran de lecture affiche un
bandeau « Andininy 2–3 », **surligne** ces versets (barre + fond) et **défile
automatiquement** dessus (bouton « Ny toko manontolo ✕ » pour revenir au toko
entier). Autres recherches : nom de livre (`searchBooks`) et **plein-texte** dans
les 31 099 versets (`searchVerses`).

Navigation : Baiboly → liste des livres → grille des toko → lecture (toko
précédent/suivant, taille de police). Recherche : icône 🔍 (écran Baiboly) et
barre de l'écran Fihirana → `search.tsx` (références, livres, versets, hira).

### Fihirana (complet, réel — usage privé/familial)

`src/data/fihirana.data.json` (2,6 Mo, généré par `npm run fihirana:build`
depuis `claude-code-handoff/*.json`) contient **2 996 chants** :

- **Protestanta** : FFPM (814) + Fanampiny (54) + Antema (24) — strophes avec
  refrain (`fiverenany`) affiché à part (italique, non numéroté) ;
- **Katolika** : 7 recueils (Dera 473, Hasina 1259, Vavaka sy Hira 1009, Vaovao
  847, Ankalazao 465, Karine Dera 153, Antsao 496). Un même chant peut figurer
  dans plusieurs recueils avec des pages différentes → affiché « Hita ihany koa
  ao : … » (jamais dédupliqué).

`src/data/fihirana.ts` : `COLLECTIONS`, `getHymnsByCollection`, `getHymn`,
`searchHymns` (par numéro/page, indice de recueil, ou titre). Écrans : onglet
Fihirana (recueils groupés par tradition) → liste (`FlatList`) → détail
(`hymn.tsx`, strophes + refrains + autres recueils). Sources : github
Rohan29-AN/Fihirana-FFPM et heriniaina/fihirana-katolika (voir en-tête du
script pour les licences).

### Mofon'aina (moteur prêt, calendrier ⚠️ exemple)

Le système est complet : `src/data/mofonaina.ts` = un **calendrier par date**
(`{ date, theme, reference }`, jour/mois malgaches calculés) + `getMofonainaForDate`.
La référence (« 1 Tes 5.14,15 », « Eks 32.1-14 ») est **résolue en versets réels**
par `getReading` / `resolveReference` (bible.ts, gère `.`, `,`, plages, mots-clés MG).

Parcours : carte d'accueil (thème + extrait du jour) → **« Vakio androany »** →
`mofonaina.tsx` (thème + versets exacts) → **« Vakio ny toko manontolo »** → écran
de lecture avec la plage surlignée.

**Calendrier réel (184 jours)** : `src/data/mofonaina.data.json` généré par
`npm run mofonaina:build` depuis `claude-code-handoff/mofonaina_2026.csv`
(Jolay→Desambra 2026). Toutes les références se résolvent (le résolveur gère les
abréviations MG — Apo, Eze, Oha, 1/2 Mpa, File — et les livres à un seul chapitre
écrits en versets, ex. « File 1-7 »).

**Écran « Mofon'aina 2026 »** (`about-mofonaina.tsx`, atteint via Kirakira → la
ligne « Momba an'i Mofon'aina » renommée) : contenu « à propos » + le calendrier
complet groupé par mois (`SectionList`), jour courant surligné, clic sur un jour
→ la lecture du jour.

> Le module backend NestJS (`getYearCalendar`, `GET /mofonaina/calendar`) est une
> tâche du **projet backend séparé** — ce dépôt-ci est le frontend Expo, il n'y a
> pas de module Nest à fusionner ici.

## Ambiance depuis une image (palette au build)

L'app change **toute son ambiance** (couleur primaire, fonds, surfaces, puces,
dégradés — en clair **et** sombre) selon l'image héro choisie.

La palette est calculée **une seule fois**, au moment où on ajoute des images,
et figée en dur — aucun calcul d'image au runtime.

```bash
# 1. déposer des .jpg dans  assets/images/hero/
# 2. générer les ambiances :
npm run hero:palettes
```

Le script `scripts/extract-hero-palettes.js` :

1. décode chaque JPEG (`jpeg-js`, pur JS), quantifie les couleurs, choisit une
   dominante « vibrante » (primary) + une teinte secondaire (accent) ;
2. recale saturation/luminosité dans des bandes cibles (style doux de l'app) et
   dérive tous les tokens du thème, clair + sombre, **fond dégradé compris**
   (`bg → bg2`, fond nettement teinté par l'ambiance) ;
3. **contraste WCAG** : ajuste primary/onPrimary et le texte des puces pour
   garder un ratio ≥ 4.5:1 (jamais de bouton illisible) ;
4. **optimise** l'image (redimensionnée ≤ 900 px + recompressée) et la copie
   sous un nom ASCII dans `assets/hero/` (les noms avec espaces/accents/emojis
   cassent `require()`) ; nettoie les copies orphelines ;
5. génère un **placeholder flou (LQIP)** en data URI base64 (affiché pendant le
   chargement du hero) ;
6. met la **couleur du splash** (`app.json`) sur l'ambiance par défaut ;
7. écrit le tout dans `src/theme/heroThemes.generated.ts` (⚠️ auto-généré).

Au runtime, `ThemeProvider` lit ce fichier :

- **Ambiance 100 % automatique** : une image par jour, rotation déterministe par
  date (`heroKeyForDate`) — l'utilisateur ne choisit pas, l'app change de couleur
  chaque jour toute seule. Kirakira affiche l'image du jour en lecture seule
  (« Endriky ny andro ») ;
- le fond de chaque écran est un dégradé `bg → bg2` qui suit l'image
  (`components/Screen.tsx`) ;
- « Loko fototra » reste une surcharge manuelle de la primaire.

Les cartes gardent une séparation nette sur ces fonds teintés via une bordure
fine (`theme.border`) + une ombre cross-platform (`theme/elevation.ts` — `boxShadow`
sur le web, props natives ailleurs, car RN Web ignore les props `shadow*`).

## Sous-titres de section

Les `<n>[...]</n>` de la maquette backend sont modélisés proprement par le champ
`heading` de `ChapterContent` (affiché en intertitre coloré), plutôt que
conservés sous forme de balises dans le texte.

## Licence

Ce projet est publié sous la **PolyForm Noncommercial License 1.0.0**
(voir `LICENSE`) : usage, modification et redistribution libres **à des fins
non commerciales** — usage personnel, cultuel, associatif, éducatif. La vente
et toute exploitation commerciale ne sont pas autorisées.

> Tsy azo amidy fa zaraina maimaimpoana.

Le template Expo dont est issu le projet reste sous licence MIT, et les
contenus textuels (Baiboly MG1865, recueils de cantiques) ont leurs propres
provenances : voir `THIRD-PARTY-NOTICES.md`.
