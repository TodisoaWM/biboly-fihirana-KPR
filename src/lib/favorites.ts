import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/** « Tiana » — favoris (lectures bibliques + chants). Persisté, avec abonnement. */

export type BibleFav = { type: 'bible'; ref: string; label: string; ts: number };
export type HymnFav = {
  type: 'hymn';
  id: string;
  collectionKey: string;
  page: number;
  title: string;
  tradition: 'protestanta' | 'katolika';
  ts: number;
};
export type Fav = BibleFav | HymnFav;
/** Entrée à ajouter (sans horodatage) — union distributive. */
export type FavInput = Omit<BibleFav, 'ts'> | Omit<HymnFav, 'ts'>;

const STORAGE_KEY = 'mofonaina.favorites.v1';

let items: Fav[] = [];
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());
const persist = () => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});

(function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (raw) {
        try {
          items = JSON.parse(raw);
          emit();
        } catch {
          // ignore
        }
      }
    })
    .catch(() => {});
})();

export function keyOf(f: Fav | FavInput): string {
  return f.type === 'bible' ? `b:${f.ref}` : `h:${f.id}:${f.collectionKey}`;
}

export function isFavorite(key: string): boolean {
  return items.some((f) => keyOf(f) === key);
}

/** Ajoute/retire un favori. Renvoie true si désormais favori. */
export function toggleFavorite(entry: FavInput): boolean {
  const k = keyOf(entry);
  if (items.some((f) => keyOf(f) === k)) {
    items = items.filter((f) => keyOf(f) !== k);
    persist();
    emit();
    return false;
  }
  items = [{ ...entry, ts: Date.now() } as Fav, ...items];
  persist();
  emit();
  return true;
}

export function removeFavorite(key: string) {
  items = items.filter((f) => keyOf(f) !== key);
  persist();
  emit();
}

export function clearFavorites(section?: 'bible' | 'protestanta' | 'katolika') {
  if (!section) items = [];
  else if (section === 'bible') items = items.filter((f) => f.type !== 'bible');
  else items = items.filter((f) => !(f.type === 'hymn' && f.tradition === section));
  persist();
  emit();
}

export function getFavorites(): Fav[] {
  return items;
}

export function useFavorites(): Fav[] {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return items;
}
