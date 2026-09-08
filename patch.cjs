const fs = require('fs');
let code = fs.readFileSync('src/pages/StudyConfig.tsx', 'utf-8');

code = code.replace(/import \{ mockQuestions \} from '\.\.\/mocks\/data';/g, "import { studyService } from '../services';");

const newLogic = `
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    setErrorMsg('');
    
    // 1. Validation
    if (!formats.ce && !formats.me) {
      setErrorMsg('Selecione pelo menos um formato de questão.');
      return;
    }

    // 2. Build Config
    const selectedBoards = board === 'Misturado' 
      ? ['CEBRASPE', 'FGV', 'FCC'] 
      : [board];
      
    const selectedTypes = [];
    if (formats.ce) selectedTypes.push('certo-errado');
    if (formats.me) selectedTypes.push('multipla-escolha');

    const config = {
      materialIds: [material],
      boards: selectedBoards,
      questionTypes: selectedTypes,
      quantity,
      mode,
      conceptIds: mode === 'specific' ? [concept] : undefined,
    };

    setIsLoading(true);

    try {
      const questionsForSession = await studyService.generateQuestionsForSession(config);

      let availableQuestions = questionsForSession.filter(q => 
        config.questionTypes.includes(q.type)
      );

      if (availableQuestions.length === 0) {
        setErrorMsg('Nenhuma questão encontrada com estes filtros. Tente misturar as bancas ou formatos.');
        setIsLoading(false);
        return;
      }

      const questionIds = availableQuestions.map(q => q.id).slice(0, quantity);

      // 4. Create Session
      const session = {
        id: \`sess_\${Date.now()}\`,
        config,
        questionIds,
        currentQuestionIndex: 0,
        startedAt: new Date(),
        status: 'active' as const
      };

      startSession(session);
      navigate('/sessao');
    } catch (e) {
      setErrorMsg('Erro ao gerar a sessão.');
    } finally {
      setIsLoading(false);
    }
  };
`;

const regex = /const \[errorMsg, setErrorMsg\] = useState\(''\);[\s\S]*?startSession\(session\);\s*navigate\('\/sessao'\);\s*};/m;
code = code.replace(regex, newLogic.trim());

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
