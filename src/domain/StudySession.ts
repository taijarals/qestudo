import { StudySessionConfig } from './StudySessionConfig';

export type StudySessionStatus = 'active' | 'finished' | 'abandoned';

export interface StudySession {
  id: string;
  config: StudySessionConfig;
  questionIds: string[];
  currentQuestionIndex: number;
  startedAt: Date;
  finishedAt?: Date;
  status: StudySessionStatus;
}
