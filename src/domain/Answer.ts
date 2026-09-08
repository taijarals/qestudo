export type ResponseType = 'answered' | 'dont_know';
export type UnderstandingFeedback = 'understood' | 'partial' | 'not_understood';

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptionId?: string;
  responseType: ResponseType;
  isCorrect: boolean;
  responseTimeMs?: number;
  answeredAt: Date;
  understandingFeedback?: UnderstandingFeedback;
}
