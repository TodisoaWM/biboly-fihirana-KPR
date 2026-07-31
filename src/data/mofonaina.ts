/**
 * Mofon'aina — lecture biblique quotidienne.
 *
 * Calendrier réel : 184 jours (Jolay→Desambra 2026), généré par
 * `npm run mofonaina:build` depuis claude-code-handoff/mofonaina_2026.csv →
 * src/data/mofonaina.data.json. Chaque entrée = { date, theme, reference } ;
 * la référence est résolue en versets réels via `getReading` (Baiboly MG'65).
 * Jour de la semaine et libellé de date sont calculés (pas stockés).
 */

export type MofonainaEntry = {
  date: string; // YYYY-MM-DD
  theme: string;
  reference: string; // ex. « 1 Tes 5.14,15 »
};

export const CALENDAR: MofonainaEntry[] = require('./mofonaina.data.json') as MofonainaEntry[];

const WEEKDAYS = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'];
const MONTHS = [
  'Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona',
  'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra',
];

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse « YYYY-MM-DD » en date locale (évite les décalages de fuseau). */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function weekdayMg(iso: string): string {
  return WEEKDAYS[fromISO(iso).getDay()];
}

export function dayLabelMg(iso: string): string {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Entrée pour une date : correspondance exacte, sinon la plus proche dans le passé. */
export function getMofonainaForDate(d: Date = new Date()): MofonainaEntry {
  const iso = toISO(d);
  const exact = CALENDAR.find((e) => e.date === iso);
  if (exact) return exact;
  const past = CALENDAR.filter((e) => e.date <= iso).sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ?? CALENDAR[0];
}

export type MonthGroup = { key: string; label: string; entries: MofonainaEntry[] };

/** Calendrier groupé par mois (dans l'ordre chronologique). */
export function getCalendarByMonth(): MonthGroup[] {
  const groups: MonthGroup[] = [];
  const byKey: Record<string, MonthGroup> = {};
  for (const e of CALENDAR) {
    const key = e.date.slice(0, 7); // YYYY-MM
    if (!byKey[key]) {
      const d = fromISO(e.date);
      byKey[key] = { key, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, entries: [] };
      groups.push(byKey[key]);
    }
    byKey[key].entries.push(e);
  }
  return groups;
}

export function getMofonainaByISO(iso?: string): MofonainaEntry {
  if (iso) {
    const e = CALENDAR.find((x) => x.date === iso);
    if (e) return e;
  }
  return getMofonainaForDate();
}

export const USER = {
  firstName: 'Naina',
  fullName: 'Naina Rakoto',
  email: 'naina.rakoto@gmail.com',
};
