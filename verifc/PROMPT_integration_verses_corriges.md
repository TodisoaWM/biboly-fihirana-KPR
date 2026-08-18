# Prompt pour Claude Code — Intégration du fichier Bible corrigé (MG1865)

## Contexte

On a comparé la source Bible actuellement utilisée par Mofon'aina (`verses.json`, extraite du dépôt GitHub `Rohan29-AN/MG-Bible-65`) avec une source alternative décodée depuis l'app "Baiboly & Fihirana Protestanta" (66 livres, 31 099 versets, déjà validée verset par verset contre les métadonnées du projet).

Résultat de la comparaison :
- Couverture identique (31 099 versets des deux côtés, 0 manquant, 0 doublon)
- Mais la source GitHub actuelle contient des défauts réels :
  - **976 bugs de concaténation** : le texte du verset suivant a été collé au verset courant lors de l'extraction GitHub
  - **36 versets disputés manquants/vidés** : Marc 16:9-20, Jean 7:53–8:11, Matthieu 17:21, Actes 8:37/15:34/24:7/28:29, Romains 16:24, etc. (versets classiques du Texte Reçu, absents du texte critique utilisé côté GitHub)
  - Variante orthographique "Hianao" au lieu de "Ianao"
  - ~1 167 autres divergences de contenu mineures à majeures

La nouvelle source (fichier `verses_complete_66books.json` fourni dans ce dossier) est donc plus fiable et doit remplacer l'ancienne.

## Fichiers fournis dans ce dossier de handoff

- `verses_complete_66books.json` — les 66 livres complets (31 099 versets), format identique à l'actuel `verses.json` du projet (clé `mg1865::mg_N::chapitre::verset`, champs `verse_version`, `verse_book`, `verse_chapter`, `verse_number`, `verse_date_revised`, `verse_title`, `verse_text`)
- `RAPPORT_verification_bible.md` — rapport complet de la comparaison (contexte, méthodologie, chiffres)
- `versets_disputes_absents_github.csv` — les 36 versets disputés à conserver
- `divergences_majeures_a_reviewer.csv` — 1 167 divergences de contenu, pour référence/traçabilité
- `bugs_concatenation_github.csv` — 976 bugs de concaténation détectés côté GitHub, pour référence/traçabilité

## Tâche à réaliser

1. **Localiser** le fichier `verses.json` actuellement utilisé dans le projet (probablement dans `prisma-seed/data/` ou équivalent — cherche dans le repo, notamment près de `seed-bible.ts` ou du module NestJS Mofon'aina).

2. **Créer une branche dédiée** : `fix/bible-verses-mg1865-corrections`.

3. **Comparer la structure** du `verses.json` actuel avec `verses_complete_66books.json` fourni — vérifie que le format de clés/champs est bien compatible avec ce qu'attend `seed-bible.ts` (et le parser de référence biblique `mofonaina-reference-parser.ts` si présent). Si un mapping ou une transformation est nécessaire (ex. structure de fichier légèrement différente), adapte-la avant de remplacer.

4. **Remplacer** l'ancien `verses.json` par le contenu de `verses_complete_66books.json`, en gardant le même chemin/nom de fichier dans le repo (pour ne rien casser côté code qui le consomme).

5. **Déplacer les 3 fichiers CSV + le rapport markdown** dans un dossier de documentation/traçabilité du repo, par exemple `docs/data-validation/bible-mg1865/` (créer si besoin) — pas dans `prisma-seed/data/`.

6. **Committer** avec un message clair, par exemple :
   ```
   fix(bible): remplace verses.json (source GitHub) par la version décodée
   depuis l'app Baiboly & Fihirana Protestanta

   - Corrige 976 bugs de concaténation de versets adjacents
   - Rétablit 36 versets disputés absents (Marc 16:9-20, Jean 7:53-8:11, etc.)
   - Couverture identique : 31 099 versets, 0 manquant, 0 doublon
   - Rapport complet et données de traçabilité dans docs/data-validation/bible-mg1865/
   ```

7. **Tester le seed** sur une base de test locale (`npx prisma db seed` ou la commande équivalente du projet). Vérifie que ça tourne sans erreur.

8. **Vérifier manuellement quelques versets** après import, notamment :
   - Un verset disputé (ex. `Marka 16:9` ou `Jaona 8:1`)
   - Un verset qui avait un bug de concaténation côté GitHub (voir `bugs_concatenation_github.csv` pour des exemples)
   - Un test existant du parser de référence biblique (`mofonaina-reference-parser.ts`) s'il y en a, pour confirmer que rien n'est cassé

9. Ne pas merger automatiquement sur `main` — laisse-moi relire le diff avant.

## Ce qui n'est PAS à faire

- Ne pas modifier `books_meta.json` ni `chapters_meta.json` (déjà validés, servent de référence)
- Ne pas supprimer l'ancien `verses.json` du disque avant que le seed de test ait été validé (il reste de toute façon dans l'historique Git après le commit)
- Ne pas publier ce repo ou le rendre public (usage privé/familial uniquement)
