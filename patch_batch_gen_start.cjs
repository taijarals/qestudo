const fs = require('fs');

let code = fs.readFileSync('server/services/QuestionBatchGenerationService.ts', 'utf-8');

const startBatchMethod = `  async startBatch(params: {
    materialId: string;
    scopeId?: string;
    scopeType?: string;
    board?: string;
    questionType?: string;
    quantity: number;
  }) {
    const batch = await prisma.questionBatch.create({
      data: {
        materialId: params.materialId,
        scopeId: params.scopeId || params.materialId,
        scopeType: params.scopeType || 'material',
        board: params.board || 'CEBRASPE',
        questionType: params.questionType || 'certo-errado',
        requestedQuantity: params.quantity,
        status: 'pending'
      }
    });

    // Start asynchronously
    this.processBatch(batch.id).catch(console.error);

    return batch;
  }

  async processBatch(batchId: string) {`;

code = code.replace(/  async processBatch\(batchId: string\) \{/, startBatchMethod);

fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
