import { Material, Question, ConceptPerformance, ErrorRecord } from '../types';

export const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Cloud Computing - Aula 01.pdf',
    status: 'processado',
    progress: 76,
    conceptCount: 42,
    questionCount: 118,
    domain: 64,
    type: 'pdf',
  },
  {
    id: '2',
    title: 'Banco de Dados - Teoria.pdf',
    status: 'processado',
    progress: 62,
    conceptCount: 38,
    questionCount: 96,
    domain: 52,
    type: 'pdf',
  },
  {
    id: '3',
    title: 'Direito Administrativo.pdf',
    status: 'processado',
    progress: 48,
    conceptCount: 31,
    questionCount: 74,
    domain: 28,
    type: 'pdf',
  },
  {
    id: '4',
    title: 'Segurança da Informação.pdf',
    status: 'processando',
    progress: 15,
    conceptCount: 28,
    questionCount: 0,
    domain: null,
    type: 'pdf',
  },
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    board: 'CEBRASPE',
    subject: 'Cloud Computing',
    difficulty: 'média',
    type: 'certo-errado',
    text: 'Em um ambiente de computação em nuvem, o cliente é responsável pela administração do sistema operacional em um serviço de PaaS (Platform as a Service).',
    options: [
      { id: 'certo', letter: 'C', text: 'CERTO' },
      { id: 'errado', letter: 'E', text: 'ERRADO' },
    ],
    correctAnswerId: 'errado',
    explanation: 'O modelo PaaS fornece um ambiente de execução para o desenvolvimento e implantação de aplicações, incluindo infraestrutura, sistema operacional, middleware e ferramentas de desenvolvimento. O cliente NÃO precisa se preocupar com a administração da infraestrutura subjacente, incluindo o sistema operacional.',
    catch: 'A alternativa tenta confundir o modelo IaaS (onde o cliente gerencia o SO) com o modelo PaaS.',
    conceptualDifficulty: 'Sua resposta indica possível confusão entre PaaS e IaaS.',
    source: 'Cloud Computing - Aula 01.pdf • Página 17'
  },
  {
    id: 'q2',
    board: 'FGV',
    subject: 'Cloud Computing',
    difficulty: 'média',
    type: 'multipla-escolha',
    text: 'Assinale a alternativa que descreve corretamente o modelo de serviço PaaS (Platform as a Service).',
    options: [
      { id: 'a', letter: 'A', text: 'Fornece apenas infraestrutura física para o cliente.' },
      { id: 'b', letter: 'B', text: 'Disponibiliza aplicações completas aos usuários finais.' },
      { id: 'c', letter: 'C', text: 'Exige que o cliente gerencie o sistema operacional.' },
      { id: 'd', letter: 'D', text: 'Fornece um ambiente de execução para o desenvolvimento e implantação de aplicações.' },
      { id: 'e', letter: 'E', text: 'É um modelo de implantação de nuvem.' },
    ],
    correctAnswerId: 'd',
    explanation: 'O modelo PaaS (Platform as a Service) fornece uma plataforma completa que inclui infraestrutura, sistema operacional e ferramentas de desenvolvimento, permitindo que desenvolvedores criem e implantem aplicações sem gerenciar a infraestrutura subjacente.',
    catch: 'A alternativa B descreve o modelo SaaS. A alternativa C descreve IaaS.',
    conceptualDifficulty: 'Confusão entre os modelos de serviço SaaS, PaaS e IaaS.',
    source: 'Cloud Computing - Aula 01.pdf • Página 18'
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
