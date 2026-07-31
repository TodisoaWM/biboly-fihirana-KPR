// À AJOUTER dans mofonaina.controller.ts (méthode supplémentaire dans la classe MofonainaController)

  /**
   * GET /mofonaina/calendar?year=2026
   * Retourne tout le calendrier de l'année pour l'écran "Tableau du calendrier".
   */
  @Get('calendar')
  async calendar(@Query('year') year?: string) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    if (Number.isNaN(y)) {
      throw new BadRequestException('Paramètre "year" invalide.');
    }
    return this.mofonainaService.getYearCalendar(y);
  }
