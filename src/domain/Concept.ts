export interface Concept {
  id: string;
  materialId: string;
  parentId?: string;
  name: string;
  description: string;
  level: number;
  pageStart?: number;
  pageEnd?: number;
  relatedConceptIds: string[];
  confusableConceptIds: string[];
}
