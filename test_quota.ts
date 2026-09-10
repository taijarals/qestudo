import { prisma } from './server/database/prisma';
import { geminiClient } from './server/services/ai/GeminiClient';
import { QuestionBatchGenerationService } from './server/services/QuestionBatchGenerationService';

async function run() {
  const material = await prisma.material.findFirst();
  if (!material) {
    console.log("Sem material para teste");
    return;
  }
  
  const concept = await prisma.concept.findFirst({ where: { materialId: material.id, level: 'concept' }});
  if (!concept) {
     console.log("Sem conceito para teste");
     return;
  }

  // Inject a mock error into internal ai client
  (geminiClient as any).ai.models.generateContent = async (params: any) => {
    const error: any = new Error("Quota exceeded simulated");
    error.status = 429;
    throw error;
  };

  const service = new QuestionBatchGenerationService();
  const batch = await service.startBatch({
    materialId: material.id,
    scopeType: 'concept',
    scopeId: concept.id,
    board: 'CEBRASPE',
    questionType: 'certo-errado',
    quantity: 1
  });

  console.log("Batch started:", batch.id);

  // wait for processing
  await new Promise(r => setTimeout(r, 2000));

  const updatedBatch = await prisma.questionBatch.findUnique({ where: { id: batch.id }});
  console.log("Batch status:", updatedBatch?.status);
  console.log("Batch error:", updatedBatch?.errorMessage);

  const usages = await prisma.aIUsage.findMany({ where: { batchId: batch.id }});
  console.log("AI Usages logged:", usages.length);
  for (const u of usages) {
    console.log("Usage status:", u.status, "Error Type:", u.errorType);
  }
}

run().catch(console.error).finally(() => process.exit(0));
