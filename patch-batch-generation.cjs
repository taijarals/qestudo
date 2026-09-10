const fs = require('fs');

const code = `
import { prisma } from '../database/prisma';
import { QuestionPlannerService } from './QuestionPlannerService';
import { QuestionGeneratorService } from './QuestionGeneratorService';
import { QuestionValidatorService } from './QuestionValidatorService';

export class QuestionBatchGenerationService {
  private planner: QuestionPlannerService;
  private generator: QuestionGeneratorService;
  private validator: QuestionValidatorService;

  constructor() {
    this.planner = new QuestionPlannerService();
    this.generator = new QuestionGeneratorService();
    this.validator = new QuestionValidatorService();
  }

  async startBatch(params: {
    materialId: string;
    scopeType: string;
    scopeId: string;
    board: string;
    questionType: string;
    quantity: number;
  }) {
    // 1. Create batch record
    const batch = await prisma.questionBatch.create({
      data: {
        materialId: params.materialId,
        scopeType: params.scopeType,
        scopeId: params.scopeId,
        board: params.board,
        questionType: params.questionType,
        requestedQuantity: params.quantity,
        status: 'processing'
      }
    });

    // 2. Start processing in background (fire and forget)
    this.processBatch(batch.id).catch(async (e) => {
      console.error(\`[Batch \${batch.id}] Fatal error:\`, e);
      await prisma.questionBatch.update({
        where: { id: batch.id },
        data: { status: 'failed', errorMessage: e.message || 'Erro inesperado' }
      });
    });

    return batch;
  }

  private async processBatch(batchId: string) {
    const batch = await prisma.questionBatch.findUnique({ where: { id: batchId } });
    if (!batch) return;

    try {
      // Resolve concept leaves
      let conceptIds: string[] = [];
      if (batch.scopeType === 'material') {
        const concepts = await prisma.concept.findMany({
          where: { materialId: batch.materialId, level: 'concept' },
          select: { id: true }
        });
        conceptIds = concepts.map(c => c.id);
      } else if (batch.scopeType === 'concept') {
        const concept = await prisma.concept.findUnique({ where: { id: batch.scopeId } });
        if (!concept || concept.materialId !== batch.materialId) {
          throw new Error('Conceito inválido ou pertencente a outro material.');
        }
        conceptIds = [batch.scopeId];
      } else if (['discipline', 'topic', 'subtopic'].includes(batch.scopeType)) {
        const node = await prisma.concept.findUnique({ where: { id: batch.scopeId } });
        if (!node || node.materialId !== batch.materialId) {
          throw new Error('Escopo inválido ou pertencente a outro material.');
        }
        conceptIds = await this.getLeafConceptIds(batch.scopeId);
      } else {
        throw new Error(\`Tipo de escopo desconhecido: \${batch.scopeType}\`);
      }

      if (conceptIds.length === 0) {
        throw new Error('Nenhum conceito final foi encontrado para o escopo selecionado.');
      }

      const coverageTypes = ['definition', 'comparison', 'example', 'application', 'exception', 'constitutional_basis', 'relationship', 'interpretation', 'confusable_concept'];
      
      let generated = batch.generatedCount;
      let validated = batch.validatedCount;
      let rejected = batch.rejectedCount;
      let duplicates = batch.duplicateCount;

      const maxAttempts = batch.requestedQuantity * 3;
      let attempts = 0;

      // Fetch existing questions to prioritize less explored concepts/types
      const existingQuestions = await prisma.question.findMany({
        where: { materialId: batch.materialId, validationStatus: 'validated', conceptId: { in: conceptIds } },
        select: { conceptId: true, coverageType: true }
      });

      const conceptCounts = conceptIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {} as Record<string, number>);
      const typeCounts = coverageTypes.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<string, number>);

      existingQuestions.forEach(q => {
        if (q.conceptId && conceptCounts[q.conceptId] !== undefined) conceptCounts[q.conceptId]++;
        if (q.coverageType && typeCounts[q.coverageType] !== undefined) typeCounts[q.coverageType]++;
      });

      const sortedConcepts = [...conceptIds].sort((a, b) => conceptCounts[a] - conceptCounts[b]);
      const sortedTypes = [...coverageTypes].sort((a, b) => typeCounts[a] - typeCounts[b]);

      while (validated < batch.requestedQuantity && attempts < maxAttempts) {
        attempts++;
        
        // Select best concept (random among those with lowest count)
        const minConceptCount = conceptCounts[sortedConcepts[0]];
        const bestConcepts = sortedConcepts.filter(c => conceptCounts[c] === minConceptCount);
        const cId = bestConcepts[Math.floor(Math.random() * bestConcepts.length)];
        
        // Select best type
        const minTypeCount = typeCounts[sortedTypes[0]];
        const bestTypes = sortedTypes.filter(t => typeCounts[t] === minTypeCount);
        const cType = bestTypes[Math.floor(Math.random() * bestTypes.length)];

        try {
          // Create plan
          const plan = await this.planner.planQuestion({
            materialId: batch.materialId,
            conceptId: cId,
            board: batch.board as any,
            questionType: batch.questionType as any,
            difficulty: 'media'
          });

          // Add batchId and coverageType to plan
          await prisma.questionPlan.update({
            where: { id: plan.id },
            data: { batchId: batch.id, coverageType: cType }
          });

          // Generate
          const generatedQ = await this.generator.generateQuestion(plan.id);
          if (!generatedQ) throw new Error('Generation failed');
          const questionId = generatedQ.id;
          generated++;

          // Add coverageType to generated question
          await prisma.question.update({
            where: { id: questionId },
            data: { coverageType: cType }
          });

          // Validate
          const valResult = await this.validator.validateQuestion(questionId);

          if (valResult.validationStatus === 'validated') {
            // Check simple text deduplication
            const question = await prisma.question.findUnique({ where: { id: questionId } });
            const isDup = await this.isDuplicate(question!.statement, batch.materialId, questionId);
            
            if (isDup) {
              await prisma.question.update({ where: { id: questionId }, data: { validationStatus: 'duplicate' } });
              duplicates++;
            } else {
              validated++;
              
              // Update heuristic counts
              conceptCounts[cId]++;
              typeCounts[cType]++;
              sortedConcepts.sort((a, b) => conceptCounts[a] - conceptCounts[b]);
              sortedTypes.sort((a, b) => typeCounts[a] - typeCounts[b]);
            }
          } else {
            rejected++;
          }
        } catch (e: any) {
          console.error(\`[Batch \${batchId}] Error on attempt \${attempts}:\`, e.message);
          rejected++;
        }

        // Update batch progress inside loop (even if exception occurs)
        await prisma.questionBatch.update({
          where: { id: batchId },
          data: { generatedCount: generated, validatedCount: validated, rejectedCount: rejected, duplicateCount: duplicates }
        });
      }

      const finalStatus = validated >= batch.requestedQuantity ? 'completed' : (validated > 0 ? 'partial' : 'failed');
      const finalError = finalStatus === 'failed' ? 'Não foi possível gerar questões válidas (limite de tentativas excedido).' : null;
      
      await prisma.questionBatch.update({
        where: { id: batchId },
        data: { 
          status: finalStatus, 
          completedAt: new Date(),
          errorMessage: finalError
        }
      });
      
    } catch (e: any) {
      console.error(\`[Batch \${batchId}] Process error:\`, e.message);
      await prisma.questionBatch.update({
        where: { id: batchId },
        data: { 
          status: 'failed', 
          completedAt: new Date(),
          errorMessage: e.message || 'Erro no processamento do lote.'
        }
      });
    }
  }

  private async getLeafConceptIds(parentId: string): Promise<string[]> {
    const directChildren = await prisma.concept.findMany({ where: { parentId } });
    let leaves: string[] = [];
    for (const child of directChildren) {
      if (child.level === 'concept') {
        leaves.push(child.id);
      } else {
        leaves = leaves.concat(await this.getLeafConceptIds(child.id));
      }
    }
    return leaves;
  }

  private async isDuplicate(statement: string, materialId: string, currentId: string): Promise<boolean> {
    const questions = await prisma.question.findMany({
      where: { materialId, validationStatus: 'validated', id: { not: currentId } }
    });
    
    const stmt = statement.toLowerCase().trim();
    for (const q of questions) {
      const existingStmt = q.statement.toLowerCase().trim();
      if (stmt === existingStmt) return true;
      if (stmt.includes(existingStmt) || existingStmt.includes(stmt)) return true;
    }
    return false;
  }
}
`;
fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
