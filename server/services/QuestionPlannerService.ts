import { prisma } from '../database/prisma';
import { AnswerKeyPlanner } from './AnswerKeyPlanner';

export class QuestionPlannerService {
  private answerKeyPlanner: AnswerKeyPlanner;

  constructor() {
    this.answerKeyPlanner = new AnswerKeyPlanner();
  }

  async planQuestion(input: {
    materialId: string;
    conceptId: string;
    board: 'CEBRASPE' | 'FGV' | 'FCC';
    questionType: 'certo-errado' | 'multipla-escolha';
    difficulty: 'facil' | 'media' | 'dificil';
  }) {
    // 1. Validations
    const concept = await prisma.concept.findUnique({
      where: { id: input.conceptId },
      include: {
        sources: true,
        relationsSource: true,
      }
    });

    if (!concept) throw new Error('Concept not found');
    if (concept.materialId !== input.materialId) throw new Error('Concept does not belong to this material');
    if (concept.sources.length === 0) throw new Error('Concept has no associated sources');

    // 2. Select Sources
    const sourceChunkIds = concept.sources.map(s => s.materialChunkId);

    // 3. Define Objective and Trap Strategy
    let cognitiveObjective = 'understand';
    let trapStrategy = 'none';
    let confusedConceptId = null;

    if (input.difficulty === 'facil') {
      cognitiveObjective = 'recall';
    } else if (input.difficulty === 'media') {
      cognitiveObjective = 'differentiate';
    } else if (input.difficulty === 'dificil') {
      cognitiveObjective = 'apply';
    }

    // Try to find a confusable concept if difficulty is not facil
    if (input.difficulty !== 'facil' && concept.relationsSource && concept.relationsSource.length > 0) {
       const confusables = concept.relationsSource.filter(r => r.relationType === 'confusable');
       if (confusables.length > 0) {
          trapStrategy = 'confusable_concept';
          const chosenConfusable = confusables[Math.floor(Math.random() * confusables.length)];
          confusedConceptId = chosenConfusable.targetId;
       } else {
          trapStrategy = input.difficulty === 'dificil' ? 'exception_as_rule' : 'partial_truth';
       }
    } else if (input.difficulty === 'dificil') {
       trapStrategy = 'overgeneralization';
    }

    // CEBRASPE prefers certain traps
    if (input.board === 'CEBRASPE' && input.questionType === 'certo-errado') {
      const traps = ['definition_swap', 'partial_truth', 'overgeneralization'];
      if (trapStrategy === 'none') {
        trapStrategy = traps[Math.floor(Math.random() * traps.length)];
      }
    }

    // 4. Calculate Answer Key
    let targetCorrectPosition = null;
    let targetTrueFalse = null;

    if (input.questionType === 'multipla-escolha') {
       targetCorrectPosition = await this.answerKeyPlanner.getNextMultipleChoicePosition(input.materialId, input.board);
    } else if (input.questionType === 'certo-errado') {
       targetTrueFalse = await this.answerKeyPlanner.getNextTrueFalse(input.materialId, input.board);
    }

    // 5. Create Question Plan
    const plan = await prisma.questionPlan.create({
      data: {
        materialId: input.materialId,
        conceptId: input.conceptId,
        board: input.board,
        questionType: input.questionType,
        difficulty: input.difficulty,
        cognitiveObjective,
        targetCorrectPosition,
        targetTrueFalse,
        trapStrategy,
        confusedConceptId,
        sourceChunkIds,
        status: 'planned'
      }
    });

    return plan;
  }
}
