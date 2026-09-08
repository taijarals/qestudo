import { Request, Response } from 'express';
import { MaterialService } from '../services/MaterialService';

export const materialController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getAll();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getConcepts: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getConcepts(req.params.id);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getQuestions: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getQuestions(req.params.id);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
