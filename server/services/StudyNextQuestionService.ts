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

    // Get recently used concepts in this session to avoid immediate repetition
    // (We'll check the last 3 questions)
    const sortedAnswers = [...session.answers].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentAnswers = sortedAnswers.slice(0, 3);
    const recentConceptIds = recentAnswers.map(a => a.question.conceptId).filter(id => id !== null) as string[];
    
    // Choose the target concept
    const target = await this.engine.selectTarget({
      materialIds: session.materialIds,
      conceptIds: session.conceptIds && session.conceptIds.length > 0 ? session.conceptIds : undefined,
      recentConceptIds
    });

    // We can also exclude questions already answered in this session
    const excludeQuestionIds = session.answers.map(a => a.questionId);

    // Call Provider to get the question
    const board = session.boards[0] || 'CEBRASPE'; // assuming session has at least one
    const questionType = session.questionTypes[0] || 'multipla-escolha';

    const questionDto = await this.provider.provideQuestion({
      materialId: session.materialIds[0], // MVP simplification: just use the first materialId
      conceptId: target.conceptId,
      board: board,
      questionType: questionType,
      difficulty: target.difficulty,
      excludeQuestionIds
    });

    // Update Session with the new question ID if not already in the array
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
