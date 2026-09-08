import { Request, Response } from 'express';
import { QuestionService } from '../services/QuestionService';

export const questionController = {
  getById: async (req: Request, res: Response) => {
    try {
      const data = await QuestionService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
