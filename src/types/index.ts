export interface Material {
  id: string;
  title: string;
  status: 'processando' | 'processado' | 'erro';
  progress: number;
  conceptCount: number;
  questionCount: number;
  domain: number | null;
  type: 'pdf' | 'video' | 'text';
}

export interface Question {
  id: string;
  board: string;
  subject: string;
  difficulty: 'fácil' | 'média' | 'difícil';
  type: 'certo-errado' | 'multipla-escolha';
  text: string;
  options?: { id: string; letter: string; text: string }[];
  correctAnswerId: string;
  explanation: string;
  catch?: string; // pegadinha
  conceptualDifficulty?: string;
  source: string;
}

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
