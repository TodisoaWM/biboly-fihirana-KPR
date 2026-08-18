# Rapport de vérification — Baiboly MG1865 (Mofon'aina)

## 1. Décodage XOR des livres 59 à 66

- Clé XOR (20 octets) appliquée à tous les fichiers `.bin` du `.rar` : décodage **réussi à 100%**.
- Vérification sur les 58 livres déjà validés (`verses_partial.json`) : **0 écart** — clé et logique de décodage confirmées identiques.
- **66 livres décodés et validés structurellement** contre `books_meta.json` (nombre de chapitres) et `chapters_meta.json` (nombre de versets par chapitre) : **0 anomalie** (aucun chapitre manquant, aucun verset manquant/en trop dans aucun livre).
- Les 8 livres manquants (59 à 66 : Jakoba → Apokalypsy) sont extraits dans `verses_59_66.json` — **836 versets**.

## 2. Comparaison avec `verses.json` (GitHub `Rohan29-AN/MG-Bible-65`)

Comparaison verset par verset (clé livre/chapitre/verset) entre nos 66 livres décodés (source app "Baiboly & Fihirana Protestanta") et la source GitHub utilisée actuellement dans Mofon'aina.

### Couverture structurelle : parfaite
- **0 verset manquant** dans notre source (tout ce qui existe sur GitHub existe chez nous)
- **0 verset manquant** sur GitHub (tout ce qui existe chez nous existe sur GitHub)
- **0 doublon** détecté dans nos données décodées
- Total : **31 099 versets** des deux côtés ✅

### Différences de texte : 8 488 versets sur 31 099 (~27%)

Après normalisation (suppression des tirets conditionnels invisibles U+00AD et harmonisation des variantes typographiques ô/o, ì/i, ỳ/y, à/a) :

| Catégorie | Nombre | Nature |
|---|---|---|
| Cosmétique pur (accents/caractères invisibles) | 1 085 | Aucune action requise |
| **Bugs de concaténation côté GitHub** | 976 | Le texte du verset suivant a été collé au verset courant lors de l'extraction GitHub (erreur de parsing, pas de nos données) |
| Différences mineures (similarité >95%) | 4 589 | Essentiellement "Ianao" (notre source) vs "Hianao" (GitHub, orthographe archaïque), tirets de mots composés "an'efitra" vs "an-efitra", ponctuation |
| **Versets disputés absents sur GitHub** | 36 | Voir section 3 — versets de critique textuelle connus (Marc 16:9-20, Jean 7:53–8:11, etc.) présents dans notre source, vides sur GitHub |
| **Divergences majeures à examiner** | 1 167 | Voir section 4 — vrais écarts de contenu (mots différents, négations, notes de bas de page mal formatées) |

## 3. Versets disputés (critique textuelle) — présents chez nous, vides sur GitHub

Ce ne sont **pas des erreurs** : ce sont les versets classiquement disputés entre le Texte Reçu (traduction traditionnelle protestante, notre source) et le texte critique (Nestle-Aland, souvent utilisé par les éditions modernes comme GitHub) :

- **Marc 16:9-20** (16 versets) — la « finale longue » de Marc
- **Jean 7:53–8:11** (12 versets) — l'épisode de la femme adultère
- **Matthieu 17:21**, **Luc 23:17**, **Marc 7:16, 9:44, 9:46, 11:26, 15:28**
- **Actes 8:37, 15:34, 24:7, 28:29**
- **Romains 16:24**

→ Fichier détaillé : `versets_disputes_absents_github.csv` (36 lignes). **Recommandation** : garder ces versets (ils font partie intégrante de la Baiboly MG1865 traditionnelle utilisée par les Églises malgaches).

## 4. Divergences majeures à examiner manuellement

1 167 versets où le texte diffère significativement (au-delà des simples variantes Ianao/Hianao). Exemples de causes identifiées :

- **Notes de bas de page** : notre source utilise `[*note]`, GitHub utilise des balises `<n>[note]</n>` intégrées au texte — à normaliser dans les deux cas.
- **Négations/mots manquants** : ex. `II Samoela 17:23` — GitHub a perdu un "tsy" (négation), inversant le sens.
- **Décalage de verset** : ex. `Lioka 17:36` — GitHub a fusionné le verset disputé 17:36 avec le texte du verset 17:37 (bug de parsing confirmé).
- Coquilles ponctuelles (lettre manquante, espace mal placé).

→ Fichier détaillé : `divergences_majeures_a_reviewer.csv` (1 167 lignes, triées par livre/chapitre/verset, avec ratio de similarité).

→ Fichier des 976 bugs de concaténation détectés : `bugs_concatenation_github.csv`.

## 5. Conclusion et recommandation

**Notre source (décodage de l'app Baiboly & Fihirana Protestanta) est la plus fiable des deux** :
- Structure impeccable (0 erreur de comptage chapitres/versets)
- Contient les versets disputés traditionnels complets
- Ne présente aucun bug de concaténation

**Le fichier `verses.json` actuel du projet Mofon'aina (source GitHub) contient des defauts d'extraction** (976 concaténations de versets adjacents, versets disputés vidés, variante orthographique "Hianao").

**Recommandation** : remplacer `verses.json` du projet Mofon'aina par `verses_complete_66books.json` (joint), qui fusionne les 58 livres déjà validés + les 8 nouveaux livres décodés, tous vérifiés structurellement à 100%.
