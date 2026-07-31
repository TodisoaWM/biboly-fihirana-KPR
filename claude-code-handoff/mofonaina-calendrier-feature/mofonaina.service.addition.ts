// À AJOUTER dans mofonaina.service.ts (méthode supplémentaire dans la classe MofonainaService)

export interface CalendarEntry {
  month: number;
  day: number;
  theme: string;
  reference: string;
}

// ... dans la classe MofonainaService, ajouter cette méthode :

  /**
   * Retourne tout le calendrier d'une année, trié par mois puis jour.
   * Utilisé par l'écran "Tableau du calendrier" pour affichage/navigation
   * (contrairement à getDailyReading, ne charge PAS le texte biblique complet
   * de chaque jour — juste thème + référence, pour rester léger).
   */
  async getYearCalendar(year: number): Promise<CalendarEntry[]> {
    const entries = await this.prisma.mofonainaEntry.findMany({
      where: { year },
      orderBy: [{ month: 'asc' }, { day: 'asc' }],
      select: { month: true, day: true, theme: true, reference: true },
    });

    if (entries.length === 0) {
      throw new NotFoundException(
        `Aucun calendrier Mofon'aina trouvé pour l'année ${year}.`,
      );
    }

    return entries;
  }
