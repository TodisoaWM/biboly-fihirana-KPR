import { useRouter } from 'expo-router';

/**
 * Retour arrière sûr : revient en arrière s'il y a un historique, sinon
 * remplace par une route de repli (évite le warning « GO_BACK was not handled »
 * quand un écran est ouvert en première route / lien direct / rafraîchissement).
 */
export function useSafeBack(fallback: string = '/(tabs)') {
  const router = useRouter();
  return () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback as never);
  };
}
