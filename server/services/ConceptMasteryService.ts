import { prisma } from '../database/prisma';

export class ConceptMasteryService {
  async updateMastery(params: {
    conceptId: string;
    isCorrect: boolean;
    responseType: string;
    difficulty?: string;
    timeSpent?: number;
    confusedConceptId?: string | null;
  }) {
    const { conceptId, isCorrect, responseType, difficulty, confusedConceptId: confusedWithConceptId } = params;
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
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

      // Calculate score changes
      let scoreDelta = 0;
      let difficultyMultiplier = 1.0;
      if (difficulty === 'dificil') difficultyMultiplier = 1.2;
      if (difficulty === 'facil') difficultyMultiplier = 0.8;

      if (isCorrect) {
        scoreDelta = 0.15 * difficultyMultiplier;
      } else if (responseType === 'dont_know') {
        scoreDelta = -0.20;
      } else {
        scoreDelta = -0.15 * (1 / difficultyMultiplier); // Penalize more if missed an easy question
      }

      let newScore = Math.max(0, Math.min(1, mastery.masteryScore + scoreDelta));

      // Calculate new intervals
      const intervals = [0, 1, 3, 7, 15, 30];
      let newInterval = mastery.currentReviewIntervalDays;
      let nextReview = mastery.nextReviewAt;

      if (isCorrect) {
        const currentIndex = intervals.indexOf(newInterval);
        const nextIndex = Math.min(currentIndex + 1, intervals.length - 1);
        newInterval = intervals[nextIndex];
        nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
      } else {
        newInterval = 0;
        nextReview = now; // needs immediate review
      }

      const totalAnswers = mastery.totalAnswers + 1;
      const consecutiveCorrect = isCorrect ? mastery.consecutiveCorrect + 1 : 0;
      const consecutiveWrong = !isCorrect ? mastery.consecutiveWrong + 1 : 0;
      
      // Determine new status
      let newStatus = 'learning';
      if (newScore >= 0.85 && totalAnswers >= 5 && consecutiveCorrect >= 2) {
        newStatus = 'mastered';
      } else if (newScore >= 0.65) {
        newStatus = 'consolidating';
      }

      const updateData = await tx.conceptMastery.update({
        where: { id: mastery.id },
        data: {
          masteryScore: newScore,
          status: newStatus,
          totalAnswers,
          correctAnswers: isCorrect ? mastery.correctAnswers + 1 : mastery.correctAnswers,
          wrongAnswers: (!isCorrect && responseType !== 'dont_know') ? mastery.wrongAnswers + 1 : mastery.wrongAnswers,
          dontKnowAnswers: responseType === 'dont_know' ? mastery.dontKnowAnswers + 1 : mastery.dontKnowAnswers,
          consecutiveCorrect,
          consecutiveWrong,
          lastAnsweredAt: now,
          lastCorrectAt: isCorrect ? now : mastery.lastCorrectAt,
          lastWrongAt: !isCorrect ? now : mastery.lastWrongAt,
          currentReviewIntervalDays: newInterval,
          nextReviewAt: nextReview
        }
      });

      // Handle confusion stat
      if (confusedWithConceptId && confusedWithConceptId !== conceptId) {
        const confusion = await tx.conceptConfusionStat.findUnique({
          where: {
            conceptId_confusedWithConceptId: {
              conceptId,
              confusedWithConceptId
            }
          }
        });

        if (confusion) {
          await tx.conceptConfusionStat.update({
            where: { id: confusion.id },
            data: {
              count: { increment: 1 },
              lastOccurredAt: now
            }
          });
        } else {
          await tx.conceptConfusionStat.create({
            data: {
              conceptId,
              confusedWithConceptId,
              count: 1,
              lastOccurredAt: now
            }
          });
        }
      }

      return updateData;
    });
  }
}
