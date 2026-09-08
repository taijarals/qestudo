const fs = require('fs');
let code = fs.readFileSync('src/pages/StudySession.tsx', 'utf-8');

code = code.replace(/import \{ mockQuestions \} from '\.\.\/mocks\/data';/g, "import { studyService } from '../services';");
code = code.replace(/import React, \{ useEffect \} from 'react';/g, "import React, { useEffect, useState } from 'react';");
code = code.replace(/import \{ Question \} from '\.\.\/domain';/g, ""); // to ensure no duplication if already there
code = code.replace(/import \{ useStudyEngine \} from '\.\.\/hooks\/useStudyEngine';/, "import { useStudyEngine } from '../hooks/useStudyEngine';\nimport { Question } from '../domain';");


const matchString = `  const currentIndex = activeSession.currentQuestionIndex;
  const currentQuestionId = activeSession.questionIds[currentIndex];
  const question = mockQuestions.find(q => q.id === currentQuestionId);

  // Fallback in case a mock ID wasn't found
  if (!question) {
    return <div className="p-8 text-center">Questão não encontrada.</div>;
  }`;

const replacement = `  const currentIndex = activeSession.currentQuestionIndex;
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

code = code.replace(matchString, replacement);

fs.writeFileSync('src/pages/StudySession.tsx', code);
