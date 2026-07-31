import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Lora_400Regular } from '@expo-google-fonts/lora/400Regular';
import { Lora_400Regular_Italic } from '@expo-google-fonts/lora/400Regular_Italic';
import { Lora_500Medium } from '@expo-google-fonts/lora/500Medium';
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans/600SemiBold';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';
import { NunitoSans_800ExtraBold } from '@expo-google-fonts/nunito-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

function StackNav() {
  const { theme } = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="mofonaina" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="reading" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="books" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="chapters" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="picker" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="passage" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="recents" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hymn" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hymns" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="hymnpicker" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="search" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="language" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="about-mofonaina" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

/** Cadre « téléphone » sur le web pour une présentation fidèle à la maquette. */
function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.webOuter}>
      <View style={styles.webInner}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_500Medium,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <WebFrame>
          <StackNav />
        </WebFrame>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: '#EAE9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webInner: {
    width: '100%',
    maxWidth: 440,
    flex: 1,
    boxShadow: '0 24px 70px -20px rgba(70,55,40,0.35)',
    overflow: 'hidden',
  },
});
