import { prisma } from '../database/prisma';

export class AnswerKeyPlanner {
  
  async getNextMultipleChoicePosition(materialId: string, board: string): Promise<number> {
    const recentPlans = await prisma.questionPlan.findMany({
      where: {
        materialId,
        board,
        questionType: 'multipla-escolha',
        targetCorrectPosition: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const positions = recentPlans.map(p => p.targetCorrectPosition as number);
    return this.computeNextMultipleChoice(positions);
  }

  async getNextTrueFalse(materialId: string, board: string): Promise<boolean> {
    const recentPlans = await prisma.questionPlan.findMany({
      where: {
        materialId,
        board,
        questionType: 'certo-errado',
        targetTrueFalse: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const answers = recentPlans.map(p => p.targetTrueFalse as boolean);
    return this.computeNextTrueFalse(answers);
  }

  computeNextMultipleChoice(recentPositions: number[]): number {
    const counts = [0, 0, 0, 0, 0];
    for (const pos of recentPositions) {
      if (pos >= 0 && pos <= 4) counts[pos]++;
    }

    const minCount = Math.min(...counts);
    const candidates = counts
      .map((c, i) => c === minCount ? i : -1)
      .filter(i => i !== -1);

    let validCandidates = candidates;
    if (recentPositions.length > 0 && validCandidates.length > 1) {
      validCandidates = validCandidates.filter(c => c !== recentPositions[0]);
    }
    
    const chosen = validCandidates[Math.floor(Math.random() * validCandidates.length)];
    return chosen !== undefined ? chosen : Math.floor(Math.random() * 5);
  }

  computeNextTrueFalse(recentAnswers: boolean[]): boolean {
    let trueCount = 0;
    let falseCount = 0;
    
    for (const ans of recentAnswers) {
      if (ans === true) trueCount++;
      else falseCount++;
    }

    if (trueCount < falseCount - 2) return true;
    if (falseCount < trueCount - 2) return false;

    if (recentAnswers.length >= 3) {
      if (recentAnswers[0] !== recentAnswers[1] && recentAnswers[1] !== recentAnswers[2]) {
        if (recentAnswers.length < 4 || recentAnswers[2] !== recentAnswers[3]) {
            if (Math.random() > 0.3) {
                return recentAnswers[0];
            }
        }
      }
      
      if (recentAnswers[0] === recentAnswers[1] && recentAnswers[1] === recentAnswers[2]) {
        return !recentAnswers[0];
      }
    }

    return Math.random() < 0.5;
  }
}
