import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { toISO } from '@/data/mofonaina';
import { useProfile } from '@/lib/profile';

export type NotifTitle = { id: number; category: string; mg: string; fr: string; en: string };
export type Lang = 'mg' | 'fr' | 'en';

// Fichier de démarrage — À REMPLACER par la liste validée de 108 titres
// (même schéma). La logique « paquet sans remise » marche quel que soit le nombre.
const TITLES = require('../../assets/data/notification_titles.json') as NotifTitle[];

const KEY = 'mofonaina.dailyTitle.v1';

type State = {
  /** ids pas encore montrés dans le cycle en cours */
  remainingPool: number[];
  /** dernier id utilisé (tous cycles confondus) — évite la répétition à la jointure */
  lastUsedId: number | null;
  /** titre déjà tiré pour une date donnée (ISO) → un seul tirage/jour, lecture partagée */
  titlesByDate: Record<string, number>;
};

const EMPTY: State = { remainingPool: [], lastUsedId: null, titlesByDate: {} };

async function loadState(): Promise<State> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const s = JSON.parse(raw) as Partial<State>;
    return {
      remainingPool: Array.isArray(s.remainingPool) ? s.remainingPool : [],
      lastUsedId: typeof s.lastUsedId === 'number' ? s.lastUsedId : null,
      titlesByDate: s.titlesByDate && typeof s.titlesByDate === 'object' ? s.titlesByDate : {},
    };
  } catch {
    return { ...EMPTY };
  }
}

async function saveState(s: State): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/** Ne garde que les dates récentes (hier/aujourd'hui/demain) pour éviter la croissance infinie. */
function pruneDates(map: Record<string, number>, keepAround: string): Record<string, number> {
  const d = new Date(keepAround);
  const keep = new Set<string>();
  for (let i = -1; i <= 1; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    keep.add(toISO(x));
  }
  const out: Record<string, number> = {};
  for (const k of Object.keys(map)) if (keep.has(k)) out[k] = map[k];
  return out;
}

/**
 * Tirage « paquet sans remise » : retire un id du paquet ; recharge quand vide ;
 * ne redonne jamais deux jours de suite le même titre (jointure entre cycles).
 * Fonction pure — l'état renvoyé est à persister.
 */
export function drawDailyTitle(state: State, allIds: number[], iso: string): { pickedId: number; newState: State } {
  let remainingPool = state.remainingPool && state.remainingPool.length > 0 ? state.remainingPool : allIds.slice();

  // Éviter la répétition à la jointure entre deux cycles.
  let pool = remainingPool.filter((id) => id !== state.lastUsedId);
  if (pool.length === 0) pool = remainingPool; // cas extrême (un seul titre)

  const pickedId = pool[Math.floor(Math.random() * pool.length)];
  const newRemaining = remainingPool.filter((id) => id !== pickedId);

  return {
    pickedId,
    newState: {
      remainingPool: newRemaining,
      lastUsedId: pickedId,
      titlesByDate: { ...pruneDates(state.titlesByDate, iso), [iso]: pickedId },
    },
  };
}

/**
 * Id du titre pour une DATE donnée (défaut : aujourd'hui). Tire une seule fois
 * par jour puis persiste, si bien que l'accueil et la notification lisent la
 * même valeur.
 */
export async function ensureDailyTitleId(iso: string = toISO(new Date())): Promise<number> {
  const state = await loadState();
  const existing = state.titlesByDate[iso];
  if (existing != null && TITLES.some((t) => t.id === existing)) return existing;
  const { pickedId, newState } = drawDailyTitle(state, TITLES.map((t) => t.id), iso);
  await saveState(newState);
  return pickedId;
}

export function titleText(id: number, lang: Lang): string {
  const t = TITLES.find((x) => x.id === id) ?? TITLES[0];
  return (t?.[lang] || t?.mg || '') as string;
}

/** Hook pour le hero d'accueil : le titre du jour dans la langue courante. */
export function useDailyTitle(): string {
  const profile = useProfile();
  const lang = ((profile.language as Lang) || 'mg') as Lang;
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    ensureDailyTitleId().then((v) => alive && setId(v));
    return () => {
      alive = false;
    };
  }, []);
  return titleText(id ?? TITLES[0]?.id ?? 1, lang);
}
