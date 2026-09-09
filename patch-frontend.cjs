const fs = require('fs');

let hookCode = fs.readFileSync('src/hooks/useStudyEngine.ts', 'utf-8');

if (!hookCode.includes("const [answerId, setAnswerId]")) {
  hookCode = hookCode.replace(
    "const [responseType, setResponseType] = useState<ResponseType>('answered');",
    `const [responseType, setResponseType] = useState<ResponseType>('answered');
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);`
  );

  hookCode = hookCode.replace(
    "setResponseType('answered');",
    "setResponseType('answered');\n    setAnswerId(null);\n    setFeedbackStatus(null);"
  );

  hookCode = hookCode.replace(
    "const confirmAnswer = useCallback((isCorrect: boolean, isDontKnow: boolean = false) => {",
    `const confirmAnswer = useCallback(async (isCorrect: boolean, isDontKnow: boolean = false) => {`
  );

  hookCode = hookCode.replace(
    "addAnswer(answer);\n    setResponseType(rType);\n    setStatus('correction');",
    `addAnswer(answer);
    setResponseType(rType);
    setStatus('correction');

    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          questionId,
          selectedOptionId: isDontKnow ? undefined : selectedOption,
          responseType: rType,
          timeSpent: timeTaken
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnswerId(data.answerId);
      }
    } catch(e) {
      console.error('Failed to submit answer to backend', e);
    }
    `
  );

  hookCode = hookCode.replace(
    "const handleFeedback = useCallback((feedback: UnderstandingFeedback) => {",
    `const handleFeedback = useCallback(async (feedback: UnderstandingFeedback) => {`
  );

  hookCode = hookCode.replace(
    "updateAnswerFeedback(questionId, feedback);",
    `updateAnswerFeedback(questionId, feedback);
    if (answerId) {
       try {
         await fetch(\`/api/answers/\${answerId}/comprehension\`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ feedback })
         });
         setFeedbackStatus(feedback);
       } catch (e) {
         console.error('Failed to submit feedback', e);
       }
    }`
  );

  hookCode = hookCode.replace(
    "return {\n    status,",
    "return {\n    status,\n    feedbackStatus,"
  );

  fs.writeFileSync('src/hooks/useStudyEngine.ts', hookCode);
}

let pageCode = fs.readFileSync('src/pages/StudySession.tsx', 'utf-8');

if (!pageCode.includes("feedbackStatus")) {
  pageCode = pageCode.replace(
    "handleFeedback,\n    nextQuestion,\n    responseType",
    "handleFeedback,\n    nextQuestion,\n    responseType,\n    feedbackStatus"
  );
}

const feedbackUI = `<Card className="p-6 bg-slate-50 mt-8 border-none">
              <h4 className="font-bold text-slate-900 mb-4 text-center">Você entendeu esta explicação?</h4>
              {feedbackStatus ? (
                <div className="text-center space-y-2 animate-in fade-in zoom-in duration-300">
                  <p className="text-green-700 font-medium">Feedback registrado. Obrigado!</p>
                  {feedbackStatus === 'not_understood' && (
                    <p className="text-sm text-slate-600 mt-2">Vamos reforçar esse assunto nas próximas questões.</p>
                  )}
                </div>
              ) : (
              <div className="flex justify-center gap-4">
                <Button 
                  variant={feedback === 'understood' ? 'success' : 'outline'}
                  onClick={() => handleFeedback('understood')}
                  className={cn("w-32", feedback === 'understood' ? '' : 'bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200')}
                >
                  Sim
                </Button>
                <Button 
                  variant={feedback === 'partial' ? 'warning' : 'outline'}
                  onClick={() => handleFeedback('partial')}
                  className={cn("w-32", feedback === 'partial' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' : 'bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200')}
                >
                  Mais ou menos
                </Button>
                <Button 
                  variant={feedback === 'not_understood' ? 'danger' : 'outline'}
                  onClick={() => handleFeedback('not_understood')}
                  className={cn("w-32", feedback === 'not_understood' ? '' : 'bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200')}
                >
                  Não
                </Button>
              </div>
              )}
            </Card>`;

pageCode = pageCode.replace(
  /<Card className="p-6 bg-slate-50 mt-8 border-none">[\s\S]*?<\/Card>/,
  feedbackUI
);

fs.writeFileSync('src/pages/StudySession.tsx', pageCode);

