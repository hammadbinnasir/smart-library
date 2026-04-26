import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { name: 'John F Kendy' } });
  if (user) {
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { book: true }
    });
    console.log(`Transactions for ${user.name}:`);
    console.log(JSON.stringify(transactions, null, 2));
  } else {
    console.log('User John F Kendy not found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
