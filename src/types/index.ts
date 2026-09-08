export interface ConceptPerformance {
  id: string;
  name: string;
  domain: number;
  status: 'Não visto' | 'Aprendendo' | 'Em consolidação' | 'Dominado' | 'Precisa revisar';
  questionCount: number;
  children?: ConceptPerformance[];
}

export interface ErrorRecord {
  id: string;
  subject: string;
  errorCount: number;
  concepts: { name: string; count: number }[];
}
