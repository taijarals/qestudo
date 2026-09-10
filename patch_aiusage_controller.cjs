const fs = require('fs');

const code = `import { Request, Response } from 'express';
import { prisma } from '../database/prisma';

export const aiUsageController = {
  getSummary: async (req: Request, res: Response) => {
    try {
      const period = req.query.period as string || 'today';
      let startDate = new Date(0); // all
      
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' });
      const parts = formatter.formatToParts(now);
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      const year = parts.find(p => p.type === 'year')?.value;
      
      if (period === 'today') {
        startDate = new Date(\`\${year}-\${month}-\${day}T00:00:00.000-03:00\`);
      } else if (period === '7d') {
        const d = new Date(\`\${year}-\${month}-\${day}T00:00:00.000-03:00\`);
        d.setDate(d.getDate() - 7);
        startDate = d;
      } else if (period === '30d') {
        const d = new Date(\`\${year}-\${month}-\${day}T00:00:00.000-03:00\`);
        d.setDate(d.getDate() - 30);
        startDate = d;
      }

      const usageData = await prisma.aIUsage.findMany({
        where: { createdAt: { gte: startDate } }
      });

      const summary = {
        calls: usageData.length,
        successfulCalls: 0,
        failedCalls: 0,
        promptTokens: null as number | null,
        outputTokens: null as number | null,
        totalTokens: null as number | null,
        hasMissingTokenData: false,
        operations: {
          concept_mapping: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_generation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_validation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null }
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
        
        if (u.promptTokens !== null) {
          summary.promptTokens = (summary.promptTokens || 0) + u.promptTokens;
        }
        if (u.outputTokens !== null) {
          summary.outputTokens = (summary.outputTokens || 0) + u.outputTokens;
        }
        if (u.totalTokens !== null) {
          summary.totalTokens = (summary.totalTokens || 0) + u.totalTokens;
        } else {
          summary.hasMissingTokenData = true;
        }

        const opKey = u.operation as keyof typeof summary.operations;
        if (summary.operations[opKey]) {
           summary.operations[opKey].calls++;
           if (u.status === 'success') {
             summary.operations[opKey].successfulCalls++;
           } else {
             summary.operations[opKey].failedCalls++;
           }
           if (u.totalTokens !== null) {
             summary.operations[opKey].totalTokens = (summary.operations[opKey].totalTokens || 0) + u.totalTokens;
           }
        }
      });

      // Count validated questions in the same period
      summary.validatedQuestions = await prisma.question.count({
        where: { validationStatus: 'validated', generatedAt: { gte: startDate } }
      });

      if (summary.validatedQuestions > 0 && summary.totalTokens !== null) {
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
`;

fs.writeFileSync('server/controllers/aiUsage.ts', code);
