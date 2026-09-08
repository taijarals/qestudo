import { Request, Response } from 'express';
import { ConceptService } from '../services/ConceptService';

export const conceptController = {
  getQuestions: async (req: Request, res: Response) => {
    try {
      const data = await ConceptService.getQuestions(req.params.id as string);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getMastery: async (req: Request, res: Response) => {
    try {
      const data = await ConceptService.getMastery(req.params.id as string);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  updateMastery: async (req: Request, res: Response) => {
    try {
      const data = await ConceptService.updateMastery(req.params.id as string, req.body);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
