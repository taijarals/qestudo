const fs = require('fs');

let code = `import { prisma } from '../database/prisma';
import { QuestionPlannerService } from './QuestionPlannerService';
import { QuestionBatchGeneratorService } from './QuestionBatchGeneratorService';
import { QuestionBatchValidatorService } from './QuestionBatchValidatorService';

export class QuestionBatchGenerationService {
  private planner = new QuestionPlannerService();
  private generator = new QuestionBatchGeneratorService();
  private validator = new QuestionBatchValidatorService();

  async processBatch(batchId: string) {
    const batch = await prisma.questionBatch.findUnique({ where: { id: batchId } });
    if (!batch) throw new Error('Batch not found');
    
    if (batch.status !== 'pending' && batch.status !== 'processing') {
      return; 
    }

    try {
      await prisma.questionBatch.update({
        where: { id: batchId },
        data: { status: 'processing', startedAt: new Date() }
      });

      let conceptIds: string[] = [];
      if (batch.scopeType === 'material') {
        const leafConcepts = await prisma.concept.findMany({
          where: { materialId: batch.materialId, level: 'concept' }
        });
        conceptIds = leafConcepts.map(c => c.id);
      } else if (batch.scopeType === 'node') {
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

      const maxAttempts = Math.max(2, Math.ceil((batch.requestedQuantity / 5) * 2));
      let attempts = 0;
      let consecutiveRejections = 0;

      const existingQuestions = await prisma.question.findMany({
        where: { materialId: batch.materialId, validationStatus: 'approved', conceptId: { in: conceptIds } },
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
        if (consecutiveRejections >= 3) {
          console.log(\`[Batch \${batchId}] Abortando lote por 3 falhas consecutivas em lotes.\`);
          break; 
        }

        attempts++;
        
        const toGenerate = Math.min(5, batch.requestedQuantity - validated);
        const plans = [];

        for (let i = 0; i < toGenerate; i++) {
           const minConceptCount = conceptCounts[sortedConcepts[0]];
           const bestConcepts = sortedConcepts.filter(c => conceptCounts[c] === minConceptCount);
           const cId = bestConcepts[Math.floor(Math.random() * bestConcepts.length)];
           
           const minTypeCount = typeCounts[sortedTypes[0]];
           const bestTypes = sortedTypes.filter(t => typeCounts[t] === minTypeCount);
           const cType = bestTypes[Math.floor(Math.random() * bestTypes.length)];

           const plan = await this.planner.planQuestion({
             materialId: batch.materialId,
             conceptId: cId,
             board: batch.board as any,
             questionType: batch.questionType as any,
             difficulty: 'media'
           });

           await prisma.questionPlan.update({
             where: { id: plan.id },
             data: { batchId: batch.id, coverageType: cType }
           });

           plans.push(plan);
        }

        try {
          const generatedQuestions = await this.generator.generateQuestions(plans.map(p => p.id), batch.id);
          generated += generatedQuestions.length;

          if (generatedQuestions.length === 0) {
            consecutiveRejections++;
            continue;
          }

          const mode = process.env.AI_GENERATION_MODE || 'balanced'; // economy, balanced, strict
          const questionIds = generatedQuestions.map(q => q.id);
          
          let validResultCount = 0;

          if (mode === 'economy') {
             // Apenas validação determinística
             for (const q of generatedQuestions) {
               const isValid = this.validator.deterministicValidation(q);
               if (isValid) {
                 await prisma.question.update({ where: { id: q.id }, data: { validationStatus: 'approved' } });
                 validResultCount++;
               } else {
                 await prisma.question.update({ where: { id: q.id }, data: { validationStatus: 'rejected' } });
                 rejected++;
               }
             }
          } else {
             // Balanced or strict
             const validationResults = await this.validator.validateBatch(questionIds, batch.id, false);
             
             for (const vr of validationResults) {
                if (vr.isApproved) {
                   validResultCount++;
                } else if (mode === 'strict' && vr.validation.qualityScore >= 0.5 && vr.validation.qualityScore < 0.7) {
                   // Escalonamento opcional se for strict e estiver na dúvida (0.5 a 0.69)
                   console.log(\`Escalonando questão \${vr.question.id} para modelo mais forte\`);
                   const escResults = await this.validator.validateBatch([vr.question.id], batch.id, true);
                   if (escResults.length > 0 && escResults[0].isApproved) {
                      validResultCount++;
                   } else {
                      rejected++;
                   }
                } else {
                   rejected++;
                }
             }
             
             // Os que falharam no determinístico não retornam no array de validação, então soma aos rejeitados
             const semanticallyEvaluated = validationResults.length;
             rejected += (generatedQuestions.length - semanticallyEvaluated);
          }

          if (validResultCount === 0) {
             consecutiveRejections++;
          } else {
             consecutiveRejections = 0;
             validated += validResultCount;
             
             // Simple duplicate check could be added here, but omitted to simplify MVP
          }

        } catch (e: any) {
          console.error(\`[Batch \${batchId}] Error on attempt \${attempts}:\`, e.message);
          consecutiveRejections++;

          if (e.type === 'local_ai_budget_exceeded' || e.message?.includes('local_ai_budget_exceeded')) {
            await prisma.questionBatch.update({
              where: { id: batchId },
              data: { status: 'paused_quota', errorMessage: 'Limite de tokens local excedido' }
            });
            return;
          }
          if (e.status === 429 || e.message?.toLowerCase().includes('quota') || e.message?.toLowerCase().includes('exhausted')) {
            await prisma.questionBatch.update({
              where: { id: batchId },
              data: { status: 'paused_quota', errorMessage: 'Limite da IA atingido. A geração foi pausada para evitar novas tentativas.' }
            });
            return;
          }
          if (e.message?.toLowerCase().includes('rate limit')) {
            await prisma.questionBatch.update({
              where: { id: batchId },
              data: { status: 'paused_quota', errorMessage: 'A IA está temporariamente limitando novas requisições. Tente novamente mais tarde.' }
            });
            return;
          }
        }

        await prisma.questionBatch.update({
          where: { id: batchId },
          data: { generatedCount: generated, validatedCount: validated, rejectedCount: rejected, duplicateCount: duplicates }
        });
      }

      const finalStatus = validated >= batch.requestedQuantity ? 'completed' : (validated > 0 ? 'partial' : 'failed');
      let finalError = finalStatus === 'failed' ? 'Não foi possível gerar novas questões válidas dentro do limite de tentativas.' : null;
      if (consecutiveRejections >= 3) {
        finalError = 'Lote interrompido precocemente devido à alta taxa de rejeição ou erro.';
      }
      
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
}
`;

fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
