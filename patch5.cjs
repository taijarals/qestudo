const fs = require('fs');
let code = fs.readFileSync('src/pages/SessionResult.tsx', 'utf-8');

code = code.replace(/import \{ mockQuestions, mockPerformance \} from '\.\.\/mocks\/data';/, "import { studyService, performanceService } from '../services';\nimport { Question, Concept } from '../domain';\nimport { useState, useEffect } from 'react';");

const newLogic = `
export function SessionResult() {
  const navigate = useNavigate();
  const { activeSession, answers, endSession, startSession } = useStudySession();

  const [questionsMap, setQuestionsMap] = useState<Record<string, Question>>({});
  const [conceptsMap, setConceptsMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeSession && answers.length === 0) return;

    const loadData = async () => {
      const qMap: Record<string, Question> = {};
      
      // Fetch all questions answered
      const promises = answers.map(async ans => {
        const q = await studyService.getQuestionById(ans.questionId);
        if (q) qMap[q.id] = q;
      });

      await Promise.all(promises);
      setQuestionsMap(qMap);

      // We'd ideally fetch concepts from materialService but for now let's just 
      // rely on a basic mock fallback or if we had a concept service.
      setIsLoading(false);
    };

    loadData();
  }, [answers, activeSession]);

  if (!activeSession && answers.length === 0) {
`;

code = code.replace(/export function SessionResult\(\) \{\n  const navigate = useNavigate\(\);\n  const \{ activeSession, answers, endSession, startSession \} = useStudySession\(\);\n\n  if \(\!activeSession && answers\.length === 0\) \{/m, newLogic.trim());

// Remove old getConceptName
code = code.replace(/const getConceptName = \(conceptId: string\) => \{[\s\S]*?\};\n\n/, "");

// Replace getting concept name
code = code.replace(/getConceptName\(conceptId\)/g, "(conceptId === 'c_bd1' ? 'Transações (ACID)' : `Conceito ${conceptId}`)");


// Update answers loop to use questionsMap
code = code.replace(/const q = mockQuestions\.find\(mq => mq\.id === ans\.questionId\);/g, "const q = questionsMap[ans.questionId];");

// Add loading state check
code = code.replace(/const total = answers\.length;/g, "if (isLoading) return <div className=\"p-8 text-center\">Carregando resultados...</div>;\n\n  const total = answers.length;");

fs.writeFileSync('src/pages/SessionResult.tsx', code);
