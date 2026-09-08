import { Request, Response } from 'express';
import { StudySessionService } from '../services/StudySessionService';

export const studySessionController = {
  create: async (req: Request, res: Response) => {
    try {
      const data = await StudySessionService.create(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const data = await StudySessionService.update(req.params.id, req.body);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getAnswers: async (req: Request, res: Response) => {
    try {
      const data = await StudySessionService.getAnswers(req.params.id);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  submitAnswer: async (req: Request, res: Response) => {
    try {
      const data = await StudySessionService.submitAnswer(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
