import { Type, Schema } from '@google/genai';
import { geminiClient } from './ai/GeminiClient';
import { prisma } from '../database/prisma';
import { questionBatchValidationPrompt, QUESTION_BATCH_VALIDATION_PROMPT_VERSION } from '../ai/prompts/questionBatchValidationPrompt';
import { getGeminiModel } from '../config/gemini';

export class QuestionBatchValidatorService {
  
  // Local Deterministic Validator
  deterministicValidation(question: any): boolean {
    if (!question.statement || question.statement.trim() === '') return false;
    if (!question.explanation || question.explanation.trim() === '') return false;
    if (!question.sourceReferences || question.sourceReferences.length === 0) return false;
    
    if (question.type === 'multipla-escolha') {
      if (!question.options || question.options.length !== 5) return false;
      const corrects = question.options.filter((o: any) => o.isCorrect);
      if (corrects.length !== 1) return false;
      
      const texts = new Set(question.options.map((o: any) => o.text.trim()));
      if (texts.size !== 5) return false; // duplicidades
    } else if (question.type === 'certo-errado') {
      if (!question.options || question.options.length !== 2) return false;
      const corrects = question.options.filter((o: any) => o.isCorrect);
      if (corrects.length !== 1) return false;
    }
    
    return true;
  }

  async validateBatch(questionIds: string[], batchId?: string, escalation: boolean = false) {
    if (questionIds.length === 0) return [];
    if (questionIds.length > 5) throw new Error('Maximum 5 questions per batch');

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: {
        options: true,
        sourceReferences: true,
        concept: true
      }
    });

    if (questions.length === 0) return [];

    // All must be deterministic validated first
    const validQuestions = questions.filter(q => this.deterministicValidation(q));
    
    for (const q of questions) {
      if (!validQuestions.find(vq => vq.id === q.id)) {
        await prisma.questionValidation.create({
          data: {
            questionId: q.id,
            
                        validatorPromptVersion: 'DETERMINISTIC',
            validatorModel: 'SYSTEM',
            confidenceScore: 0,
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
            sourceCoverageScore: 0,
            clarityScore: 0,
            qualityScore: 0,
            reasoningSummary: 'Falha na validação estrutural/determinística.',
            
          }
        });
        await prisma.question.update({ where: { id: q.id }, data: { validationStatus: 'rejected' } });
      }
    }

    if (validQuestions.length === 0) return [];

    const allChunkIds = new Set<string>();
    validQuestions.forEach(q => q.sourceReferences.forEach(sr => allChunkIds.add(sr.chunkId)));

    const chunks = await prisma.materialChunk.findMany({
      where: { id: { in: Array.from(allChunkIds) } }
    });
    const chunksText = chunks.map(c => `[Chunk: ${c.id}]\n${c.text}`).join('\n\n');

    let promptComplement = "QUESTÕES A VALIDAR:\n\n";
    validQuestions.forEach((q, i) => {
      promptComplement += `--- QUESTÃO ${i + 1} ---\n`;
      promptComplement += `ID: ${q.id}\n`;
      promptComplement += `Enunciado: ${q.statement}\n`;
      if (q.type === 'multipla-escolha') {
        const sortedOptions = [...q.options].sort((a, b) => a.position - b.position);
        sortedOptions.forEach(o => {
          promptComplement += `Opção ${['A','B','C','D','E'][o.position]}: ${o.text} (${o.isCorrect ? 'Gabarito' : 'Distrator'})\n`;
        });
      } else {
        const correctOpt = q.options.find(o => o.isCorrect);
        promptComplement += `Gabarito: ${correctOpt?.text}\n`;
      }
      promptComplement += `Explicação: ${q.explanation}\n`;
      promptComplement += `Fontes Base: ${q.sourceReferences.map(sr => sr.chunkId).join(', ')}\n\n`;
    });

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        validations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionId: { type: Type.STRING },
              isAnswerCorrect: { type: Type.BOOLEAN },
              qualityScore: { type: Type.NUMBER },
              isSupportedBySource: { type: Type.BOOLEAN },
              hasSecondDefensibleAnswer: { type: Type.BOOLEAN },
              isAmbiguous: { type: Type.BOOLEAN },
              isExplanationCorrect: { type: Type.BOOLEAN },
              isDifficultyAppropriate: { type: Type.BOOLEAN },
              respectsBoardStyle: { type: Type.BOOLEAN },
              respectsQuestionPlan: { type: Type.BOOLEAN },
              distractorsPlausible: { type: Type.BOOLEAN },
              usesExternalKnowledge: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING },
              improvementSuggestion: { type: Type.STRING }
            },
            required: ['questionId', 'isAnswerCorrect', 'qualityScore', 'isSupportedBySource', 'hasSecondDefensibleAnswer', 'isAmbiguous', 'isExplanationCorrect', 'isDifficultyAppropriate', 'respectsBoardStyle', 'respectsQuestionPlan', 'distractorsPlausible', 'usesExternalKnowledge', 'feedback']
          }
        }
      },
      required: ['validations']
    };

    const fullPrompt = `${questionBatchValidationPrompt}\n\nMATERIAL CHUNKS:\n${chunksText}\n\n${promptComplement}`;
    
    // Config: primary or escalation
    let model = getGeminiModel();
    if (escalation) {
       model = process.env.GEMINI_ESCALATION_MODEL || model; // fallback to primary if not set
    }
    
    const response = await geminiClient.generateContent({
      operation: escalation ? 'question_escalation_validation' : 'question_batch_validation', 
      model: model,
      contents: fullPrompt,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      },
      materialId: validQuestions[0].materialId, 
      batchId 
    });

    const resultText = response.text;
    if (!resultText) throw new Error('No text returned from Gemini');
    const data = JSON.parse(resultText);

    if (!data.validations || !Array.isArray(data.validations)) {
      throw new Error('Invalid response structure');
    }

    const validatedResults = [];

    for (const vData of data.validations) {
      const q = validQuestions.find(vq => vq.id === vData.questionId);
      if (!q) continue;

      let finalScore = vData.qualityScore || 0;
      let isApproved = vData.isAnswerCorrect && finalScore >= 0.7; // arbitrary threshold

      const validation = await prisma.questionValidation.create({
        data: {
          questionId: q.id,
          
                    validatorPromptVersion: QUESTION_BATCH_VALIDATION_PROMPT_VERSION,
          validatorModel: model,
          confidenceScore: finalScore,
          isAnswerCorrect: vData.isAnswerCorrect,
          isSupportedBySource: vData.isSupportedBySource,
          hasSecondDefensibleAnswer: vData.hasSecondDefensibleAnswer,
          isAmbiguous: vData.isAmbiguous,
          isExplanationCorrect: vData.isExplanationCorrect,
          isDifficultyAppropriate: vData.isDifficultyAppropriate,
          respectsBoardStyle: vData.respectsBoardStyle,
          respectsQuestionPlan: vData.respectsQuestionPlan,
          distractorsPlausible: vData.distractorsPlausible,
          usesExternalKnowledge: vData.usesExternalKnowledge,
          sourceCoverageScore: 0,
          clarityScore: 0,
          qualityScore: vData.qualityScore,
          reasoningSummary: vData.feedback,
          
          
        }
      });

      await prisma.question.update({
        where: { id: q.id },
        data: { validationStatus: isApproved ? 'validated' : 'rejected' }
      });

      validatedResults.push({ question: q, validation, isApproved });
    }

    return validatedResults;
  }
}
