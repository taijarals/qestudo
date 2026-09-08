export type MaterialStatus = 'uploaded' | 'extracting' | 'mapping_concepts' | 'ready' | 'error';

export interface Material {
  id: string;
  title: string;
  fileName: string;
  status: MaterialStatus;
  processingProgress: number;
  studyCoverage: number;
  masteryScore: number | null;
  conceptCount: number;
  questionCount: number;
  pageCount?: number;
}
