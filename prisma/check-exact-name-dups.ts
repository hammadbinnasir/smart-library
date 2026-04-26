import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { name: 'John F Kendy' }
  });
  console.log(`Found ${users.length} users with name "John F Kendy":`);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Email: ${u.email}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
