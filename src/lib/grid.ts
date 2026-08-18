import { Platform } from 'react-native';

import { SPACING } from '@/theme/colors';

/** Grilles de numéros (chapitres / versets) — logique commune à tous les écrans. */
export const GRID_GAP = 10;
const TARGET_CELL = 62; // taille de cellule visée ; le nb de colonnes s'y adapte

/**
 * Taille d'une cellule carrée pour une grille PLEINE LARGEUR.
 *
 * Le nombre de colonnes est déduit de la largeur réelle disponible (adaptatif) :
 * la grille remplit donc toujours l'écran, sans espace mort à droite — quel que
 * soit l'appareil. Sur le WEB uniquement, la largeur est bornée à 440 (largeur
 * max du cadre téléphone simulé) ; sur Android/iOS on prend TOUTE la largeur de
 * l'écran (le `Math.min(…, 440)` précédent laissait un grand vide sur les
 * appareils/émulateurs plus larges que 440dp — c'était le bug).
 */
export function gridCellSize(screenWidth: number): number {
  const w = Platform.OS === 'web' ? Math.min(screenWidth, 440) : screenWidth;
  const avail = w - SPACING.xl * 2;
  const cols = Math.max(4, Math.round((avail + GRID_GAP) / (TARGET_CELL + GRID_GAP)));
  return Math.floor((avail - GRID_GAP * (cols - 1)) / cols);
}
