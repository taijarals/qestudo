import { getGeminiModel } from '../config/gemini';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { prisma } from '../database/prisma';
import { questionValidationPrompt, QUESTION_VALIDATION_PROMPT_VERSION } from '../ai/prompts/questionValidationPrompt';

export class QuestionValidatorService {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async validateQuestion(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: { orderBy: { position: 'asc' } },
        sourceReferences: true,
        questionPlan: true
      }
    });

    if (!question) throw new Error('Question not found');
    const plan = question.questionPlan;
    if (!plan) throw new Error('Question plan not found');

    // 1. Deterministic Validations
    if (!question.statement) {
       await this.rejectQuestion(question.id, 'Statement is empty');
       return this.getResult(question.id);
    }
    if (!question.explanation) {
       await this.rejectQuestion(question.id, 'Explanation is empty');
       return this.getResult(question.id);
    }
    if (question.sourceReferences.length === 0) {
       await this.rejectQuestion(question.id, 'No source references found');
       return this.getResult(question.id);
    }

    const chunkIds = question.sourceReferences.map(sr => sr.chunkId);
    
    // Check if chunks belong to material and are authorized
    for (const cid of chunkIds) {
       if (!plan.sourceChunkIds.includes(cid)) {
          await this.rejectQuestion(question.id, `Unauthorized source chunk id used: ${cid}`);
          return this.getResult(question.id);
       }
    }

    // Type specific deterministic validation
    if (question.type === 'multipla-escolha') {
       if (question.options.length !== 5) {
          await this.rejectQuestion(question.id, 'Must have exactly 5 options');
          return this.getResult(question.id);
       }
       const correctOptions = question.options.filter(o => o.isCorrect);
       if (correctOptions.length !== 1) {
          await this.rejectQuestion(question.id, 'Must have exactly 1 correct option');
          return this.getResult(question.id);
       }
       if (plan.targetCorrectPosition !== null && correctOptions[0].position !== plan.targetCorrectPosition) {
          await this.rejectQuestion(question.id, 'Correct option is not at the target correct position');
          return this.getResult(question.id);
       }
       
       const uniqueTexts = new Set(question.options.map(o => o.text.trim().toLowerCase()));
       if (uniqueTexts.size !== 5) {
          await this.rejectQuestion(question.id, 'Options must be unique');
          return this.getResult(question.id);
       }
       const positions = new Set(question.options.map(o => o.position));
       if (positions.size !== 5) {
          await this.rejectQuestion(question.id, 'Positions must be unique');
          return this.getResult(question.id);
       }
    } else if (question.type === 'certo-errado') {
       const correctOptions = question.options.filter(o => o.isCorrect);
       if (correctOptions.length !== 1) {
          await this.rejectQuestion(question.id, 'Must have exactly 1 correct option (Certo ou Errado)');
          return this.getResult(question.id);
       }
       const isTrue = correctOptions[0].text === 'Certo';
       if (plan.targetTrueFalse !== null && isTrue !== plan.targetTrueFalse) {
          await this.rejectQuestion(question.id, 'Question True/False value does not match targetTrueFalse');
          return this.getResult(question.id);
       }
    }

    // 2. Semantic Validation using Gemini
    const chunks = await prisma.materialChunk.findMany({
      where: { id: { in: chunkIds } }
    });

    const chunksText = chunks.map(c => `[Chunk: ${c.id}]\n${c.text}`).join('\n\n');
    const model = getGeminiModel();

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        isAnswerCorrect: { type: Type.BOOLEAN },
        isSupportedBySource: { type: Type.BOOLEAN },
        hasSecondDefensibleAnswer: { type: Type.BOOLEAN },
        isAmbiguous: { type: Type.BOOLEAN },
        isExplanationCorrect: { type: Type.BOOLEAN },
        isDifficultyAppropriate: { type: Type.BOOLEAN },
        respectsBoardStyle: { type: Type.BOOLEAN },
        respectsQuestionPlan: { type: Type.BOOLEAN },
        distractorsPlausible: { type: Type.BOOLEAN },
        usesExternalKnowledge: { type: Type.BOOLEAN },
        sourceCoverageScore: { type: Type.NUMBER },
        clarityScore: { type: Type.NUMBER },
        qualityScore: { type: Type.NUMBER },
        issues: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        reasoningSummary: { type: Type.STRING }
      },
      required: [
        'isAnswerCorrect', 'isSupportedBySource', 'hasSecondDefensibleAnswer', 'isAmbiguous',
        'isExplanationCorrect', 'isDifficultyAppropriate', 'respectsBoardStyle', 'respectsQuestionPlan',
        'distractorsPlausible', 'usesExternalKnowledge', 'sourceCoverageScore', 'clarityScore', 'qualityScore',
        'issues', 'reasoningSummary'
      ]
    };

    let optionsStr = '';
    if (question.type === 'multipla-escolha') {
       optionsStr = question.options.map(o => `[Posição: ${o.position} | É a correta planeada? ${o.isCorrect}]\nTexto: ${o.text}`).join('\n\n');
    } else {
       const isCorrectText = question.options.find(o => o.isCorrect)?.text;
       optionsStr = `Esta é uma questão Certo/Errado. A assertiva deve ser avaliada como: ${isCorrectText}`;
    }

    const questionJson = {
       enunciado: question.statement,
       opcoes: optionsStr,
       explicacao: question.explanation,
       dificuldadePlanejada: plan.difficulty,
       banca: plan.board
    };

    const promptComplement = `
AVALIE A SEGUINTE QUESTÃO E SUAS OPÇÕES COM BASE NOS TRECHOS FORNECIDOS.
DADOS DA QUESTÃO:
${JSON.stringify(questionJson, null, 2)}

TRECHOS (ÚNICA FONTE DA VERDADE):
${chunksText}
    `;

    const fullPrompt = `${questionValidationPrompt}\n${promptComplement}`;

    const response = await this.ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error('No text returned from Gemini');

    const data = JSON.parse(resultText);

    // 3. Calculate Confidence Score
    let confidenceScore = (
      (data.sourceCoverageScore || 1.0) * 0.3 + 
      (data.clarityScore || 1.0) * 0.3 + 
      (data.qualityScore || 1.0) * 0.4
    );

    // Hard fail rules
    let isApproved = true;
    if (confidenceScore < 0.85) isApproved = false;
    if (!data.isAnswerCorrect) isApproved = false;
    if (!data.isSupportedBySource) isApproved = false;
    if (data.hasSecondDefensibleAnswer) isApproved = false;
    if (data.isAmbiguous) isApproved = false;
    if (data.usesExternalKnowledge) isApproved = false;

    // 4. Persist
    await prisma.$transaction(async (tx) => {
      await tx.questionValidation.create({
        data: {
          questionId: question.id,
          validatorPromptVersion: QUESTION_VALIDATION_PROMPT_VERSION,
          validatorModel: model,
          confidenceScore,
          isAnswerCorrect: data.isAnswerCorrect,
          isSupportedBySource: data.isSupportedBySource,
          hasSecondDefensibleAnswer: data.hasSecondDefensibleAnswer,
          isAmbiguous: data.isAmbiguous,
          isExplanationCorrect: data.isExplanationCorrect,
          isDifficultyAppropriate: data.isDifficultyAppropriate,
          respectsBoardStyle: data.respectsBoardStyle,
          respectsQuestionPlan: data.respectsQuestionPlan,
          distractorsPlausible: data.distractorsPlausible,
          usesExternalKnowledge: data.usesExternalKnowledge,
          sourceCoverageScore: data.sourceCoverageScore,
          clarityScore: data.clarityScore,
          qualityScore: data.qualityScore,
          issues: data.issues || [],
          reasoningSummary: data.reasoningSummary
        }
      });

      await tx.question.update({
        where: { id: question.id },
        data: { validationStatus: isApproved ? 'validated' : 'rejected' }
      });
    });

    return this.getResult(question.id);
  }

  private async rejectQuestion(questionId: string, reason: string) {
     await prisma.$transaction(async (tx) => {
       await tx.questionValidation.create({
         data: {
           questionId: questionId,
           validatorPromptVersion: 'DETERMINISTIC',
           validatorModel: 'SYSTEM',
           confidenceScore: 0.0,
           isAnswerCorrect: false,
           isSupportedBySource: false,
           hasSecondDefensibleAnswer: false,
           isAmbiguous: true,
           isExplanationCorrect: false,
           isDifficultyAppropriate: false,
           respectsBoardStyle: false,
           respectsQuestionPlan: false,
           distractorsPlausible: false,
           usesExternalKnowledge: false,
           sourceCoverageScore: 0.0,
           clarityScore: 0.0,
           qualityScore: 0.0,
           issues: [reason],
           reasoningSummary: 'Failed deterministic validation.'
         }
       });

       await tx.question.update({
         where: { id: questionId },
         data: { validationStatus: 'rejected' }
       });
     });
  }

  private async getResult(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        validations: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    if (!question) throw new Error("Question not found after processing");
    const lastVal = question.validations[0];

    return {
      questionId: question.id,
      validationStatus: question.validationStatus,
      confidenceScore: lastVal ? lastVal.confidenceScore : 0.0,
      issues: lastVal ? (lastVal.issues || []) : []
    };
  }
}
