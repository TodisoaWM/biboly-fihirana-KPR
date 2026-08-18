import { ImageBackground, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

const COUVERTURE = require('../../assets/images/couverture/couverture.png');

/**
 * Écran de démarrage : la couverture en PLEIN ÉCRAN pendant le chargement de
 * l'app (polices/thème). Rendu par React (pas via le splash natif) car sur
 * Android 12+ le splash natif ne peut afficher qu'une icône centrée — d'où
 * l'effet « petite vignette au centre ». Ici `resizeMode="cover"` + flex:1
 * garantissent un vrai fond plein écran. Aucune animation.
 */
export default function BootScreen({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  return (
    <View style={styles.root} onLayout={onLayout}>
      <ImageBackground source={COUVERTURE} resizeMode="cover" style={styles.bg} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2B7888' },
  bg: { flex: 1, width: '100%', height: '100%' },
});
