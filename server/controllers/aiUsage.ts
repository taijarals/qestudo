import { Request, Response } from 'express';
import { prisma } from '../database/prisma';

export const aiUsageController = {
  getSummary: async (req: Request, res: Response) => {
    try {
      const period = req.query.period as string || 'today';
      let startDate = new Date(0); // all
      
      if (period === 'today') {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
      } else if (period === '7d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }

      const usageData = await prisma.aIUsage.findMany({
        where: { createdAt: { gte: startDate } }
      });

      const summary = {
        calls: usageData.length,
        successfulCalls: 0,
        failedCalls: 0,
        promptTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        operations: {
          concept_mapping: { calls: 0, totalTokens: 0 },
          question_generation: { calls: 0, totalTokens: 0 },
          question_validation: { calls: 0, totalTokens: 0 }
        },
        validatedQuestions: 0,
        tokensPerValidatedQuestion: 0
      };

      usageData.forEach(u => {
        if (u.status === 'success') {
          summary.successfulCalls++;
        } else {
          summary.failedCalls++;
        }
        
        summary.promptTokens += (u.promptTokens || 0);
        summary.outputTokens += (u.outputTokens || 0);
        summary.totalTokens += (u.totalTokens || 0);

        if (summary.operations[u.operation as keyof typeof summary.operations]) {
           summary.operations[u.operation as keyof typeof summary.operations].calls++;
           summary.operations[u.operation as keyof typeof summary.operations].totalTokens += (u.totalTokens || 0);
        }
      });

      // Count validated questions in the same period
      summary.validatedQuestions = await prisma.question.count({
        where: { validationStatus: 'validated', generatedAt: { gte: startDate } }
      });

      if (summary.validatedQuestions > 0) {
        summary.tokensPerValidatedQuestion = Math.round(summary.totalTokens / summary.validatedQuestions);
      }

      res.json(summary);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getHistory: async (req: Request, res: Response) => {
    try {
      const history = await prisma.aIUsage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      res.json(history);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getBatchStats: async (req: Request, res: Response) => {
    try {
      const batchId = req.params.batchId as string;
      const batch = await prisma.questionBatch.findUnique({ where: { id: batchId } });
      if (!batch) return res.status(404).json({ error: 'not_found' });

      const usage = await prisma.aIUsage.findMany({ where: { batchId } });
      
      let promptTokens = 0;
      let outputTokens = 0;
      let totalTokens = 0;

      usage.forEach(u => {
        promptTokens += (u.promptTokens || 0);
        outputTokens += (u.outputTokens || 0);
        totalTokens += (u.totalTokens || 0);
      });

      res.json({
        requested: batch.requestedQuantity,
        validated: batch.validatedCount,
        aiCalls: usage.length,
        promptTokens,
        outputTokens,
        totalTokens
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  }
};
