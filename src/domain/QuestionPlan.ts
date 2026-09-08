import { BoardType, QuestionType, DifficultyLevel } from './Question';
import { SourceReference } from './SourceReference';

export interface QuestionPlan {
  conceptId: string;
  materialId: string;
  board: BoardType;
  type: QuestionType;
  difficulty: DifficultyLevel;
  cognitiveObjective: string;
  desiredAnswer: string;
  distractorStrategy?: string;
  sourceReferences: SourceReference[];
}
