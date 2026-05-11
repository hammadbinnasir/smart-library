
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Update some books to have 0 available copies
  const booksToUpdate = [
    'Superintelligence',
    'The Selfish Gene',
    'Guns, Germs, and Steel',
    'The Gene: An Intimate History'
  ];

  for (const title of booksToUpdate) {
    const book = await prisma.book.findFirst({ where: { title: { contains: title } } });
    if (book) {
      await prisma.book.update({
        where: { id: book.id },
        data: { availableCopies: 0 }
      });
      console.log(`Updated "${book.title}" to 0 available copies.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
