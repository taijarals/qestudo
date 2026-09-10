const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const c = await prisma.concept.findFirst({ where: { level: 'discipline' } });
  console.log(c);
}

run().catch(console.error).finally(() => prisma.$disconnect());
