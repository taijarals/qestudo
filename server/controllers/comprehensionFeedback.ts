import { Request, Response } from 'express';
import { ComprehensionFeedbackService } from '../services/ComprehensionFeedbackService';

const feedbackService = new ComprehensionFeedbackService();

export const comprehensionFeedbackController = {
  submit: async (req: Request, res: Response) => {
    try {
      const { answerId } = req.params;
      const { feedback } = req.body;
      
      if (!answerId || !feedback) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      if (!['understood', 'partial', 'not_understood'].includes(feedback)) {
        return res.status(400).json({ error: 'Invalid feedback value' });
      }

      const result = await feedbackService.registerFeedback({
        answerId: answerId as string,
        feedback
      });

      res.json(result);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'Feedback already exists for this answer') {
        return res.status(409).json({ error: e.message });
      }
      if (e.message === 'Answer not found') {
        return res.status(404).json({ error: e.message });
      }
      res.status(500).json({ error: e.message });
    }
  }
};
