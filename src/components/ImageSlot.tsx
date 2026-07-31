import { Image, ImageContentFit } from 'expo-image';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export type ImageSource = number | string | { uri: string } | null | undefined;

type Props = {
  /** Image à afficher. Si absente, on rend `children` (placeholder décoratif). */
  source?: ImageSource;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  /** Placeholder décoratif affiché tant qu'aucune image n'est fournie. */
  children?: React.ReactNode;
  /** Aperçu flou (LQIP, data URI) affiché pendant le chargement de l'image. */
  blur?: string;
  accessibilityLabel?: string;
};

/**
 * Emplacement image (équivalent des `<image-slot>` de la maquette).
 * Remplir `source` (require('...') ou { uri }) pour afficher une vraie image ;
 * sinon le placeholder décoratif s'affiche.
 */
export function ImageSlot({ source, style, contentFit = 'cover', children, blur, accessibilityLabel }: Props) {
  const resolved = typeof source === 'string' ? { uri: source } : source;
  return (
    <View style={[styles.wrap, style]}>
      {resolved ? (
        <Image
          source={resolved}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          placeholder={blur ? { uri: blur } : undefined}
          placeholderContentFit="cover"
          accessibilityLabel={accessibilityLabel}
          transition={300}
        />
      ) : (
        <View style={styles.placeholder}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
