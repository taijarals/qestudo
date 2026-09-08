export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  position: number;
  isCorrect: boolean;
  errorType?: string;
  confusedConceptId?: string;
  explanation?: string;
}
