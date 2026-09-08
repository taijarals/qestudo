import { BoardType, QuestionType } from './Question';

export type StudyMode = 'adaptive' | 'specific' | 'random' | 'review';

export interface StudySessionConfig {
  subjectId?: string;
  materialIds: string[];
  boards: BoardType[];
  questionTypes: QuestionType[];
  quantity: number;
  mode: StudyMode;
  conceptIds?: string[];
}
