import { GoogleGenAI, GenerateContentConfig, Content } from '@google/genai';
import { prisma } from '../../database/prisma';

export interface GeminiCallParams {
  operation: 'concept_mapping' | 'question_generation' | 'question_validation' | 'question_batch_generation' | 'question_batch_validation' | 'question_escalation_validation';
  model: string;
  contents: Content[] | string;
  config?: GenerateContentConfig;
  materialId?: string;
  questionId?: string;
  batchId?: string;
}

export class GeminiClient {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateContent(params: GeminiCallParams) {
    const startedAt = new Date();
    let status = 'success';
    let errorType: string | null = null;
    let errorMessage: string | null = null;
    let promptTokens: number | null = null;
    let outputTokens: number | null = null;
    let totalTokens: number | null = null;

    let result;
    try {
      await this.checkLocalBudget(params);

      result = await this.ai.models.generateContent({
        model: params.model,
        contents: params.contents as any,
        config: params.config,
      });

      if (result.usageMetadata) {
        promptTokens = result.usageMetadata.promptTokenCount ?? null;
        outputTokens = result.usageMetadata.candidatesTokenCount ?? null;
        totalTokens = result.usageMetadata.totalTokenCount ?? null;
      }
    } catch (e: any) {
      status = 'failed';
      errorMessage = e.message;
      
      const msg = errorMessage ? errorMessage.toLowerCase() : '';
      if (e.type === 'local_ai_budget_exceeded') {
        errorType = 'local_ai_budget_exceeded';
        status = 'quota_exceeded';
      } else if (e.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
        status = 'quota_exceeded';
        errorType = 'quota_exceeded';
      } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
        status = 'rate_limited';
        errorType = 'rate_limited';
      } else if (e.status === 400 || msg.includes('400')) {
        errorType = 'invalid_request';
      } else if (e.status === 403 || e.status === 401) {
        errorType = 'authentication';
      } else {
        errorType = 'unknown';
      }

      throw e; 
    } finally {
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await prisma.aIUsage.create({
        data: {
          operation: params.operation,
          model: params.model,
          materialId: params.materialId,
          questionId: params.questionId,
          batchId: params.batchId,
          promptTokens,
          outputTokens,
          totalTokens,
          status,
          errorType,
          errorMessage,
          startedAt,
          completedAt,
          durationMs
        }
      });
    }

    return result;
  }

  private async checkLocalBudget(params: GeminiCallParams) {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'dailyTokenBudget' } });
    if (!config || !config.value) return;

    const budget = Number(config.value);
    if (isNaN(budget) || budget <= 0) return;

    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(now);
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const todayStart = new Date(`${year}-${month}-${day}T00:00:00.000-03:00`);

    const usageToday = await prisma.aIUsage.aggregate({
      where: {
        startedAt: { gte: todayStart },
        totalTokens: { not: null }
      },
      _sum: { totalTokens: true }
    });

    const used = usageToday._sum.totalTokens || 0;
    if (used >= budget) {
      const error: any = new Error("Limite local do QEstudo atingido para hoje.");
      error.status = 402;
      error.type = 'local_ai_budget_exceeded';
      throw error;
    }
  }
}

export const geminiClient = new GeminiClient();
