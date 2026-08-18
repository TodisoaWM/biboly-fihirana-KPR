import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { EduVICWANTHand_500Medium } from '@expo-google-fonts/edu-vic-wa-nt-hand/500Medium';
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
import { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BootScreen from '@/components/BootScreen';
import { type Lang } from '@/lib/dailyTitle';
import { ensureDailyNotificationScheduled } from '@/lib/notifications';
import { useProfile } from '@/lib/profile';
import { ToastProvider } from '@/lib/toast';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

/** Reprogramme la notif quotidienne (6h) à chaque ouverture de l'app. */
function NotifScheduler() {
  const profile = useProfile();
  const lang = ((profile.language as Lang) || 'mg') as Lang;
  useEffect(() => {
    ensureDailyNotificationScheduled(lang).catch(() => {});
  }, [lang]);
  return null;
}

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
      <Stack.Screen name="vavaka-read" options={{ animation: 'slide_from_right' }} />
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
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    EduVICWANTHand_500Medium,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_500Medium,
  });

  // Masque le splash natif dès que le boot screen React a peint sa 1re frame,
  // pour afficher la couverture EN PLEIN ÉCRAN (le splash natif Android 12+ ne
  // sait afficher qu'une icône centrée).
  const onBootLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Pendant le chargement (polices/thème) : couverture.png plein écran.
  if (!loaded) {
    return (
      <WebFrame>
        <BootScreen onLayout={onBootLayout} />
      </WebFrame>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <WebFrame>
          <ToastProvider>
            <NotifScheduler />
            <StackNav />
          </ToastProvider>
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
