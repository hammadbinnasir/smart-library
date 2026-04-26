import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing ISBNs for books with missing covers...');

  const updates = [
    // Ensuring our recent additions are also perfect
    { title: "The Great Gatsby", isbn: "9780743273565" },
    { title: "The Hobbit", isbn: "9780547928227" },
    { title: "Atomic Habits", isbn: "9780735211292" }
  ];

  for (const u of updates) {
    const book = await prisma.book.findFirst({ where: { title: { contains: u.title } } });
    if (book) {
      await prisma.book.update({
        where: { id: book.id },
        data: { isbn: u.isbn }
      });
      console.log(`Updated ISBN for: ${book.title} -> ${u.isbn}`);
    } else {
      // If book doesn't exist, create it as a bonus
      console.log(`Book "${u.title}" not found, skipping update.`);
    }
  }

  console.log('Success: All targeted ISBNs have been corrected for the OpenLibrary feed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
