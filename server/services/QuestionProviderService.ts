
import { prisma } from '../database/prisma';
import { QuestionPlannerService } from './QuestionPlannerService';
import { QuestionGeneratorService } from './QuestionGeneratorService';
import { QuestionValidatorService } from './QuestionValidatorService';

export class QuestionProviderService {
  private planner: QuestionPlannerService;
  private generator: QuestionGeneratorService;
  private validator: QuestionValidatorService;

  constructor() {
    this.planner = new QuestionPlannerService();
    this.generator = new QuestionGeneratorService();
    this.validator = new QuestionValidatorService();
  }

  async provideQuestion(params: {
    materialId: string;
    conceptId?: string;
    board: string;
    questionType: string;
    difficulty: string;
    excludeQuestionIds?: string[];
  }) {
    // 1. Find existing validated question
    const whereClause: any = {
      materialId: params.materialId,
      board: params.board,
      type: params.questionType,
      difficulty: params.difficulty,
      validationStatus: 'validated',
    };
    
    if (params.conceptId) {
      whereClause.conceptId = params.conceptId;
    }
    
    if (params.excludeQuestionIds && params.excludeQuestionIds.length > 0) {
      whereClause.id = { notIn: params.excludeQuestionIds };
    }

    const existingQuestions = await prisma.question.findMany({
      where: whereClause,
      include: {
        options: { orderBy: { position: 'asc' } },
        concept: true,
      },
      orderBy: [
        { usageCount: 'asc' },
        { lastUsedAt: 'asc' }
      ],
      take: 5
    });

    let selectedQuestion = null;

    if (existingQuestions.length > 0) {
      selectedQuestion = existingQuestions[Math.floor(Math.random() * existingQuestions.length)];
    } else {
      // 2. Generate on demand
      if (!params.conceptId) {
        throw new Error('conceptId is required to generate new questions');
      }

      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const plan = await this.planner.planQuestion({
            materialId: params.materialId,
            conceptId: params.conceptId,
            board: params.board as 'CEBRASPE' | 'FGV' | 'FCC',
            questionType: params.questionType as 'certo-errado' | 'multipla-escolha',
            difficulty: params.difficulty as 'facil' | 'media' | 'dificil'
          });

          const question = await this.generator.generateQuestion(plan.id);
          const validationResult = await this.validator.validateQuestion(question?.id || '');

          if (validationResult.validationStatus === 'validated') {
             selectedQuestion = await prisma.question.findUnique({
               where: { id: question!.id },
               include: {
                 options: { orderBy: { position: 'asc' } },
                 concept: true,
               }
             });
             break;
          }
        } catch (e: any) {
           console.error('Attempt ' + attempts + ' failed: ' + e.message);
        }
      }
      
      if (!selectedQuestion) {
         throw new Error('question_generation_failed');
      }
    }

    // Update usage stats
    await prisma.question.update({
      where: { id: selectedQuestion.id },
      data: { 
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    // 3. Return StudyQuestionDTO
    return {
      id: selectedQuestion.id,
      statement: selectedQuestion.statement,
      board: selectedQuestion.board,
      type: selectedQuestion.type,
      difficulty: selectedQuestion.difficulty,
      conceptId: selectedQuestion.conceptId,
      options: selectedQuestion.options.map(o => ({
        id: o.id,
        text: o.text,
        position: o.position
      }))
    };
  }
}
