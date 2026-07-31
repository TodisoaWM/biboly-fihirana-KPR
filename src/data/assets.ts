import type { ImageSource } from '@/components/ImageSlot';

/**
 * Emplacements image de l'app (cf. `<image-slot>` de la maquette).
 *
 * Pour afficher une vraie image, remplacer `null` par :
 *   - un fichier local :  require('@/assets/images/mon-image.png')
 *   - une URL distante :  { uri: 'https://…' }
 *
 * Tant que la valeur vaut `null`, le placeholder décoratif s'affiche.
 */
export const ASSETS: {
  /** Photo de profil (avatar) — écrans Androany, Baiboly, Kirakira. */
  avatar: ImageSource;
} = {
  avatar: null,
};

// L'illustration du jour (hero) est désormais pilotée par l'ambiance :
// voir `src/theme/heroThemes.generated.ts` (généré par `npm run hero:palettes`)
// et le sélecteur « Sary sy endrika » dans l'écran Kirakira.
