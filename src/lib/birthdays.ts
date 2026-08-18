import type { Lang } from '@/lib/dailyTitle';

export type Birthday = { id: number; name: string; day: number; month: number; year: number | null };

const BIRTHDAYS = require('../../assets/data/birthdays.json') as Birthday[];

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** 29 février → fêté le 28 les années non bissextiles. */
function effectiveDateForYear(b: Birthday, year: number): { day: number; month: number } {
  if (b.day === 29 && b.month === 2 && !isLeapYear(year)) return { day: 28, month: 2 };
  return { day: b.day, month: b.month };
}

/** Anniversaires dont la date effective (voir 29 février) tombe le jour donné. */
export function birthdaysOn(date: Date): Birthday[] {
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return BIRTHDAYS.filter((b) => {
    const eff = effectiveDateForYear(b, year);
    return eff.day === day && eff.month === month;
  });
}

function joinNames(names: string[], lang: Lang): string {
  if (names.length <= 1) return names[0] ?? '';
  const and = lang === 'en' ? 'and' : lang === 'fr' ? 'et' : 'sy';
  if (names.length === 2) return `${names[0]} ${and} ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} ${and} ${names[names.length - 1]}`;
}

const REMINDER_TMPL: Record<Lang, (name: string) => string> = {
  mg: (n) => `Fitsingerenan'ny taona nahaterahan'i ${n} rahampitso. Aza adino.`,
  fr: (n) => `C'est l'anniversaire de ${n} demain. N'oublie pas !`,
  en: (n) => `It's ${n}'s birthday tomorrow. Don't forget!`,
};

const TODAY_TMPL: Record<Lang, (name: string) => string> = {
  mg: (n) => `Andao isika hiarahaba, fa tsingerintaona nahaterahan'i ${n} androany.`,
  fr: (n) => `Allons féliciter ${n}, c'est son anniversaire aujourd'hui !`,
  en: (n) => `Let's congratulate ${n}, it's their birthday today!`,
};

const NOTIF_TITLE: Record<Lang, string> = { mg: 'Tsingerintaona', fr: 'Anniversaire', en: 'Birthday' };

export function birthdayNotifTitle(lang: Lang): string {
  return NOTIF_TITLE[lang];
}

/** Message (rappel J-1 ou jour J) pour un ou plusieurs anniversaires du même jour. */
export function birthdayMessage(kind: 'reminder' | 'today', birthdays: Birthday[], lang: Lang): string {
  const name = joinNames(
    birthdays.map((b) => b.name),
    lang,
  );
  return (kind === 'reminder' ? REMINDER_TMPL : TODAY_TMPL)[lang](name);
}
