import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- FINAL HARDENED CLEANUP ---');

  const transactions = await prisma.transaction.findMany({
    where: { status: { in: ['BORROWED', 'OVERDUE'] } },
    include: { user: true, book: true }
  });

  const dupMap = new Map<string, any[]>();
  for (const t of transactions) {
    const key = `${t.userId}-${t.bookId}`;
    if (!dupMap.has(key)) dupMap.set(key, []);
    dupMap.get(key)?.push(t);
  }

  for (const [key, list] of dupMap.entries()) {
    if (list.length > 1) {
      console.log(`❌ Found ${list.length} copies for ${list[0].user.name} - "${list[0].book.title}"`);
      const sorted = list.sort((a, b) => a.borrowDate.getTime() - b.borrowDate.getTime());
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);
      
      for (const d of toDelete) {
        await prisma.transaction.delete({ where: { id: d.id } });
        console.log(`   Deleted duplicate: ${d.id}`);
      }
    }
  }

  console.log('--- CREATING DATABASE CONSTRAINT ---');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX one_active_borrow_per_user 
      ON "Transaction" ("userId", "bookId") 
      WHERE status IN ('BORROWED', 'OVERDUE');
    `);
    console.log('✅ DATABASE CONSTRAINT ACTIVE.');
  } catch (err: any) {
    console.error('❌ Failed to create constraint:', err.message);
  }

  console.log('--- SYNCING STOCK ---');
  const allBooks = await prisma.book.findMany({ include: { transactions: { where: { status: { in: ['BORROWED', 'OVERDUE'] } } } } });
  for (const b of allBooks) {
    const expected = b.totalCopies - b.transactions.length;
    if (b.availableCopies !== expected) {
      await prisma.book.update({ where: { id: b.id }, data: { availableCopies: expected } });
      console.log(`   Synced "${b.title}": ${expected} available.`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
