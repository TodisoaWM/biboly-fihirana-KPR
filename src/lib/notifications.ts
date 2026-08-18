import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { getMofonainaByISO, toISO } from '@/data/mofonaina';
import { ensureDailyTitleId, titleText, type Lang } from '@/lib/dailyTitle';

const SCHEDULED_KEY = 'mofonaina.notif.scheduledFor.v1';
const CHANNEL_ID = 'daily';

// Affiche la notif même app au premier plan (natif uniquement).
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Mofon'aina",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }
}

/** Demande (ou vérifie) la permission de notification. */
export async function requestNotifPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Prochain 6h00 : aujourd'hui si l'on est avant 6h, sinon demain. */
function nextSixAM(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(6, 0, 0, 0);
  if (d.getTime() <= from.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

/** Corps figé validé : « Mofon'aina — {theme}. {reference}. Ny mofon'aina anjaranao androany. » */
function buildBody(theme: string, reference: string): string {
  return `Mofon'aina — ${theme}. ${reference}. Ny mofon'aina anjaranao androany.`;
}

/**
 * Reprogramme, si nécessaire, LA notification quotidienne unique au prochain
 * 6h00, avec le thème/référence + le titre tiré pour ce jour-là. `repeats:false`
 * (le contenu d'un trigger répété serait figé) → on la re-planifie à chaque
 * ouverture de l'app. Silencieux, sans action utilisateur.
 */
export async function ensureDailyNotificationScheduled(lang: Lang): Promise<void> {
  if (Platform.OS === 'web') return;
  const granted = await requestNotifPermission();
  if (!granted) return;
  await ensureChannel();

  const fire = nextSixAM();
  const fireISO = toISO(fire);
  const already = await AsyncStorage.getItem(SCHEDULED_KEY);
  if (already === fireISO) return; // déjà programmée pour ce jour → rien à faire

  await Notifications.cancelAllScheduledNotificationsAsync();
  const titleId = await ensureDailyTitleId(fireISO);
  const entry = getMofonainaByISO(fireISO);
  await Notifications.scheduleNotificationAsync({
    content: { title: titleText(titleId, lang), body: buildBody(entry.theme, entry.reference), sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fire, channelId: CHANNEL_ID },
  });
  await AsyncStorage.setItem(SCHEDULED_KEY, fireISO);
}

/**
 * Test immédiat (geste caché) : notif à ~2s avec le VRAI contenu d'aujourd'hui
 * (même titre que le hero d'accueil). N'annule PAS la notif programmée.
 */
export async function sendTestNotification(lang: Lang): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const granted = await requestNotifPermission();
  if (!granted) return false;
  await ensureChannel();

  const todayISO = toISO(new Date());
  const titleId = await ensureDailyTitleId(todayISO);
  const entry = getMofonainaByISO(todayISO);
  await Notifications.scheduleNotificationAsync({
    content: { title: titleText(titleId, lang), body: buildBody(entry.theme, entry.reference), sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, channelId: CHANNEL_ID },
  });
  return true;
}
