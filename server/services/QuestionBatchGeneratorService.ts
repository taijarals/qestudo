import { Type, Schema } from '@google/genai';
import { geminiClient } from './ai/GeminiClient';
import { prisma } from '../database/prisma';
import { questionBatchGenerationPrompt, QUESTION_BATCH_GENERATION_PROMPT_VERSION } from '../ai/prompts/questionBatchGenerationPrompt';
import { getGeminiModel } from '../config/gemini';

export class QuestionBatchGeneratorService {
  async generateQuestions(planIds: string[], batchId?: string) {
    if (planIds.length === 0) return [];
    if (planIds.length > 5) throw new Error('Maximum 5 plans per batch');

    const plans = await prisma.questionPlan.findMany({
      where: { id: { in: planIds } },
      include: { concept: true, confusedConcept: true }
    });

    if (plans.length === 0) return [];
    
    // Deduplicate chunk IDs
    const allChunkIds = new Set<string>();
    plans.forEach(p => p.sourceChunkIds.forEach(id => allChunkIds.add(id)));

    const chunks = await prisma.materialChunk.findMany({
      where: { id: { in: Array.from(allChunkIds) } }
    });

    const chunksText = chunks.map(c => `[Chunk: ${c.id}]\n${c.text}`).join('\n\n');

    let promptComplement = "PLANOS DE QUESTÕES A GERAR:\n\n";
    
    const questionType = plans[0].questionType; // assuming batch has same type
    
    plans.forEach((plan, i) => {
      promptComplement += `--- PLANO ${i + 1} ---\n`;
      promptComplement += `ID do Plano: ${plan.id}\n`;
      promptComplement += `Conceito: ${plan.concept.name} - ${plan.concept.description || ''}\n`;
      promptComplement += `Banco: ${plan.board}. Nível: ${plan.difficulty}. Objetivo Cognitivo: ${plan.cognitiveObjective}. TrapStrategy: ${plan.trapStrategy || 'nenhuma'}.\n`;
      
      if (questionType === 'multipla-escolha') {
        promptComplement += `Tipo: Múltipla-escolha (5 opções)\n`;
        if (plan.confusedConcept) {
           promptComplement += `Explore a confusão com o conceito: ${plan.confusedConcept.name}\n`;
        }
      } else {
        promptComplement += `Tipo: Certo-Errado (1 assertiva)\n`;
        promptComplement += `A assertiva DEVE SER ${plan.targetTrueFalse ? 'CORRETA (Certo)' : 'INCORRETA (Errada)'} semanticamente.\n`;
      }
    });

    let itemSchema: Schema;
    if (questionType === 'multipla-escolha') {
      itemSchema = {
        type: Type.OBJECT,
        properties: {
          planId: { type: Type.STRING },
          statement: { type: Type.STRING },
          correctAnswer: { type: Type.STRING },
          distractors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                errorType: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['text', 'errorType', 'explanation']
            }
          },
          explanation: { type: Type.STRING },
          sourceChunkIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['planId', 'statement', 'correctAnswer', 'distractors', 'explanation', 'sourceChunkIds']
      };
    } else {
      itemSchema = {
        type: Type.OBJECT,
        properties: {
          planId: { type: Type.STRING },
          statement: { type: Type.STRING },
          explanation: { type: Type.STRING },
          sourceChunkIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['planId', 'statement', 'explanation', 'sourceChunkIds']
      };
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: itemSchema
        }
      },
      required: ['questions']
    };

    const fullPrompt = `${questionBatchGenerationPrompt}\n\nMATERIAL CHUNKS:\n${chunksText}\n\n${promptComplement}`;
    const model = getGeminiModel();
    
    const response = await geminiClient.generateContent({
      operation: 'question_generation', 
      model: model,
      contents: fullPrompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      },
      materialId: plans[0].materialId, 
      batchId 
    });

    const resultText = response.text;
    if (!resultText) throw new Error('No text returned from Gemini');
    const data = JSON.parse(resultText);
    
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid response structure');
    }

    const generatedQuestions = [];

    for (const qData of data.questions) {
      const plan = plans.find(p => p.id === qData.planId);
      if (!plan) continue;

      try {
        const existing = await prisma.question.findFirst({
          where: { conceptId: plan.conceptId, statement: qData.statement }
        });
        if (existing) throw new Error('Duplicate statement');

        const question = await prisma.$transaction(async (tx) => {
          const q = await tx.question.create({
            data: {
              materialId: plan.materialId,
              conceptId: plan.conceptId,
              statement: qData.statement,
              type: plan.questionType,
              board: plan.board,
              difficulty: plan.difficulty,
              cognitiveObjective: plan.cognitiveObjective,
              explanation: qData.explanation,
              trapType: plan.trapStrategy,
              questionPlanId: plan.id,
              generationPromptVersion: QUESTION_BATCH_GENERATION_PROMPT_VERSION,
              generationModel: model,
              generatedAt: new Date()
            }
          });

          const validSources = qData.sourceChunkIds.filter((id: string) => plan.sourceChunkIds.includes(id));
          if (validSources.length === 0) throw new Error('No valid sources');

          for (const chunkId of validSources) {
             const c = chunks.find(ch => ch.id === chunkId);
             if (c) {
               await tx.questionSourceReference.create({
                 data: {
                   questionId: q.id,
                   materialId: plan.materialId,
                   chunkId: c.id,
                   page: c.pageStart,
                   excerpt: c.text.substring(0, 200) + '...'
                 }
               });
             }
          }

          if (plan.questionType === 'multipla-escolha') {
             if (!qData.distractors || qData.distractors.length !== 4) throw new Error('Must have 4 distractors');
             const correctPos = plan.targetCorrectPosition as number;
             const positions = [0, 1, 2, 3, 4];
             positions.splice(positions.indexOf(correctPos), 1);
             const shuffled = [...positions].sort(() => Math.random() - 0.5);

             await tx.questionOption.create({
               data: {
                 questionId: q.id, text: qData.correctAnswer, isCorrect: true, position: correctPos, explanation: qData.explanation
               }
             });

             for (let i = 0; i < 4; i++) {
               const distractor = qData.distractors[i];
               await tx.questionOption.create({
                 data: {
                   questionId: q.id, text: distractor.text, isCorrect: false, position: shuffled[i],
                   errorType: distractor.errorType, explanation: distractor.explanation,
                   confusedConceptId: (distractor.errorType === 'confusable_concept' && plan.confusedConceptId) ? plan.confusedConceptId : null
                 }
               });
             }
          } else if (plan.questionType === 'certo-errado') {
             const isTrue = plan.targetTrueFalse as boolean;
             await tx.questionOption.create({ data: { questionId: q.id, text: 'Certo', isCorrect: isTrue, position: 0 } });
             await tx.questionOption.create({ data: { questionId: q.id, text: 'Errado', isCorrect: !isTrue, position: 1 } });
          }

          await tx.questionPlan.update({ where: { id: plan.id }, data: { status: 'generated' } });
          return q;
        });

        generatedQuestions.push(question);
      } catch (e: any) {
        console.error(`Error saving question for plan ${plan.id}:`, e.message);
        await prisma.questionPlan.update({ where: { id: plan.id }, data: { status: 'failed' } });
      }
    }

    return generatedQuestions;
  }
}
