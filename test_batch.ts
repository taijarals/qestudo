import { prisma } from './server/database/prisma';
import { QuestionBatchGenerationService } from './server/services/QuestionBatchGenerationService';
import { geminiClient } from './server/services/ai/GeminiClient';

async function run() {
  // Let's create a dummy batch in DB to process
  const mat = await prisma.material.findFirst();
  if (!mat) { console.log('No material'); return; }
  
  const scope = await prisma.concept.findFirst({ where: { materialId: mat.id } });
  
  const batch = await prisma.questionBatch.create({
    data: {
      materialId: mat.id,
      scopeId: scope.id,
      scopeType: 'node',
      board: 'FGV',
      questionType: 'multipla-escolha',
      requestedQuantity: 2,
      status: 'pending'
    }
  });

  const svc = new QuestionBatchGenerationService();
  await svc.processBatch(batch.id);
  
  const finalBatch = await prisma.questionBatch.findUnique({ where: { id: batch.id } });
  console.log('Batch final status:', finalBatch.status);
  console.log('Generated:', finalBatch.generatedCount);
  console.log('Validated:', finalBatch.validatedCount);
}

run().catch(console.error).finally(() => process.exit(0));
