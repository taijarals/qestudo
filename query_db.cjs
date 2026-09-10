const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const materials = await prisma.material.findMany();
  console.log("Materials:", materials.map(m => ({ id: m.id, title: m.title })));
  
  if (materials.length === 0) return;
  const materialId = materials[0].id;
  console.log("Using materialId:", materialId);

  const concepts = await prisma.concept.findMany({ where: { materialId } });
  const byLevel = concepts.reduce((acc, c) => {
    acc[c.level] = (acc[c.level] || 0) + 1;
    return acc;
  }, {});
  console.log("Concepts by level:", byLevel);

  const questions = await prisma.question.findMany({ where: { materialId } });
  const qByStatus = questions.reduce((acc, q) => {
    acc[q.validationStatus] = (acc[q.validationStatus] || 0) + 1;
    return acc;
  }, {});
  console.log("Questions by status:", qByStatus);
  
  const validatedQ = questions.filter(q => q.validationStatus === 'validated');
  console.log("Validated Questions mapped to concepts:");
  for (const q of validatedQ) {
    const c = concepts.find(c => c.id === q.conceptId);
    console.log(`- Q: ${q.id} -> Concept: ${q.conceptId} (Exists: ${!!c}, Level: ${c?.level})`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
