const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const materials = await prisma.material.findMany({
    select: {
      id: true,
      title: true,
      fileName: true,
      storagePath: true,
      status: true,
      uploadedAt: true
    }
  });
  console.log("MATERIALS COUNT:", materials.length);
  materials.forEach(m => console.log(m));
}
main().finally(() => prisma.$disconnect());
