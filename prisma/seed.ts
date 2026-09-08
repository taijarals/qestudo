import { PrismaClient } from '@prisma/client';
import { 
  mockMaterials, 
  mockDomainConcepts, 
  mockQuestions, 
  mockDomainMasteries 
} from '../src/mocks/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Materials
  for (const m of mockMaterials) {
    await prisma.material.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        title: m.title,
        description: '',
        progress: m.studyCoverage || 0,
        fileName: m.fileName,
        status: m.status,
        processingProgress: m.processingProgress,
      }
    });
  }

  // 2. Concepts (First pass: without parents to avoid FK issues)
  for (const c of mockDomainConcepts) {
    await prisma.concept.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        materialId: c.materialId,
      }
    });
  }

  // 3. Concepts (Second pass: assign parents)
  for (const c of mockDomainConcepts) {
    if (c.parentId) {
      await prisma.concept.update({
        where: { id: c.id },
        data: { parentId: c.parentId }
      });
    }
  }

  // 4. Questions
  for (const q of mockQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        statement: q.statement || "",
        explanation: q.explanation,
        cognitiveObjective: q.cognitiveObjective,
        trapType: q.trapType,
        confidenceScore: q.confidenceScore,
        validationStatus: q.validationStatus || "validated",
        type: q.type,
        board: q.board,
        
        difficulty: q.difficulty,
        
        materialId: q.materialId,
        conceptId: q.conceptId,
        options: {
          create: q.options?.map(o => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect
          })) || []
        },
        sourceReferences: {
          create: q.sourceReferences?.map(sr => ({
            
            materialId: sr.materialId, page: sr.page || 0, excerpt: sr.excerpt || "", chunkId: sr.chunkId
          })) || []
        }
      }
    });
  }

  // 5. Mastery
  for (const m of mockDomainMasteries) {
    await prisma.conceptMastery.upsert({
      where: { conceptId: m.conceptId },
      update: {},
      create: {
        conceptId: m.conceptId,
        masteryScore: m.masteryScore || 0, status: m.status, correctAnswers: m.correctAnswers, wrongAnswers: m.wrongAnswers
      }
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
