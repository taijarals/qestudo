import { Request, Response } from 'express';
import { QuestionProviderService } from '../services/QuestionProviderService';

const providerService = new QuestionProviderService();

export const questionProviderController = {
  provide: async (req: Request, res: Response) => {
    try {
      const { materialId, conceptId, board, questionType, difficulty, excludeQuestionIds } = req.body;
      
      if (!materialId || !board || !questionType || !difficulty) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const dto = await providerService.provideQuestion({
        materialId,
        conceptId,
        board,
        questionType,
        difficulty,
        excludeQuestionIds
      });

      res.json(dto);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'question_generation_failed') {
        return res.status(503).json({ error: 'Failed to generate a valid question after 3 attempts' });
      }
      res.status(500).json({ error: e.message });
    }
  }
};
