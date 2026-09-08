import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { QuestionPlannerService } from '../services/QuestionPlannerService';

const plannerService = new QuestionPlannerService();

export const questionPlanController = {
  create: async (req: Request, res: Response) => {
    try {
      const { materialId, conceptId, board, questionType, difficulty } = req.body;
      
      if (!materialId || !conceptId || !board || !questionType || !difficulty) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const plan = await plannerService.planQuestion({
        materialId,
        conceptId,
        board: board as 'CEBRASPE' | 'FGV' | 'FCC',
        questionType: questionType as 'certo-errado' | 'multipla-escolha',
        difficulty: difficulty as 'facil' | 'media' | 'dificil'
      });

      res.json(plan);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const plan = await prisma.questionPlan.findUnique({
        where: { id: req.params.id as string },
        include: {
           concept: { select: { name: true } }
        }
      });
      if (!plan) return res.status(404).json({ error: 'Not found' });
      res.json(plan);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getByConcept: async (req: Request, res: Response) => {
    try {
      const plans = await prisma.questionPlan.findMany({
        where: { conceptId: req.params.id as string },
        orderBy: { createdAt: 'desc' }
      });
      res.json(plans);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
