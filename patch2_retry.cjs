const fs = require('fs');
let code = fs.readFileSync('src/pages/StudySession.tsx', 'utf-8');

const oldChunk = `  const currentIndex = activeSession.currentQuestionIndex;
  const currentQuestionId = activeSession.questionIds[currentIndex];
  const question = mockQuestions.find(q => q.id === currentQuestionId);

  // Fallback in case a mock ID wasn't found
  if (!question) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Erro ao carregar a questão</h2>
        <Button onClick={() => navigate('/estudar')}>Voltar</Button>
      </div>
    );
  }`;

const newChunk = `  const currentIndex = activeSession.currentQuestionIndex;
  const currentQuestionId = activeSession.questionIds[currentIndex];
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (currentQuestionId) {
      studyService.getQuestionById(currentQuestionId).then(q => setQuestion(q || null));
    }
  }, [currentQuestionId]);

  if (!question) {
    return <div className="p-8 text-center text-slate-500">Carregando questão...</div>;
  }`;

code = code.replace(oldChunk, newChunk);
fs.writeFileSync('src/pages/StudySession.tsx', code);
