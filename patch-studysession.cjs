const fs = require('fs');

let code = `import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { ArrowLeft, ArrowRight, XCircle, CheckCircle, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStudySession } from '../context/StudySessionContext';
import { Answer, UnderstandingFeedback } from '../domain';

export function StudySession() {
  const navigate = useNavigate();
  const { activeSession, endSession, answers, addAnswer, updateAnswerFeedback } = useStudySession();

  const [question, setQuestion] = useState<any | null>(null);
  const [status, setStatus] = useState<'answering' | 'correction' | 'loading' | 'error'>('loading');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [responseType, setResponseType] = useState<'answered' | 'dont_know'>('answered');
  const [answerId, setAnswerId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Protected route logic
  useEffect(() => {
    if (!activeSession) {
      navigate('/estudar');
    } else {
      fetchNextQuestion();
    }
  }, [activeSession, navigate]);

  const fetchNextQuestion = async () => {
    if (!activeSession) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(\`/api/study-sessions/\${activeSession.id}/next-question\`, {
        method: 'POST'
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao buscar próxima questão');
      }
      const data = await res.json();
      setQuestion(data.question);
      setStatus('answering');
      setSelectedOption(null);
      setStartTime(Date.now());
      setResponseType('answered');
      setAnswerId(null);
      setFeedbackStatus(null);
    } catch (e: any) {
      if (e.message === 'Session is already complete') {
        endSession();
        navigate('/resultado-sessao');
      } else {
        setErrorMsg(e.message);
        setStatus('error');
      }
    }
  };

  if (!activeSession) return null;

  const confirmAnswer = async (isCorrect: boolean, isDontKnow: boolean = false) => {
    if (!question) return;
    const timeTaken = Date.now() - startTime;
    const rType = isDontKnow ? 'dont_know' : 'answered';
    
    setResponseType(rType);
    setStatus('correction');

    // add to local context
    addAnswer({
      id: \`local_\${Date.now()}\`,
      sessionId: activeSession.id,
      questionId: question.id,
      selectedOptionId: isDontKnow ? undefined : selectedOption || undefined,
      responseType: rType,
      isCorrect,
      responseTimeMs: timeTaken,
      answeredAt: new Date()
    } as Answer);

    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          questionId: question.id,
          selectedOptionId: isDontKnow ? undefined : selectedOption,
          responseType: rType,
          timeSpent: timeTaken
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnswerId(data.answerId);
        
        // Se a questao nao tinha explanation mas foi retornada no answers submit,
        // nos precisamos de um jeito de pegar a explaination. Mas o validator service da questao
        // ja tem explanation guardado no bd na verdade. 
        // Vamos dar fetch na questao de novo para pegar explanation
        const qRes = await fetch(\`/api/questions/\${question.id}\`);
        if (qRes.ok) {
           const fullQ = await qRes.json();
           setQuestion(fullQ);
        }
      } else {
         console.error('Erro ao salvar resposta');
      }
    } catch(e) {
      console.error('Failed to submit answer to backend', e);
    }
  };

  const handleFeedback = async (feedback: UnderstandingFeedback) => {
    if (!question) return;
    updateAnswerFeedback(question.id, feedback);
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
    }
  };

  const nextQuestion = () => {
    fetchNextQuestion();
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-600 font-medium animate-pulse">Preparando sua próxima questão a partir do material...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
           <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algum erro ocorreu.</h2>
          <p className="text-slate-600">{errorMsg}</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => { endSession(); navigate('/estudar'); }}>Voltar</Button>
           <Button onClick={fetchNextQuestion}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const correctAnswerId = question.options?.find((o: any) => o.isCorrect)?.id;
  const isCorrect = selectedOption === correctAnswerId;
  const isDontKnow = responseType === 'dont_know';
  const progress = (answers.length / activeSession.quantity) * 100;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col relative bg-white">
      {/* Top Bar */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center justify-between text-sm font-medium mb-2 text-slate-500">
            <span>Questão {answers.length + (status === 'answering' ? 1 : 0)} de {activeSession.quantity}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <button 
          onClick={() => {
            endSession();
            navigate('/estudar');
          }}
          className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Encerrar sessão
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 pb-32">
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant="outline">{question.board}</Badge>
          <Badge variant="warning">Dificuldade: {question.difficulty}</Badge>
        </div>

        <div className="prose prose-slate max-w-none mb-10">
          <p className="text-xl leading-relaxed text-slate-800">{question.statement}</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {question.type === 'certo-errado' ? (
            <div className="grid grid-cols-2 gap-4">
              {question.options?.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() => status === 'answering' && setSelectedOption(opt.id)}
                  disabled={status === 'correction'}
                  className={cn(
                    'w-full p-6 rounded-2xl border-2 text-center transition-all',
                    selectedOption === opt.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                    status === 'correction' && opt.isCorrect && 'border-green-500 bg-green-50 text-green-900',
                    status === 'correction' && selectedOption === opt.id && !isCorrect && 'border-red-500 bg-red-50 text-red-900'
                  )}
                >
                  <span className="text-xl font-bold">{opt.text}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {question.options?.map((opt: any) => (
                <button
                  key={opt.id}
                  onClick={() => status === 'answering' && setSelectedOption(opt.id)}
                  disabled={status === 'correction'}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    selectedOption === opt.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-900' 
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                    status === 'correction' && opt.isCorrect && 'border-green-500 bg-green-50 text-green-900',
                    status === 'correction' && selectedOption === opt.id && !isCorrect && 'border-red-500 bg-red-50 text-red-900'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                    selectedOption === opt.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
                    status === 'correction' && opt.isCorrect && 'bg-green-500 text-white',
                    status === 'correction' && selectedOption === opt.id && !isCorrect && 'bg-red-500 text-white'
                  )}>
                    {opt.position === 0 ? 'A' : opt.position === 1 ? 'B' : opt.position === 2 ? 'C' : opt.position === 3 ? 'D' : 'E'}
                  </div>
                  <span className="text-lg leading-relaxed">{opt.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Correction Feedback */}
        {status === 'correction' && (
          <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className={cn(
              'p-6 rounded-2xl flex items-start gap-4', 
              isCorrect ? 'bg-green-50' : (isDontKnow ? 'bg-slate-50 border border-slate-200' : 'bg-red-50')
            )}>
              {isCorrect ? (
                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              ) : isDontKnow ? (
                <HelpCircle className="w-8 h-8 text-slate-500 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 shrink-0" />
              )}
              
              <div className="w-full">
                <h3 className={cn(
                  'text-xl font-bold', 
                  isCorrect ? 'text-green-900' : (isDontKnow ? 'text-slate-900' : 'text-red-900')
                )}>
                  {isCorrect ? 'Você acertou!' : isDontKnow ? 'Você não sabia' : 'Você errou'}
                </h3>
                {!isCorrect && (
                  <p className={cn("mt-1", isDontKnow ? 'text-slate-600' : 'text-red-700')}>
                    {isDontKnow ? 'É normal não saber tudo! Aprenda com a explicação.' : 'Mas isso faz parte do aprendizado!'}
                  </p>
                )}
                
                <div className="flex gap-8 mt-4 pt-4 border-t border-black/10">
                  <div>
                    <span className="text-sm uppercase tracking-wider font-semibold opacity-70">Resposta correta</span>
                    <p className="text-lg font-bold mt-1">
                      {question.options?.find((o: any) => o.isCorrect)?.text}
                    </p>
                  </div>
                  {!isCorrect && !isDontKnow && (
                    <div>
                      <span className="text-sm uppercase tracking-wider font-semibold opacity-70">Sua resposta</span>
                      <p className="text-lg font-bold mt-1">
                        {question.options?.find((o: any) => o.id === selectedOption)?.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              {question.explanation && (
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Explicação</h4>
                  <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
                </div>
              )}

              {question.sourceReferences && question.sourceReferences.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 mb-1">Fonte</h5>
                  <p className="text-sm text-slate-500">
                    Página {question.sourceReferences[0]?.page} do material.
                  </p>
                </div>
              )}
            </div>
            
            <Card className="p-6 bg-slate-50 mt-8 border-none">
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
                  variant="outline"
                  onClick={() => handleFeedback('understood')}
                  className={cn("w-32", 'bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200')}
                >
                  Sim
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleFeedback('partial')}
                  className={cn("w-32", 'bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200')}
                >
                  Mais ou menos
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleFeedback('not_understood')}
                  className={cn("w-32", 'bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200')}
                >
                  Não
                </Button>
              </div>
              )}
            </Card>

          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {status === 'answering' ? (
          <>
            <Button variant="ghost" className="text-slate-500" onClick={() => confirmAnswer(false, true)}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Não sei
            </Button>
            <Button 
              size="lg" 
              disabled={!selectedOption} 
              onClick={() => confirmAnswer(isCorrect, false)}
              className="px-10"
            >
              Confirmar resposta <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => { endSession(); navigate('/estudar'); }}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar e Encerrar
            </Button>
            <div className="flex items-center gap-3">
              <Button size="lg" onClick={nextQuestion} className="px-10">
                {answers.length < activeSession.quantity ? (
                  <>Próxima questão <ArrowRight className="w-5 h-5 ml-2" /></>
                ) : (
                  <>Concluir sessão <CheckCircle className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/StudySession.tsx', code);

// remove hook since it's in the component now
if (fs.existsSync('src/hooks/useStudyEngine.ts')) {
  fs.unlinkSync('src/hooks/useStudyEngine.ts');
}
