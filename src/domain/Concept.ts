export interface Concept {
  id: string;
  materialId: string;
  parentId?: string;
  name: string;
  description: string;
  level: string;
  pageStart?: number;
  pageEnd?: number;
  relatedConceptIds: string[];
  confusableConceptIds: string[];
}
