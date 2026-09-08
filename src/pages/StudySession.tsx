import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockQuestions } from '../mocks/data';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Card } from '../components/ui/Card';
import { ArrowLeft, ArrowRight, XCircle, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStudySession } from '../context/StudySessionContext';
import { useStudyEngine } from '../hooks/useStudyEngine';

export function StudySession() {
  const navigate = useNavigate();
  const { activeSession, endSession, answers } = useStudySession();

  // Protected route logic
  useEffect(() => {
    if (!activeSession) {
      navigate('/estudar');
    }
  }, [activeSession, navigate]);

  if (!activeSession) return null;

  const currentIndex = activeSession.currentQuestionIndex;
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
  }

  const { 
    status, 
    selectedOption, 
    setSelectedOption, 
    confirmAnswer, 
    handleFeedback, 
    nextQuestion,
    responseType
  } = useStudyEngine(currentQuestionId);

  const correctAnswerId = question.options.find(o => o.isCorrect)?.id;
  const isCorrect = selectedOption === correctAnswerId;
  const isDontKnow = responseType === 'dont_know';

  const progress = ((currentIndex + 1) / activeSession.questionIds.length) * 100;
  
  const currentAnswer = answers.find(a => a.questionId === currentQuestionId);
  const feedback = currentAnswer?.understandingFeedback;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col relative bg-white">
      {/* Top Bar */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex-1 max-w-sm">
          <div className="flex items-center justify-between text-sm font-medium mb-2 text-slate-500">
            <span>Questão {currentIndex + 1} de {activeSession.questionIds.length}</span>
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
          <Badge variant="blue">Cloud Computing</Badge>
          <Badge variant="warning">Dificuldade: {question.difficulty}</Badge>
        </div>

        <div className="prose prose-slate max-w-none mb-10">
          <p className="text-xl leading-relaxed text-slate-800">{question.statement}</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {question.type === 'certo-errado' ? (
            <div className="grid grid-cols-2 gap-4">
              {question.options?.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => status === 'answering' && setSelectedOption(opt.id)}
                  disabled={status === 'correction'}
                  className={cn(
                    'p-6 rounded-xl border-2 text-lg font-bold transition-all',
                    selectedOption === opt.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                    status === 'correction' && opt.isCorrect && 'border-green-500 bg-green-50 text-green-700',
                    status === 'correction' && selectedOption === opt.id && !isCorrect && 'border-red-500 bg-red-50 text-red-700'
                  )}
                >
                  {opt.text}
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
                    {opt.letter}
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
              
              <div>
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
                      {(question.options?.find(o => o.isCorrect) as any)?.letter || question.options?.find(o => o.isCorrect)?.text}
                    </p>
                  </div>
                  {!isCorrect && !isDontKnow && (
                    <div>
                      <span className="text-sm uppercase tracking-wider font-semibold opacity-70">Sua resposta</span>
                      <p className="text-lg font-bold mt-1">
                        {(question.options?.find(o => o.id === selectedOption) as any)?.letter || question.options?.find(o => o.id === selectedOption)?.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Explicação</h4>
                <p className="text-slate-700 leading-relaxed">{question.explanation}</p>
              </div>

              {question.trapType && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-orange-900">Pegadinha</h5>
                    <p className="text-orange-800 text-sm mt-1">{question.trapType}</p>
                  </div>
                </div>
              )}

              {/* conceptualDifficulty mock removed as it wasn't requested in domain model */}

              <div>
                <h5 className="text-sm font-semibold text-slate-900 mb-1">Fonte</h5>
                <p className="text-sm text-slate-500">
                  Material {question.sourceReferences[0]?.materialId} • Página {question.sourceReferences[0]?.page}
                </p>
              </div>
            </div>
            
            <Card className="p-6 bg-slate-50 mt-8 border-none">
              <h4 className="font-bold text-slate-900 mb-4 text-center">Você entendeu esta explicação?</h4>
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
            </Card>

          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex items-center justify-between">
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
              <Button variant="outline" className="hidden sm:flex">Explique de forma simples</Button>
              <Button size="lg" onClick={nextQuestion} className="px-10">
                {currentIndex < activeSession.questionIds.length - 1 ? (
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
