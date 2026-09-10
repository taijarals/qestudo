import { Material, Question, Concept, ConceptMastery } from '../domain';
import { ConceptPerformance, ErrorRecord } from '../types';

export const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Cloud Computing - Aula 01',
    fileName: 'Cloud Computing - Aula 01.pdf',
    status: 'ready',
    processingProgress: 100,
    studyCoverage: 76,
    conceptCount: 42,
    questionCount: 118,
    masteryScore: 64,
  },
  {
    id: '2',
    title: 'Banco de Dados - Teoria',
    fileName: 'Banco de Dados - Teoria.pdf',
    status: 'ready',
    processingProgress: 100,
    studyCoverage: 62,
    conceptCount: 38,
    questionCount: 96,
    masteryScore: 52,
  },
  {
    id: '3',
    title: 'Direito Administrativo',
    fileName: 'Direito Administrativo.pdf',
    status: 'ready',
    processingProgress: 100,
    studyCoverage: 48,
    conceptCount: 31,
    questionCount: 74,
    masteryScore: 28,
  },
  {
    id: '4',
    title: 'Segurança da Informação',
    fileName: 'Segurança da Informação.pdf',
    status: 'extracting',
    processingProgress: 15,
    studyCoverage: 0,
    conceptCount: 28,
    questionCount: 0,
    masteryScore: null,
  },
];

