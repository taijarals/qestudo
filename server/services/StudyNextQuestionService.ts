import { prisma } from '../database/prisma';
import { AdaptiveStudyEngine } from './AdaptiveStudyEngine';
import { QuestionProviderService } from './QuestionProviderService';

export class StudyNextQuestionService {
  private engine: AdaptiveStudyEngine;
  private provider: QuestionProviderService;

  constructor() {
    this.engine = new AdaptiveStudyEngine();
    this.provider = new QuestionProviderService();
  }

  async getNextQuestion(sessionId: string) {
    const session = await prisma.studySession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    if (session.currentQuestionIndex >= session.quantity) {
       throw new Error('Session is already complete');
    }

    // 1. Check for pending question (already assigned to session but no answer yet)
    const answeredIds = session.answers.map(a => a.questionId);
    const pendingId = session.questionIds.find(id => !answeredIds.includes(id));

    if (pendingId) {
       const pendingQuestion = await prisma.question.findUnique({
         where: { id: pendingId },
         include: { options: { orderBy: { position: 'asc' } } }
       });

       if (pendingQuestion) {
          return {
            question: {
              id: pendingQuestion.id,
              statement: pendingQuestion.statement,
              board: pendingQuestion.board,
              type: pendingQuestion.type,
              difficulty: pendingQuestion.difficulty,
              conceptId: pendingQuestion.conceptId,
              options: pendingQuestion.options.map(o => ({
                id: o.id,
                text: o.text,
                position: o.position
              }))
            },
            adaptiveMetadata: {
              category: 'pending',
              difficulty: pendingQuestion.difficulty,
              reason: 'pending_question',
              masteryScore: 0
            }
          };
       }
    }

    // 2. No pending question, select next concept
    const sortedAnswers = [...session.answers].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentAnswers = sortedAnswers.slice(0, 3);
    const recentConceptIds = recentAnswers.map(a => a.question.conceptId).filter(id => id !== null) as string[];
    
    // Choose the target concept
    const target = await this.engine.selectTarget({
      materialIds: session.materialIds,
      conceptIds: session.conceptIds && session.conceptIds.length > 0 ? session.conceptIds : undefined,
      recentConceptIds
    });

    // Validate that the returned material is within the session's scope
    if (!session.materialIds.includes(target.materialId)) {
       throw new Error(`Adaptive engine selected material ${target.materialId} which is outside session scope.`);
    }

    // Call Provider to get the question
    const board = session.boards[0] || 'CEBRASPE'; // assuming session has at least one
    const questionType = session.questionTypes[0] || 'multipla-escolha';

    const questionDto = await this.provider.provideQuestion({
      materialId: target.materialId, // Correctly use the target's materialId
      conceptId: target.conceptId,
      board: board,
      questionType: questionType,
      difficulty: target.difficulty,
      excludeQuestionIds: session.questionIds // exclude all generated/answered questions
    });

    // Update Session with the new question ID
    if (!session.questionIds.includes(questionDto.id)) {
       await prisma.studySession.update({
         where: { id: sessionId },
         data: {
           questionIds: { push: questionDto.id }
         }
       });
    }

    return {
      question: questionDto,
      adaptiveMetadata: {
        category: target.category,
        difficulty: target.difficulty,
        reason: target.reason,
        masteryScore: target.masteryScore
      }
    };
  }
}
