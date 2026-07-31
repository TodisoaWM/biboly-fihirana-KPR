import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type Lang = 'mg' | 'fr' | 'en';

export type Profile = {
  name: string;
  email: string;
  photoUri: string | null;
  language: Lang;
};

const STORAGE_KEY = 'mofonaina.profile.v1';

const DEFAULT: Profile = { name: '', email: '', photoUri: null, language: 'mg' };

let profile: Profile = { ...DEFAULT };
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

(function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(STORAGE_KEY)
    .then((raw) => {
      if (raw) {
        try {
          profile = { ...DEFAULT, ...JSON.parse(raw) };
          emit();
        } catch {
          // ignore
        }
      }
    })
    .catch(() => {});
})();

export function getProfile(): Profile {
  return profile;
}

export function setProfile(patch: Partial<Profile>) {
  profile = { ...profile, ...patch };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch(() => {});
  emit();
}

/** Vrai si l'utilisateur a personnalisé son nom. */
export function hasName(): boolean {
  return profile.name.trim().length > 0;
}

export function useProfile(): Profile {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return profile;
}
