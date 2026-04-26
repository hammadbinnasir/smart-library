import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating catalog: Removing Harry Potter and adding fresh titles...');

  // 1. Remove the specific book (and its transactions/reservations to avoid FK errors)
  const hpBook = await prisma.book.findFirst({
    where: { title: "Harry Potter and the Chamber of Secrets" }
  });

  if (hpBook) {
    await prisma.transaction.deleteMany({ where: { bookId: hpBook.id } });
    await prisma.reservation.deleteMany({ where: { bookId: hpBook.id } });
    await prisma.book.delete({ where: { id: hpBook.id } });
    console.log('Removed: Harry Potter and the Chamber of Secrets');
  }

  // 2. Add high-quality fresh titles
  const newBooks = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      category: "Classic Literature",
      totalCopies: 5,
      availableCopies: 5,
      borrowedCount: 12,
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "9780547928227",
      category: "Fantasy",
      totalCopies: 3,
      availableCopies: 3,
      borrowedCount: 45,
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9780735211292",
      category: "Self-Help",
      totalCopies: 10,
      availableCopies: 10,
      borrowedCount: 154,
    },
    {
      title: "The Alchemist",
      author: "Paulo Coelho",
      isbn: "9780062315007",
      category: "Fiction",
      totalCopies: 4,
      availableCopies: 4,
      borrowedCount: 89,
    },
    {
       title: "Deep Work",
       author: "Cal Newport",
       isbn: "9781455586691",
       category: "Productivity",
       totalCopies: 6,
       availableCopies: 6,
       borrowedCount: 32,
    }
  ];

  for (const b of newBooks) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: b
    });
  }

  console.log('Success: Added 5 new premium titles to the catalog.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
