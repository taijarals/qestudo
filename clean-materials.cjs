const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.material.deleteMany({
    where: {
      title: 'Test Material',
      fileName: null
    }
  });
  console.log("Deleted count:", result.count);
}
main().finally(() => prisma.$disconnect());
