import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate book titles or ISBNs...');
  const allBooks = await prisma.book.findMany();
  
  const titleMap = new Map<string, string[]>();
  const isbnMap = new Map<string, string[]>();

  for (const b of allBooks) {
    const title = b.title.toLowerCase().trim();
    if (!titleMap.has(title)) titleMap.set(title, []);
    titleMap.get(title)?.push(b.id);

    const isbn = b.isbn.trim();
    if (!isbnMap.has(isbn)) isbnMap.set(isbn, []);
    isbnMap.get(isbn)?.push(b.id);
  }

  let foundDups = false;
  for (const [title, ids] of titleMap.entries()) {
    if (ids.length > 1) {
      foundDups = true;
      console.log(`❌ Duplicate Title Found: "${title}" is present in ${ids.length} entries.`);
    }
  }

  for (const [isbn, ids] of isbnMap.entries()) {
    if (ids.length > 1) {
      foundDups = true;
      console.log(`❌ Duplicate ISBN Found: "${isbn}" is present in ${ids.length} entries.`);
    }
  }

  if (!foundDups) console.log('✅ No duplicate books found.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
