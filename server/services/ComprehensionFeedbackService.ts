import { prisma } from '../database/prisma';

export class ComprehensionFeedbackService {
  async registerFeedback(params: {
    answerId: string;
    feedback: string;
  }) {
    const { answerId, feedback } = params;
    
    if (!['understood', 'partial', 'not_understood'].includes(feedback)) {
      throw new Error('Invalid feedback value');
    }

    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      // 1. Verify Answer exists
      const answer = await tx.answer.findUnique({
        where: { id: answerId },
        include: {
          session: true,
          question: true
        }
      });

      if (!answer) {
        throw new Error('Answer not found');
      }

      const conceptId = answer.question.conceptId;

      // 2. Prevent duplicate
      const existing = await tx.comprehensionFeedback.findUnique({
        where: { answerId }
      });

      if (existing) {
        throw new Error('Feedback already exists for this answer');
      }

      // 3. Create feedback
      const newFeedback = await tx.comprehensionFeedback.create({
        data: {
          answerId,
          conceptId,
          feedback
        }
      });

      // 4. Update ConceptMastery if a concept is associated
      if (conceptId) {
        let mastery = await tx.conceptMastery.findUnique({
          where: { conceptId }
        });

        if (!mastery) {
          mastery = await tx.conceptMastery.create({
            data: {
              conceptId,
              masteryScore: 0,
              status: 'learning'
            }
          });
        }

        // Adjust score based on feedback
        let scoreDelta = 0;
        let newStatus = mastery.status;
        let newInterval = mastery.currentReviewIntervalDays;
        let nextReview = mastery.nextReviewAt;

        if (feedback === 'understood') {
          scoreDelta = 0.03;
        } else if (feedback === 'partial') {
          scoreDelta = -0.02;
        } else if (feedback === 'not_understood') {
          scoreDelta = -0.08;
          // Anticipate review if they didn't understand
          nextReview = now; 
          newInterval = 0;
          
          if (mastery.status === 'mastered') {
            newStatus = 'review_needed';
          } else if (mastery.status === 'consolidating') {
             newStatus = 'learning';
          }
        }

        const newScore = Math.max(0, Math.min(1, mastery.masteryScore + scoreDelta));

        await tx.conceptMastery.update({
          where: { id: mastery.id },
          data: {
            masteryScore: newScore,
            status: newStatus,
            nextReviewAt: nextReview,
            currentReviewIntervalDays: newInterval,
            understoodCount: feedback === 'understood' ? mastery.understoodCount + 1 : mastery.understoodCount,
            partialUnderstandingCount: feedback === 'partial' ? mastery.partialUnderstandingCount + 1 : mastery.partialUnderstandingCount,
            notUnderstoodCount: feedback === 'not_understood' ? mastery.notUnderstoodCount + 1 : mastery.notUnderstoodCount,
            lastComprehensionFeedback: feedback,
            lastComprehensionAt: now
          }
        });
      }

      return newFeedback;
    });
  }
}
