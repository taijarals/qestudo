import { SourceReference } from './SourceReference';
import { QuestionOption } from './QuestionOption';

export type BoardType = 'CEBRASPE' | 'FGV' | 'FCC';
export type QuestionType = 'certo-errado' | 'multipla-escolha';
export type DifficultyLevel = 'facil' | 'media' | 'dificil';
export type ValidationStatus = 'draft' | 'validated' | 'rejected';

export interface Question {
  id: string;
  materialId: string;
  conceptId: string;
  board: BoardType;
  type: QuestionType;
  difficulty: DifficultyLevel;
  cognitiveObjective: string;
  statement: string;
  options: QuestionOption[];
  explanation: string;
  trapType?: string;
  confidenceScore?: number;
  validationStatus: ValidationStatus;
  sourceReferences: SourceReference[];
}
