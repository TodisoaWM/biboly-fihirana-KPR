import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  edges?: readonly Edge[];
  style?: ViewStyle;
};

export function Screen({ children, edges = ['top'], style }: Props) {
  const { theme, scheme } = useTheme();
  return (
    <View style={styles.root}>
      {/* Fond dégradé qui suit l'ambiance (bg → bg2) */}
      <LinearGradient
        colors={[theme.bg, theme.bg2]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
});
