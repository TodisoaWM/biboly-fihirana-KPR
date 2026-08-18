/**
 * Seed du recueil Fihirana Fifohazana (370 chants) dans PostgreSQL via Prisma.
 *
 * Source : fichier "song_song_fifohazana.bin" extrait de l'app "Baiboly &
 * Fihirana Protestanta" (mg.itworks.bf), chiffré par XOR répétitif 20 octets
 * — cassé par analyse d'indice de coïncidence, décodé en YAML, puis converti
 * en JSON. Réutilise le même modèle Prisma que FFPM/Fanampiny/Antema
 * (FihiranaProtestant), avec les champs optionnels commentaire/chapitre en plus.
 *
 * Usage :
 *   1. Placer fihirana_fifohazana.json dans prisma/data/
 *   2. npx ts-node prisma/seed-fihirana-fifohazana.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VerseEntry {
  andininy: number;
  tononkira: string;
  fiverenana: boolean;
}

interface ChantEntry {
  recueil: string;
  numero: number;
  titre: string | null;
  auteur: string | null;
  commentaire: string | null;
  chapitre: string | null;
  texte_brut: string;
  versets: VerseEntry[];
}

async function main() {
  const dataPath = path.join(__dirname, 'data', 'fihirana_fifohazana.json');
  const chants: ChantEntry[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  console.log(`Chargement de ${chants.length} chants Fifohazana...`);

  let inserted = 0;
  for (const chant of chants) {
    await prisma.fihiranaProtestant.upsert({
      where: { recueil_numero: { recueil: chant.recueil, numero: chant.numero } },
      update: {},
      create: {
        recueil: chant.recueil,
        numero: chant.numero,
        titre: chant.titre,
        auteurs: chant.auteur ? [chant.auteur] : [],
        commentaire: chant.commentaire,
        chapitre: chant.chapitre,
        versets: {
          create: chant.versets.map((v) => ({
            andininy: v.andininy,
            tononkira: v.tononkira,
            fiverenany: v.fiverenana,
          })),
        },
      },
    });
    inserted++;
    if (inserted % 50 === 0) console.log(`  ${inserted}/${chants.length}...`);
  }

  console.log(`Terminé. ${inserted} chants Fifohazana insérés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
