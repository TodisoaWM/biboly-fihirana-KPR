import { Lang, useProfile } from './profile';

/**
 * i18n léger. Le CONTENU (versets, paroles, noms de livres) reste en malgache ;
 * les étiquettes d'interface sont traduites (mg/fr/en), ainsi que les dates.
 */
type Entry = { mg: string; fr: string; en: string };

const T: Record<string, Entry> = {
  // Onglets
  tab_today: { mg: 'Androany', fr: 'Aujourd’hui', en: 'Today' },
  tab_bible: { mg: 'Baiboly', fr: 'Bible', en: 'Bible' },
  tab_hymnal: { mg: 'Fihirana', fr: 'Chants', en: 'Hymns' },
  tab_favorites: { mg: 'Tiana', fr: 'Favoris', en: 'Favorites' },
  tab_prayer: { mg: 'Vavaka', fr: 'Prière', en: 'Prayer' },
  prayer_subtitle: { mg: 'Vavaka sy fangatahana', fr: 'Prières et intentions', en: 'Prayers & intentions' },
  prayer_soon_title: { mg: 'Ho avy tsy ho ela', fr: 'Bientôt disponible', en: 'Coming soon' },
  prayer_soon_body: {
    mg: 'Hampidirina eto tsy ho ela ny vavaka isan-karazany.',
    fr: 'Les prières seront ajoutées ici prochainement.',
    en: 'Prayers will be added here soon.',
  },
  prayer_refs: { mg: "Ao amin'ny Soratra Masina", fr: 'Références bibliques', en: 'Scripture references' },
  close: { mg: 'Akatona', fr: 'Fermer', en: 'Close' },
  rights_reserved: {
    mg: 'Tsy azo amidy fa zaraina maimaimpoana.',
    fr: 'Ne peut être vendu — partagé gratuitement.',
    en: 'Not for sale — shared free of charge.',
  },
  contact_title: { mg: 'Fifandraisana', fr: 'Contact', en: 'Contact' },
  contact_intro: {
    mg: "Raha te hifandray aminay, na hitatitra olana, na hanome soso-kevitra fanatsarana momba ny application dia :",
    fr: 'Pour nous contacter, signaler un problème ou proposer une amélioration :',
    en: 'To contact us, report a problem or suggest an improvement:',
  },

  // Accueil
  hello: { mg: 'Miarahaba', fr: 'Bonjour', en: 'Hello' },
  today_label: { mg: "MOFON'AINA ANDROANY", fr: 'MÉDITATION DU JOUR', en: 'TODAY’S READING' },
  birthday_badge: { mg: 'TSINGERINTAONA', fr: 'ANNIVERSAIRE', en: 'BIRTHDAY' },
  read_today: { mg: 'Vakio androany', fr: 'Lire aujourd’hui', en: 'Read today' },
  read_full_chapter: { mg: 'Vakio ny toko manontolo', fr: 'Lire tout le chapitre', en: 'Read the whole chapter' },

  // Testaments / lecture
  ot: { mg: 'Testamenta Taloha', fr: 'Ancien Testament', en: 'Old Testament' },
  nt: { mg: 'Testamenta Vaovao', fr: 'Nouveau Testament', en: 'New Testament' },
  chapter_word: { mg: 'TOKO', fr: 'CHAPITRE', en: 'CHAPTER' },
  chapters_lc: { mg: 'toko', fr: 'chapitres', en: 'chapters' },
  chapters_uc: { mg: 'TOKO', fr: 'CHAPITRES', en: 'CHAPTERS' },
  verses: { mg: 'Andininy', fr: 'Versets', en: 'Verses' },
  whole_chapter: { mg: 'Ny toko manontolo', fr: 'Tout le chapitre', en: 'Whole chapter' },
  ref_unreadable: { mg: 'Tsy voavaky ny referansa', fr: 'Référence illisible', en: 'Unreadable reference' },

  // Baiboly (onglet)
  choose_reading: { mg: 'Fidio izay hovakiana', fr: 'Choisissez votre lecture', en: 'Choose your reading' },
  choose_topic: { mg: 'Safidio ny lohahevitrao', fr: 'Choisissez votre sujet', en: 'Choose your topic' },
  bible_subtitle: { mg: 'Ny Soratra Masina · 66 boky', fr: 'Les Saintes Écritures · 66 livres', en: 'Holy Scripture · 66 books' },
  hymnal_subtitle: { mg: 'FFPM sy ny Fanampiny', fr: 'FFPM et Fanampiny', en: 'FFPM & Fanampiny' },
  chapter_verse: { mg: 'Toko sy andininy', fr: 'Chapitre et verset', en: 'Chapter & verse' },
  recent_readings: { mg: 'Novakiana farany', fr: 'Lectures récentes', en: 'Recent readings' },

  // Fihirana
  hymns_subtitle: { mg: 'Hira sy antsam-panahy', fr: 'Chants et cantiques', en: 'Songs & hymns' },
  search_hymn_ph: { mg: 'Hitady laharana na lohateny…', fr: 'Numéro ou titre…', en: 'Number or title…' },
  recently_opened: { mg: 'NOSOKAFANA FARANY', fr: 'OUVERT RÉCEMMENT', en: 'RECENTLY OPENED' },
  song_suggestion: { mg: 'HIRA ATOLOTRA', fr: 'PROPOSITION DE CHANT', en: 'SONG SUGGESTION' },
  see_all: { mg: 'Hijery rehetra', fr: 'Tout voir', en: 'See all' },
  protestant: { mg: 'PROTESTANTA', fr: 'PROTESTANT', en: 'PROTESTANT' },
  catholic: { mg: 'KATOLIKA', fr: 'CATHOLIQUE', en: 'CATHOLIC' },
  songs_lc: { mg: 'hira', fr: 'chants', en: 'songs' },
  songs_uc: { mg: 'HIRA', fr: 'CHANTS', en: 'SONGS' },
  refrain: { mg: 'FIVERENANY', fr: 'REFRAIN', en: 'REFRAIN' },
  also_in: { mg: 'Hita ihany koa ao', fr: 'Aussi dans', en: 'Also in' },
  page: { mg: 'Pejy', fr: 'Page', en: 'Page' },
  number: { mg: 'Laharana', fr: 'Numéro', en: 'Number' },
  hymn_not_found: { mg: 'Tsy hita ny hira.', fr: 'Chant introuvable.', en: 'Song not found.' },

  // Recherche
  search_ph: { mg: 'Toko, andininy, teny, hira…', fr: 'Chapitre, verset, mot, chant…', en: 'Chapter, verse, word, song…' },
  go_to: { mg: "MANKANESA AMIN'NY", fr: 'ALLER À', en: 'GO TO' },
  read_chapter: { mg: 'Vakio ny toko', fr: 'Lire le chapitre', en: 'Read the chapter' },
  books_uc: { mg: 'BOKY', fr: 'LIVRES', en: 'BOOKS' },
  verses_uc: { mg: 'ANDININY', fr: 'VERSETS', en: 'VERSES' },
  no_results: { mg: 'Tsy nahitana valiny.', fr: 'Aucun résultat.', en: 'No results.' },
  search_hint: { mg: 'Ohatra : « Sal 23 », « Jao 3.16 », « fitiavana », « FFPM 3 »', fr: 'Ex. : « Sal 23 », « Jao 3.16 », « fitiavana », « FFPM 3 »', en: 'e.g. “Sal 23”, “Jao 3.16”, “fitiavana”, “FFPM 3”' },

  // Sélecteurs
  choose_book: { mg: 'Fidio boky', fr: 'Choisir le livre', en: 'Choose the book' },
  search_book_ph: { mg: 'Hitady boky…', fr: 'Chercher un livre…', en: 'Search a book…' },
  hint_chapter: { mg: 'Soraty ny toko, dia tsindrio →', fr: 'Entrez le chapitre, puis →', en: 'Enter the chapter, then →' },
  hint_v1: { mg: 'Andininy voalohany, dia tsindrio →', fr: 'Premier verset, puis →', en: 'First verse, then →' },
  hint_v2: { mg: 'Andininy farany', fr: 'Dernier verset', en: 'Last verse' },
  pick_chapter_label: { mg: 'Toko faha-', fr: 'Chapitre n°', en: 'Chapter no.' },
  pick_verse_label: { mg: 'Andininy faha-', fr: 'Verset n°', en: 'Verse no.' },
  pick_upto_label: { mg: "ka hatramin'ny", fr: "jusqu'au verset", en: 'up to verse' },
  pick_optional_verse: { mg: 'Fidio andininy (na tsindrio Vakio)', fr: 'Choisissez un verset (ou Lire)', en: 'Pick a verse (or Read)' },
  read_btn: { mg: 'Vakio', fr: 'Lire', en: 'Read' },
  err_chapter: { mg: 'Fidio toko.', fr: 'Choisissez un chapitre.', en: 'Pick a chapter.' },
  err_number: { mg: 'Soraty ny laharana.', fr: 'Entrez le numéro.', en: 'Enter the number.' },

  // Tiana / Novakiana farany
  favorites_sub: { mg: 'Ny voatahiry ho hovakiana indray', fr: 'À relire', en: 'To read again' },
  empty_favorites: { mg: 'Mbola tsy misy voatahiry. Tsindrio ny 🔖 mba hitahiry.', fr: 'Aucun favori. Touchez 🔖 pour en ajouter.', en: 'No favorites yet. Tap 🔖 to add one.' },
  empty_recents: { mg: 'Mbola tsy misy novakiana na nohiraina.', fr: 'Aucune lecture récente.', en: 'Nothing read yet.' },
  clear: { mg: 'Fafao', fr: 'Effacer', en: 'Clear' },
  sec_bible_recent: { mg: 'BAIBOLY NOVAKIANA FARANY', fr: 'BIBLE — RÉCENTES', en: 'BIBLE — RECENT' },
  sec_bible_fav: { mg: 'BAIBOLY VOATAHIRY', fr: 'BIBLE — FAVORIS', en: 'BIBLE — FAVORITES' },
  sec_prot: { mg: 'FIHIRANA — PROTESTANTA', fr: 'CHANTS — PROTESTANT', en: 'HYMNS — PROTESTANT' },
  sec_kato: { mg: 'FIHIRANA — KATOLIKA', fr: 'CHANTS — CATHOLIQUE', en: 'HYMNS — CATHOLIC' },

  // Réglages
  settings_title: { mg: 'Kirakira', fr: 'Paramètres', en: 'Settings' },
  appearance: { mg: 'ENDRIKA SY LOKO', fr: 'APPARENCE ET COULEUR', en: 'APPEARANCE & COLOR' },
  app_color: { mg: "Lokon'ny app", fr: 'Couleur de l’app', en: 'App color' },
  light: { mg: 'Mazava', fr: 'Clair', en: 'Light' },
  dark: { mg: 'Maizina', fr: 'Sombre', en: 'Dark' },
  base_color: { mg: 'Loko fototra', fr: 'Couleur d’accent', en: 'Accent color' },
  from_image: { mg: 'Avy amin’ny sary', fr: 'D’après l’image', en: 'From the image' },
  tap_reset: { mg: 'Tsindrio indray hiverina amin’ny lokon’ny sary', fr: 'Toucher à nouveau pour revenir à la couleur de l’image', en: 'Tap again to revert to the image color' },
  font_size: { mg: 'HABE SORATRA', fr: 'TAILLE DU TEXTE', en: 'TEXT SIZE' },
  image_mood: { mg: 'SARY SY ENDRIKA', fr: 'IMAGE ET AMBIANCE', en: 'IMAGE & MOOD' },
  day_mood: { mg: 'Endriky ny andro', fr: 'Ambiance du jour', en: 'Today’s mood' },
  day_mood_sub: { mg: 'Miova ho azy isan’andro — ny loko rehetra avy amin’ny sary', fr: 'Change chaque jour — toutes les couleurs viennent de l’image', en: 'Changes daily — all colors come from the image' },
  reminders: { mg: 'Fampahatsiahivana', fr: 'Rappels', en: 'Reminders' },
  language: { mg: 'Fiteny', fr: 'Langue', en: 'Language' },

  // Profil / langue
  edit_profile: { mg: 'Ovay ny mombamomba', fr: 'Modifier le profil', en: 'Edit profile' },
  name: { mg: 'Anarana', fr: 'Nom', en: 'Name' },
  email: { mg: 'Mailaka', fr: 'E-mail', en: 'Email' },
  change_photo: { mg: 'Ovay ny sary', fr: 'Changer la photo', en: 'Change photo' },
  remove_photo: { mg: 'Esory ny sary', fr: 'Retirer la photo', en: 'Remove photo' },
  save: { mg: 'Tehirizo', fr: 'Enregistrer', en: 'Save' },
  name_placeholder: { mg: 'Soraty ny anaranao', fr: 'Votre nom', en: 'Your name' },
  choose_language: { mg: 'Fidio ny fiteny', fr: 'Choisir la langue', en: 'Choose the language' },

  // Mofon'aina 2026
  about_mofonaina: { mg: "Momba an'i Mofon'aina", fr: 'À propos de Mofon’aina', en: 'About Mofon’aina' },
  about_desc: {
    mg: "Fandaharam-pamakiana Baiboly isan'andro amin'ny teny malagasy (MG 1865). Ny tetiandro 2026 dia misy lohahevitra sy andinin-tsoratra masina ho an'ny andro tsirairay, Jolay ka hatramin'ny Desambra.",
    fr: 'Programme de lecture biblique quotidienne en malgache (MG 1865). Le calendrier 2026 propose un thème et un passage pour chaque jour, de Jolay à Desambra.',
    en: 'Daily Malagasy Bible reading plan (MG 1865). The 2026 calendar gives a theme and a passage for each day, from Jolay to Desambra.',
  },
  calendar_year: { mg: 'TETIANDRO 2026', fr: 'CALENDRIER 2026', en: '2026 CALENDAR' },
  days_uc: { mg: 'ANDRO', fr: 'JOURS', en: 'DAYS' },
};

const LANG_NAME: Record<Lang, string> = { mg: 'Malagasy', fr: 'Français', en: 'English' };

const WEEKDAYS: Record<Lang, string[]> = {
  mg: ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'],
  fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};
// Les mois du calendrier restent en malgache (mois liturgiques de la source).
const MONTHS_MG = ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'];

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function languageName(l: Lang): string {
  return LANG_NAME[l];
}

export function translate(key: string, lang: Lang): string {
  const e = T[key];
  return e ? e[lang] : key;
}

/** Hook : `t`, la langue, et le formatage de dates localisé. */
export function useI18n() {
  const { language } = useProfile();
  return {
    language,
    t: (key: string) => translate(key, language),
    weekday: (iso: string) => WEEKDAYS[language][parseISO(iso).getDay()],
    dayLabel: (iso: string) => {
      const d = parseISO(iso);
      return `${d.getDate()} ${MONTHS_MG[d.getMonth()]}`;
    },
  };
}
