import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding reservations for BORROWED books (Strict Objective alignment)...');

  const librarian = await prisma.user.findUnique({ where: { email: "iman@library.pro" } });
  const student = await prisma.user.findUnique({ where: { email: "hammad@student.pk" } });
  
  // Find a book to make 'out of stock'
  const book = await prisma.book.findFirst({ where: { title: "To Kill a Mockingbird" } });

  if (librarian && student && book) {
    // 1. Force the book to be borrowed (0 available)
    await prisma.book.update({
      where: { id: book.id },
      data: { availableCopies: 0, totalCopies: 1 }
    });

    // 2. Create a transaction for the book (Borrowed by student)
    await prisma.transaction.upsert({
      where: { id: "seed-tx-1" },
      update: {},
      create: {
        id: "seed-tx-1",
        bookId: book.id,
        userId: student.id,
        borrowDate: new Date(),
        dueDate: addDays(new Date(), 14),
        status: "BORROWED"
      }
    });

    // 3. Create a reservation for the librarian (Queue position 1)
    await prisma.reservation.deleteMany({ where: { bookId: book.id } }); // Clear existing
    await prisma.reservation.create({
      data: {
        bookId: book.id,
        userId: librarian.id,
        queuePosition: 1,
        status: "PENDING",
      }
    });
    console.log(`Successfully created a reservation for Librarian on the borrowed book: ${book.title}`);
  } else {
    console.error('Could not find necessary records for seeding.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
