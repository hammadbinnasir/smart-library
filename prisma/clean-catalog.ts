import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning catalog: Removing books without verified visuals...');

  // 1. Remove specific books requested due to visual/ISBN issues
  const result = await prisma.book.deleteMany({
    where: { 
      OR: [
        { title: { contains: "Thinking in Bets", mode: 'insensitive' } },
        { title: { contains: "The Social Contract", mode: 'insensitive' } },
        { title: { contains: "No Ordinary Time", mode: 'insensitive' } },
        { title: { contains: "The Double Helix", mode: 'insensitive' } },
        { title: { contains: "Beyond Good and Evil", mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Successfully removed ${result.count} books.`);
  console.log('Catalog is now visually clean.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
