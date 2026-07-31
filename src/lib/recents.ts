import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

/**
 * « Novakiana / Nohiraina farany » — historique des lectures et chants ouverts.
 * Persisté (AsyncStorage), avec abonnement pour rafraîchir les écrans.
 */

export type BibleRecent = { type: 'bible'; ref: string; label: string; ts: number };
export type HymnRecent = {
  type: 'hymn';
  id: string;
  collectionKey: string;
  page: number;
  title: string;
  tradition: 'protestanta' | 'katolika';
  ts: number;
};
export type Recent = BibleRecent | HymnRecent;

const STORAGE_KEY = 'mofonaina.recents.v1';
const MAX = 60;

let items: Recent[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}
function persist() {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
}
function load() {
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
}
load();

export function keyOf(r: Recent): string {
  return r.type === 'bible' ? `b:${r.ref}` : `h:${r.id}:${r.collectionKey}`;
}

function push(entry: Recent) {
  const k = keyOf(entry);
  items = [entry, ...items.filter((r) => keyOf(r) !== k)].slice(0, MAX);
  persist();
  emit();
}

export function addBibleRecent(ref: string, label: string) {
  if (!ref) return;
  push({ type: 'bible', ref, label, ts: Date.now() });
}

export function addHymnRecent(r: Omit<HymnRecent, 'type' | 'ts'>) {
  push({ type: 'hymn', ...r, ts: Date.now() });
}

export function getRecents(): Recent[] {
  return items;
}

export function removeRecent(key: string) {
  items = items.filter((r) => keyOf(r) !== key);
  persist();
  emit();
}

/** Efface tout, ou une section : 'bible' | 'protestanta' | 'katolika'. */
export function clearRecents(section?: 'bible' | 'protestanta' | 'katolika') {
  if (!section) items = [];
  else if (section === 'bible') items = items.filter((r) => r.type !== 'bible');
  else items = items.filter((r) => !(r.type === 'hymn' && r.tradition === section));
  persist();
  emit();
}

export function useRecents(): Recent[] {
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
