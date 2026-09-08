export type MaterialStatus = 'uploaded' | 'extracting' | 'chunking' | 'ready_for_mapping' | 'mapping_concepts' | 'ready' | 'error' | 'mapping_error';

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
