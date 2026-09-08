import { Request, Response } from 'express';
import { prisma } from '../database/prisma';

export const answersController = {
  submit: async (req: Request, res: Response) => {
    try {
      const { sessionId, questionId, selectedOptionId, responseType } = req.body;
      
      if (!sessionId || !questionId || !responseType) {
         return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true, sourceReferences: true }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      let isCorrect = false;
      let correctOptionId = null;
      let selectedErrorType = null;
      let confusedConceptId = null;

      const correctOption = question.options.find(o => o.isCorrect);
      if (correctOption) {
        correctOptionId = correctOption.id;
      }

      if (responseType === 'dont_know') {
         isCorrect = false;
      } else {
         if (selectedOptionId) {
            const chosen = question.options.find(o => o.id === selectedOptionId);
            if (chosen) {
               isCorrect = chosen.isCorrect;
               selectedErrorType = chosen.errorType;
               confusedConceptId = chosen.confusedConceptId;
            }
         }
      }

      // Persist answer
      await prisma.answer.create({
        data: {
          sessionId,
          questionId,
          responseType,
          isCorrect,
          timeSpent: req.body.timeSpent || 0
        }
      });

      // Prepare feedback DTO
      const resultDto = {
        questionId,
        isCorrect,
        correctOptionId,
        explanation: correctOption?.explanation || question.explanation, // Fallback to question explanation
        sourceReferences: question.sourceReferences,
        selectedErrorType,
        confusedConceptId
      };

      res.json(resultDto);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  }
};
