const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'qestudo';
  `;
  console.log("Tables in schema 'qestudo':");
  result.forEach(row => console.log("- " + row.table_name));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