export const mockDomainConcepts: Concept[] = [
  { id: 'c1', materialId: '1', name: 'Características essenciais', description: '', level: 'topic', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c1-1', materialId: '1', parentId: 'c1', name: 'Elasticidade', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c1-2', materialId: '1', parentId: 'c1', name: 'Resource Pooling', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c1-3', materialId: '1', parentId: 'c1', name: 'Measured Service', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  
  { id: 'c2', materialId: '1', name: 'Modelos de serviço', description: '', level: 'topic', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c2-1', materialId: '1', parentId: 'c2', name: 'IaaS', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c2-2', materialId: '1', parentId: 'c2', name: 'PaaS', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c2-3', materialId: '1', parentId: 'c2', name: 'SaaS', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },

  { id: 'c3', materialId: '1', name: 'Modelos de implantação', description: '', level: 'topic', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c3-1', materialId: '1', parentId: 'c3', name: 'Pública', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c3-2', materialId: '1', parentId: 'c3', name: 'Privada', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
  { id: 'c3-3', materialId: '1', parentId: 'c3', name: 'Híbrida', description: '', level: 'concept', relatedConceptIds: [], confusableConceptIds: [] },
];

export const mockDomainMasteries: ConceptMastery[] = [
  { conceptId: 'c1', masteryScore: 52, status: 'learning', correctAnswers: 20, wrongAnswers: 12 },
  { conceptId: 'c1-1', masteryScore: 33, status: 'review_needed', correctAnswers: 3, wrongAnswers: 8 },
  { conceptId: 'c1-2', masteryScore: 68, status: 'consolidating', correctAnswers: 12, wrongAnswers: 2 },
  { conceptId: 'c1-3', masteryScore: 75, status: 'consolidating', correctAnswers: 5, wrongAnswers: 2 },

  { conceptId: 'c2', masteryScore: 82, status: 'mastered', correctAnswers: 50, wrongAnswers: 5 },
  { conceptId: 'c2-1', masteryScore: 100, status: 'mastered', correctAnswers: 25, wrongAnswers: 0 },
  { conceptId: 'c2-2', masteryScore: 50, status: 'learning', correctAnswers: 10, wrongAnswers: 5 },
  { conceptId: 'c2-3', masteryScore: 94, status: 'mastered', correctAnswers: 15, wrongAnswers: 0 },

  { conceptId: 'c3', masteryScore: 40, status: 'review_needed', correctAnswers: 8, wrongAnswers: 15 },
  { conceptId: 'c3-1', masteryScore: 60, status: 'learning', correctAnswers: 4, wrongAnswers: 2 },
  { conceptId: 'c3-2', masteryScore: 20, status: 'review_needed', correctAnswers: 1, wrongAnswers: 5 },
  { conceptId: 'c3-3', masteryScore: 35, status: 'review_needed', correctAnswers: 3, wrongAnswers: 8 },
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    materialId: '1',
    conceptId: 'c1',
    board: 'CEBRASPE',
    type: 'certo-errado',
    difficulty: 'media',
    cognitiveObjective: 'Compreender a responsabilidade no modelo PaaS',
    statement: 'Em um ambiente de computação em nuvem, o cliente é responsável pela administração do sistema operacional em um serviço de PaaS (Platform as a Service).',
    options: [
      { id: 'certo', questionId: 'q1', position: 0, letter: 'C', text: 'CERTO', isCorrect: false },
      { id: 'errado', questionId: 'q1', position: 1, letter: 'E', text: 'ERRADO', isCorrect: true },
    ] as any, // casting to avoid adding letter property to domain model for now
    explanation: 'O modelo PaaS fornece um ambiente de execução para o desenvolvimento e implantação de aplicações, incluindo infraestrutura, sistema operacional, middleware e ferramentas de desenvolvimento. O cliente NÃO precisa se preocupar com a administração da infraestrutura subjacente, incluindo o sistema operacional.',
    trapType: 'A alternativa tenta confundir o modelo IaaS (onde o cliente gerencia o SO) com o modelo PaaS.',
    validationStatus: 'validated',
    sourceReferences: [
      { materialId: '1', page: 17, excerpt: 'O modelo PaaS fornece um ambiente de execução...' }
    ]
  },
  {
    id: 'q2',
    materialId: '1',
    conceptId: 'c2',
    board: 'FGV',
    type: 'multipla-escolha',
    difficulty: 'media',
    cognitiveObjective: 'Identificar a definição correta do modelo PaaS',
    statement: 'Assinale a alternativa que descreve corretamente o modelo de serviço PaaS (Platform as a Service).',
    options: [
      { id: 'a', questionId: 'q2', position: 0, letter: 'A', text: 'Fornece apenas infraestrutura física para o cliente.', isCorrect: false },
      { id: 'b', questionId: 'q2', position: 1, letter: 'B', text: 'Disponibiliza aplicações completas aos usuários finais.', isCorrect: false },
      { id: 'c', questionId: 'q2', position: 2, letter: 'C', text: 'Exige que o cliente gerencie o sistema operacional.', isCorrect: false },
      { id: 'd', questionId: 'q2', position: 3, letter: 'D', text: 'Fornece um ambiente de execução para o desenvolvimento e implantação de aplicações.', isCorrect: true },
      { id: 'e', questionId: 'q2', position: 4, letter: 'E', text: 'É um modelo de implantação de nuvem.', isCorrect: false },
    ] as any,
    explanation: 'O modelo PaaS (Platform as a Service) fornece uma plataforma completa que inclui infraestrutura, sistema operacional e ferramentas de desenvolvimento, permitindo que desenvolvedores criem e implantem aplicações sem gerenciar a infraestrutura subjacente.',
    trapType: 'A alternativa B descreve o modelo SaaS. A alternativa C descreve IaaS.',
    validationStatus: 'validated',
    sourceReferences: [
      { materialId: '1', page: 18, excerpt: 'O modelo PaaS (Platform as a Service) fornece uma plataforma...' }
    ]
  },
  {
    id: 'q3',
    materialId: '2',
    conceptId: 'c_bd1',
    board: 'FCC',
    type: 'multipla-escolha',
    difficulty: 'facil',
    cognitiveObjective: 'Identificar a propriedade de atomicidade em transações',
    statement: 'No contexto de Banco de Dados Relacionais, a propriedade das transações (ACID) que garante que todas as operações de uma transação sejam concluídas com sucesso ou nenhuma delas seja aplicada é a:',
    options: [
      { id: 'a', questionId: 'q3', position: 0, letter: 'A', text: 'Consistência.', isCorrect: false },
      { id: 'b', questionId: 'q3', position: 1, letter: 'B', text: 'Isolamento.', isCorrect: false },
      { id: 'c', questionId: 'q3', position: 2, letter: 'C', text: 'Atomicidade.', isCorrect: true },
      { id: 'd', questionId: 'q3', position: 3, letter: 'D', text: 'Durabilidade.', isCorrect: false },
      { id: 'e', questionId: 'q3', position: 4, letter: 'E', text: 'Normalização.', isCorrect: false },
    ] as any,
    explanation: 'A Atomicidade (o "A" de ACID) garante que a transação seja tratada como uma unidade indivisível de trabalho ("tudo ou nada").',
    trapType: 'As outras alternativas listam as demais propriedades ACID, induzindo o candidato a confundir seus significados.',
    validationStatus: 'validated',
    sourceReferences: [
      { materialId: '2', page: 45, excerpt: 'Atomicidade garante que a transação é tudo ou nada...' }
    ]
  }
];

export const mockPerformance: ConceptPerformance[] = [
  {
    id: 'c1',
    name: 'Características essenciais',
    domain: 72,
    status: 'Em consolidação',
    questionCount: 45,
  },
  {
    id: 'c2',
    name: 'Modelos de serviço',
    domain: 58,
    status: 'Aprendendo',
    questionCount: 82,
    children: [
      { id: 'c2-1', name: 'IaaS', domain: 89, status: 'Dominado', questionCount: 25 },
      { id: 'c2-2', name: 'PaaS', domain: 52, status: 'Aprendendo', questionCount: 30 },
      { id: 'c2-3', name: 'SaaS', domain: 94, status: 'Dominado', questionCount: 27 },
    ]
  },
  {
    id: 'c3',
    name: 'Modelos de implantação',
    domain: 66,
    status: 'Em consolidação',
    questionCount: 34,
  },
  {
    id: 'c4',
    name: 'Segurança na nuvem',
    domain: 48,
    status: 'Precisa revisar',
    questionCount: 56,
  }
];

export const mockErrors: ErrorRecord[] = [
  {
    id: 'e1',
    subject: 'Cloud Computing',
    errorCount: 12,
    concepts: [
      { name: 'PaaS x SaaS', count: 4 },
      { name: 'Elasticidade x Escalabilidade', count: 3 },
      { name: 'Modelos de implantação', count: 2 },
      { name: 'Responsabilidade do cliente', count: 2 },
      { name: 'Segurança na nuvem', count: 1 },
    ]
  },
  {
    id: 'e2',
    subject: 'Banco de Dados',
    errorCount: 9,
    concepts: [
      { name: 'LEFT JOIN x INNER JOIN', count: 3 },
      { name: 'Normalização (2FN x 3FN)', count: 2 },
      { name: 'Transações', count: 2 },
      { name: 'Índices', count: 1 },
      { name: 'Modelagem conceitual', count: 1 },
    ]
  }
];
