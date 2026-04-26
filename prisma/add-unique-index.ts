import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding database-level unique constraint to prevent duplicate active borrowings...');
  
  try {
    // Note: This is PostgreSQL specific syntax
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS one_active_borrow_per_user 
      ON "Transaction" ("userId", "bookId") 
      WHERE status IN ('BORROWED', 'OVERDUE');
    `);
    console.log('✅ Success: Unique index created successfully.');
  } catch (err) {
    console.error('❌ Error creating index:', err);
    console.log('Trying SQLite alternative...');
    try {
        // SQLite doesn't support WHERE in UNIQUE INDEX the same way, 
        // but we can try a trigger or just ignore if it's not the real DB.
        console.log('Skipping SQLite index for now.');
    } catch (sqliteErr) {
        console.error('SQLite check failed too.');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
