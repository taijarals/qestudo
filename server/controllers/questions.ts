import { Request, Response } from 'express';
import { QuestionGeneratorService } from '../services/QuestionGeneratorService';
import { prisma } from '../database/prisma';

const generatorService = new QuestionGeneratorService();

export const questionController = {
  generate: async (req: Request, res: Response) => {
    try {
      const planId = req.params.planId as string;
      const question = await generatorService.generateQuestion(planId);
      res.json(question);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const question = await prisma.question.findUnique({
        where: { id: req.params.id as string },
        include: {
          options: true,
          sourceReferences: true
        }
      });
      if (!question) return res.status(404).json({ error: 'Not found' });
      res.json(question);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
