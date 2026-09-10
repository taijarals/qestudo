const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const c = await prisma.concept.findMany({ take: 3 });
  console.log(c);
}

run().catch(console.error).finally(() => prisma.$disconnect());
