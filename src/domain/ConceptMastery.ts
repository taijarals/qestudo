export type MasteryStatus = 'not_seen' | 'learning' | 'consolidating' | 'mastered' | 'review_needed';

export interface ConceptMastery {
  conceptId: string;
  masteryScore: number;
  status: MasteryStatus;
  correctAnswers: number;
  wrongAnswers: number;
  lastSeenAt?: Date;
  nextReviewAt?: Date;
}
