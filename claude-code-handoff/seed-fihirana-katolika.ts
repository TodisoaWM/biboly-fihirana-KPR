/**
 * Seed du recueil Fihirana Katolika (Dera, Hasina, Vavaka sy Hira, + 4 bonus)
 * dans PostgreSQL via Prisma.
 * Source: github.com/heriniaina/fihirana-katolika (GPL 2.0), extrait et
 * fusionné (base SQLite + fichiers HTML) en un JSON unique.
 *
 * Usage:
 *   1. Placer fihirana_katolika.json dans prisma/data/
 *   2. npx ts-node prisma/seed-fihirana-katolika.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RecueilRef {
  recueil: string;
  page: number;
}

interface ChantEntry {
  id: number;
  title: string;
  recueils?: RecueilRef[];
  salamo?: number;
  lyrics: string | null;
}

const CHUNK_SIZE = 200;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main() {
  const dataPath = path.join(__dirname, 'data', 'fihirana_katolika.json');
  const chants: ChantEntry[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Chargement de ${chants.length} chants Fihirana Katolika...`);

  const batches = chunk(chants, CHUNK_SIZE);
  let done = 0;
  for (const batch of batches) {
    for (const chant of batch) {
      if (!chant.lyrics) continue; // ne devrait pas arriver (0 manquant lors de l'extraction)

      await prisma.fihiranaKatolika.upsert({
        where: { id: chant.id },
        update: {},
        create: {
          id: chant.id,
          titre: chant.title,
          paroles: chant.lyrics,
          salamo: chant.salamo ?? null,
          recueils: {
            create: (chant.recueils || []).map((r) => ({
              recueil: r.recueil,
              page: r.page,
            })),
          },
        },
      });
      done++;
    }
    console.log(`  ${done}/${chants.length}...`);
  }

  console.log(`Terminé. ${done} chants insérés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
