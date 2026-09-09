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
      console.error(`[Batch ${batch.id}] Fatal error:`, e);
      await prisma.questionBatch.update({
        where: { id: batch.id },
        data: { status: 'failed' }
      });
    });

    return batch;
  }

  private async processBatch(batchId: string) {
    const batch = await prisma.questionBatch.findUnique({ where: { id: batchId } });
    if (!batch) return;

    // Resolve concept leaves
    let conceptIds: string[] = [];
    if (batch.scopeType === 'concept') {
      conceptIds = [batch.scopeId];
    } else {
      conceptIds = await this.getLeafConceptIds(batch.scopeId);
    }

    if (conceptIds.length === 0) {
      await prisma.questionBatch.update({ where: { id: batchId }, data: { status: 'failed', completedAt: new Date() } });
      return;
    }

    const coverageTypes = ['definition', 'comparison', 'example', 'application', 'exception', 'constitutional_basis'];
    let generated = 0;
    let validated = 0;
    let rejected = 0;
    let duplicates = 0;

    const maxAttempts = batch.requestedQuantity * 3;
    let attempts = 0;

    while (validated < batch.requestedQuantity && attempts < maxAttempts) {
      attempts++;
      
      // Select a random concept and coverage type to diversify
      const cId = conceptIds[Math.floor(Math.random() * conceptIds.length)];
      const cType = coverageTypes[Math.floor(Math.random() * coverageTypes.length)];

      try {
        // Create plan
        const plan = await this.planner.createPlan({
          materialId: batch.materialId,
          conceptId: cId,
          board: batch.board,
          questionType: batch.questionType,
          difficulty: 'medium' // simplificando
        });

        // Add batchId and coverageType to plan
        await prisma.questionPlan.update({
          where: { id: plan.id },
          data: { batchId: batch.id, coverageType: cType }
        });

        // Generate
        const questionId = await this.generator.generateFromPlan(plan.id);
        generated++;

        // Add coverageType to generated question
        await prisma.question.update({
          where: { id: questionId },
          data: { coverageType: cType }
        });

        // Validate
        const valResult = await this.validator.validateQuestion(questionId);

        if (valResult.status === 'validated') {
          // Check simple text deduplication
          const question = await prisma.question.findUnique({ where: { id: questionId } });
          const isDup = await this.isDuplicate(question!.statement, batch.materialId, questionId);
          if (isDup) {
            await prisma.question.update({ where: { id: questionId }, data: { validationStatus: 'duplicate' } });
            duplicates++;
          } else {
            validated++;
          }
        } else {
          rejected++;
        }

        // Update batch progress
        await prisma.questionBatch.update({
          where: { id: batchId },
          data: { generatedCount: generated, validatedCount: validated, rejectedCount: rejected, duplicateCount: duplicates }
        });

      } catch (e: any) {
        console.error(`[Batch ${batchId}] Error on attempt ${attempts}:`, e.message);
        rejected++;
      }
    }

    const finalStatus = validated >= batch.requestedQuantity ? 'completed' : (validated > 0 ? 'partial' : 'failed');
    
    await prisma.questionBatch.update({
      where: { id: batchId },
      data: { status: finalStatus, completedAt: new Date() }
    });
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
    // very basic deduplication: > 80% similarity or identical after lowercasing
    const stmt = statement.toLowerCase().trim();
    for (const q of questions) {
      const existingStmt = q.statement.toLowerCase().trim();
      if (stmt === existingStmt) return true;
      // crude substring match
      if (stmt.includes(existingStmt) || existingStmt.includes(stmt)) return true;
    }
    return false;
  }
}
