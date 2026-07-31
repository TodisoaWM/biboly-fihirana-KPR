/**
 * Seed des recueils FFPM / Fanampiny / Antema dans PostgreSQL via Prisma.
 * Source: github.com/Rohan29-AN/Fihirana-FFPM (JSON)
 *
 * Usage:
 *   1. Placer fihirana_ffpm_complet.json dans prisma/data/
 *   2. npx ts-node prisma/seed-fihirana-protestant.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VerseEntry {
  andininy: number;
  tononkira: string;
  fiverenany: boolean;
}

interface ChantEntry {
  recueil: string;
  numero: string; // string dans la source ("1", "2"...)
  titre: string | null;
  auteurs: string[];
  versets: VerseEntry[];
}

async function main() {
  const dataPath = path.join(__dirname, 'data', 'fihirana_ffpm_complet.json');
  const chants: ChantEntry[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Chargement de ${chants.length} chants FFPM/Fanampiny/Antema...`);

  let inserted = 0;
  for (const chant of chants) {
    const numero = parseInt(chant.numero, 10);
    if (Number.isNaN(numero)) {
      console.warn(`  Ignoré (numéro invalide): ${chant.recueil} "${chant.titre}"`);
      continue;
    }

    const created = await prisma.fihiranaProtestant.upsert({
      where: { recueil_numero: { recueil: chant.recueil, numero } },
      update: {},
      create: {
        recueil: chant.recueil,
        numero,
        titre: chant.titre || null,
        auteurs: chant.auteurs || [],
        versets: {
          create: chant.versets.map((v) => ({
            andininy: v.andininy,
            tononkira: v.tononkira,
            fiverenany: v.fiverenany,
          })),
        },
      },
    });
    inserted++;
    if (inserted % 100 === 0) console.log(`  ${inserted}/${chants.length}...`);
  }

  console.log(`Terminé. ${inserted} chants insérés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
