import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { ConceptMasteryService } from '../services/ConceptMasteryService';
const masteryService = new ConceptMasteryService();

export const answersController = {
  submit: async (req: Request, res: Response) => {
    try {
      const { sessionId, questionId, selectedOptionId, responseType } = req.body;
      
      if (!sessionId || !questionId || !responseType) {
         return res.status(400).json({ error: 'Missing required parameters' });
      }

      if (responseType !== 'answered' && responseType !== 'dont_know') {
         return res.status(400).json({ error: 'Invalid responseType' });
      }

      if (responseType === 'answered' && !selectedOptionId) {
         return res.status(400).json({ error: 'selectedOptionId is required when responseType is answered' });
      }

      if (responseType === 'dont_know' && selectedOptionId) {
         return res.status(400).json({ error: 'selectedOptionId must not be provided when responseType is dont_know' });
      }

      // Check duplicate
      const existingAnswer = await prisma.answer.findUnique({
        where: {
          sessionId_questionId: {
             sessionId,
             questionId
          }
        }
      });
      if (existingAnswer) {
         return res.status(409).json({ error: 'Question already answered in this session' });
      }

      const session = await prisma.studySession.findUnique({
         where: { id: sessionId }
      });

      if (!session) {
         return res.status(404).json({ error: 'Session not found' });
      }

      if (!session.questionIds.includes(questionId)) {
         return res.status(403).json({ error: 'Question does not belong to this session' });
      }
      
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true, sourceReferences: true }
      });

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      if (question.validationStatus !== 'validated') {
         return res.status(403).json({ error: 'Question is not validated' });
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
         const chosen = question.options.find(o => o.id === selectedOptionId);
         if (!chosen) {
            return res.status(400).json({ error: 'Option does not belong to this question' });
         }
         isCorrect = chosen.isCorrect;
         selectedErrorType = chosen.errorType;
         confusedConceptId = chosen.confusedConceptId;
      }

      // Persist answer and update session atomically
      const now = new Date();
      let finalAnswerId = '';
      await prisma.$transaction(async (tx) => {
        await tx.answer.create({
          data: {
            sessionId,
            questionId,
            selectedOptionId: responseType === 'dont_know' ? null : selectedOptionId,
            responseType,
            isCorrect,
            timeSpent: req.body.timeSpent || 0
          }
        });

        // Increment currentQuestionIndex
        let localAnswerId = '';
        const newAnswer = await tx.answer.findUnique({ where: { sessionId_questionId: { sessionId, questionId } } });
        if (newAnswer) finalAnswerId = newAnswer.id;
        const updatedSession = await tx.studySession.update({
          where: { id: sessionId },
          data: {
            currentQuestionIndex: { increment: 1 }
          }
        });

        // If threshold reached, auto-finish the session
        if (updatedSession.currentQuestionIndex >= updatedSession.quantity && updatedSession.status !== 'finished') {
           await tx.studySession.update({
             where: { id: sessionId },
             data: {
               status: 'finished',
               finishedAt: now
             }
           });
        }
      });

      
      // Update Concept Mastery
      await masteryService.updateMastery({
        conceptId: question.conceptId,
        isCorrect,
        responseType,
        difficulty: question.difficulty,
        timeSpent: req.body.timeSpent || 0,
        confusedConceptId
      });

      // Prepare feedback DTO
      const resultDto = {
        answerId: finalAnswerId || null,
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
