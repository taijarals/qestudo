import { GoogleGenAI, Type, Schema } from '@google/genai';
import { prisma } from '../database/prisma';
import { questionGenerationPrompt, QUESTION_GENERATION_PROMPT_VERSION } from '../ai/prompts/questionGenerationPrompt';

export class QuestionGeneratorService {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateQuestion(planId: string) {
    const plan = await prisma.questionPlan.findUnique({
      where: { id: planId },
      include: {
        concept: true,
        confusedConcept: true
      }
    });

    if (!plan) throw new Error('QuestionPlan not found');
    if (plan.status !== 'planned' && plan.status !== 'failed') {
      throw new Error('QuestionPlan is not in a valid state to generate');
    }

    await prisma.questionPlan.update({
      where: { id: planId },
      data: { status: 'generating' }
    });

    try {
      const chunks = await prisma.materialChunk.findMany({
        where: { id: { in: plan.sourceChunkIds }, materialId: plan.materialId }
      });

      if (chunks.length === 0) {
        throw new Error('No chunks found for this plan');
      }

      const chunksText = chunks.map(c => `[Chunk: ${c.id}]\n${c.text}`).join('\n\n');
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

      let responseSchema: Schema;
      let promptComplement = '';

      if (plan.questionType === 'multipla-escolha') {
        if (plan.targetCorrectPosition === null || plan.targetCorrectPosition === undefined) {
          throw new Error('Missing targetCorrectPosition for multiple choice');
        }
        promptComplement = `\nCrie uma questão múltipla-escolha (5 opções). Banco: ${plan.board}. Nível: ${plan.difficulty}. Objetivo Cognitivo: ${plan.cognitiveObjective}. TrapStrategy: ${plan.trapStrategy || 'nenhuma'}.`;
        if (plan.confusedConcept) {
           promptComplement += `\nExplore a confusão com o conceito: ${plan.confusedConcept.name}`;
        }

        responseSchema = {
          type: Type.OBJECT,
          properties: {
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
          required: ['statement', 'correctAnswer', 'distractors', 'explanation', 'sourceChunkIds']
        };

      } else if (plan.questionType === 'certo-errado') {
        if (plan.targetTrueFalse === null || plan.targetTrueFalse === undefined) {
          throw new Error('Missing targetTrueFalse for certo/errado');
        }
        promptComplement = `\nCrie UMA ÚNICA assertiva. Banco: ${plan.board}. Nível: ${plan.difficulty}. Objetivo Cognitivo: ${plan.cognitiveObjective}. TrapStrategy: ${plan.trapStrategy || 'nenhuma'}.`;
        promptComplement += `\nA assertiva DEVE SER ${plan.targetTrueFalse ? 'CORRETA (Certo)' : 'INCORRETA (Errada)'} semanticamente.`;
        
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            statement: { type: Type.STRING },
            explanation: { type: Type.STRING },
            sourceChunkIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['statement', 'explanation', 'sourceChunkIds']
        };
      } else {
        throw new Error('Unsupported question type');
      }

      const fullPrompt = `${questionGenerationPrompt}\n${promptComplement}\n\nCONCEITO PRINCIPAL: ${plan.concept.name} - ${plan.concept.description || ''}\n\nMATERIAL CHUNKS:\n${chunksText}`;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: fullPrompt,
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      const resultText = response.text;
      if (!resultText) throw new Error('No text returned from Gemini');

      const data = JSON.parse(resultText);

      // Perform deduplication check
      // (Basic exact/almost exact match of statement in the same concept)
      const existing = await prisma.question.findFirst({
        where: {
           conceptId: plan.conceptId,
           statement: data.statement
        }
      });

      if (existing) {
         throw new Error('A question with this exact statement already exists for this concept');
      }

      await prisma.$transaction(async (tx) => {
        // Create the question
        const question = await tx.question.create({
          data: {
            materialId: plan.materialId,
            conceptId: plan.conceptId,
            statement: data.statement,
            type: plan.questionType,
            board: plan.board,
            difficulty: plan.difficulty,
            cognitiveObjective: plan.cognitiveObjective,
            explanation: data.explanation,
            trapType: plan.trapStrategy,
            questionPlanId: plan.id,
            generationPromptVersion: QUESTION_GENERATION_PROMPT_VERSION,
            generationModel: model,
            generatedAt: new Date()
          }
        });

        // Add source references (validating against allowed chunks)
        const validSources = data.sourceChunkIds.filter((id: string) => plan.sourceChunkIds.includes(id));
        
        if (validSources.length === 0) {
           throw new Error('No valid sourceChunkIds returned by the model');
        }
        
        if (validSources.length !== data.sourceChunkIds.length) {
           throw new Error('Model returned unauthorized sourceChunkIds');
        }
        
        for (const chunkId of validSources) {
           const c = chunks.find(ch => ch.id === chunkId);
           if (!c) {
              throw new Error(`Chunk ${chunkId} not found in loaded chunks`);
           }
           await tx.questionSourceReference.create({
             data: {
               questionId: question.id,
               materialId: plan.materialId,
               chunkId: c.id,
               page: c.pageStart,
               excerpt: c.text.substring(0, 200) + '...' // simplification for excerpt
             }
           });
        }

        if (plan.questionType === 'multipla-escolha') {
           if (!data.distractors || data.distractors.length !== 4) {
             throw new Error('Multiple choice must return exactly 4 distractors');
           }
           
           const correctPos = plan.targetCorrectPosition as number;
           
           // Controlled shuffle for distractors
           const positions = [0, 1, 2, 3, 4];
           positions.splice(positions.indexOf(correctPos), 1);
           
           // Randomly assign distractors to remaining positions
           const shuffledDistractorPositions = [...positions].sort(() => Math.random() - 0.5);

           // Correct Option
           await tx.questionOption.create({
             data: {
               questionId: question.id,
               text: data.correctAnswer,
               isCorrect: true,
               position: correctPos,
               explanation: data.explanation
             }
           });

           // Distractors
           for (let i = 0; i < 4; i++) {
             const distractor = data.distractors[i];
             await tx.questionOption.create({
               data: {
                 questionId: question.id,
                 text: distractor.text,
                 isCorrect: false,
                 position: shuffledDistractorPositions[i],
                 errorType: distractor.errorType,
                 explanation: distractor.explanation,
                 confusedConceptId: (distractor.errorType === 'confusable_concept' && plan.confusedConceptId) ? plan.confusedConceptId : null
               }
             });
           }
        } else if (plan.questionType === 'certo-errado') {
           // Create a single true/false option to unify the interface, or just store the fact that it's True/False.
           // Since QEstudo usually uses QuestionOption for multi-choice, for C/E we might just store options "Certo" and "Errado"
           // where isCorrect points to the right one.
           
           const isTrue = plan.targetTrueFalse as boolean;

           await tx.questionOption.create({
             data: {
               questionId: question.id,
               text: 'Certo',
               isCorrect: isTrue,
               position: 0,
             }
           });

           await tx.questionOption.create({
             data: {
               questionId: question.id,
               text: 'Errado',
               isCorrect: !isTrue,
               position: 1,
             }
           });
        }
        
        await tx.questionPlan.update({
          where: { id: plan.id },
          data: { status: 'generated' }
        });
      });

      // Fetch complete question to return
      const createdQuestion = await prisma.question.findUnique({
        where: { questionPlanId: plan.id },
        include: {
          options: true,
          sourceReferences: true
        }
      });
      return createdQuestion;
      
    } catch (e: any) {
      await prisma.questionPlan.update({
        where: { id: planId },
        data: { status: 'failed' }
      });
      throw e;
    }
  }
}
