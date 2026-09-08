import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudySession } from '../context/StudySessionContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { studyService, performanceService } from '../services';
import { Question, Concept } from '../domain';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Clock, Target, RotateCcw, AlertTriangle } from 'lucide-react';

const formatQuestionType = (type: string) => {
  return type === 'certo-errado' ? 'Certo/Errado' : 'Múltipla Escolha';
};

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
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Nenhum resultado encontrado</h2>
        <Button onClick={() => navigate('/')}>Ir para o Início</Button>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center">Carregando resultados...</div>;

  const total = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  const dontKnow = answers.filter(a => a.responseType === 'dont_know').length;
  const wrong = total - correct - dontKnow;

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  let durationMs = 0;
  if (activeSession?.finishedAt && activeSession?.startedAt) {
    durationMs = new Date(activeSession.finishedAt).getTime() - new Date(activeSession.startedAt).getTime();
  } else {
    durationMs = answers.reduce((acc, ans) => acc + (ans.responseTimeMs || 0), 0);
  }
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationSeconds = Math.floor((durationMs % 60000) / 1000);
  const durationText = `${durationMinutes}m ${durationSeconds}s`;

  const boardStats: Record<string, number> = {};
  const typeStats: Record<string, number> = {};
  const conceptStats: Record<string, { total: number; correct: number; wrong: number }> = {};

  answers.forEach(ans => {
    const q = questionsMap[ans.questionId];
    if (!q) return;

    boardStats[q.board] = (boardStats[q.board] || 0) + 1;
    typeStats[q.type] = (typeStats[q.type] || 0) + 1;

    if (!conceptStats[q.conceptId]) {
      conceptStats[q.conceptId] = { total: 0, correct: 0, wrong: 0 };
    }
    conceptStats[q.conceptId].total += 1;
    if (ans.isCorrect) conceptStats[q.conceptId].correct += 1;
    else conceptStats[q.conceptId].wrong += 1;
  });

  const conceptsToReview = Object.entries(conceptStats).filter(([_, stats]) => stats.wrong > 0);

  const handleFinish = () => {
    endSession();
    navigate('/');
  };

  const handleNewSession = () => {
    endSession();
    navigate('/estudar');
  };

  const handleReviewErrors = () => {
    if (!activeSession) return;
    const errorAnswers = answers.filter(a => !a.isCorrect || a.responseType === 'dont_know');
    const errorQuestionIds = errorAnswers.map(a => a.questionId);
    
    startSession({
      ...activeSession,
      id: `sess_review_${Date.now()}`,
      questionIds: errorQuestionIds,
      currentQuestionIndex: 0,
      startedAt: new Date(),
      finishedAt: undefined,
      status: 'active',
      config: {
        ...activeSession.config,
        mode: 'review',
        quantity: errorQuestionIds.length
      }
    });
    navigate('/sessao');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sessão Concluída! 🎉</h1>
          <p className="text-slate-500 mt-1">Resumo do seu desempenho na última sessão.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-slate-700 font-medium">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Duração: {durationText}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Main Stats (Left col) */}
        <div className="md:col-span-8 space-y-6">
          <Card className="p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex flex-col items-center shrink-0">
              <CircularProgress value={score} size={140} strokeWidth={10} colorClass={score >= 70 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'} />
              <span className="text-sm font-semibold text-slate-500 mt-4 uppercase tracking-wider">Desempenho</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 flex-1 w-full">
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                <Target className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-slate-900">{total}</span>
                <span className="text-xs text-slate-500 uppercase font-semibold">Total</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 border border-green-100 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-2xl font-bold text-green-700">{correct}</span>
                <span className="text-xs text-green-800 uppercase font-semibold">Acertos</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-red-50 border border-red-100 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600 mb-2" />
                <span className="text-2xl font-bold text-red-700">{wrong}</span>
                <span className="text-xs text-red-800 uppercase font-semibold">Erros</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-100 border border-slate-200 rounded-xl">
                <HelpCircle className="w-6 h-6 text-slate-500 mb-2" />
                <span className="text-2xl font-bold text-slate-700">{dontKnow}</span>
                <span className="text-xs text-slate-600 uppercase font-semibold">Não Sabia</span>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Desempenho por conceito</h3>
            <div className="space-y-6">
              {Object.entries(conceptStats).map(([conceptId, stats]) => {
                const conceptScore = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={conceptId} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-700">{(conceptId === 'c_bd1' ? 'Transações (ACID)' : `Conceito ${conceptId}`)}</span>
                        <span className="text-sm text-slate-500">{stats.correct} de {stats.total} questões</span>
                      </div>
                      <ProgressBar value={conceptScore} colorClass={conceptScore >= 70 ? 'bg-green-500' : conceptScore >= 50 ? 'bg-amber-400' : 'bg-red-500'} />
                    </div>
                    <span className="font-bold text-slate-900 w-12 text-right text-lg">{conceptScore}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Sidebar Info (Right col) */}
        <div className="md:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6">Composição da Sessão</h3>
            
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase mb-3 block tracking-wider">Por Banca</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(boardStats).map(([board, count]) => (
                    <Badge key={board} variant="outline" className="px-3 py-1.5 border-slate-300">
                      {board} <span className="ml-2 font-bold text-blue-600">{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase mb-3 block tracking-wider">Por Formato</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeStats).map(([type, count]) => (
                    <Badge key={type} variant="blue" className="px-3 py-1.5">
                      {formatQuestionType(type)} <span className="ml-2 font-bold text-blue-800">{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {conceptsToReview.length > 0 && (
            <Card className="p-6 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-orange-900">Pontos para revisar</h3>
              </div>
              <ul className="space-y-3">
                {conceptsToReview.map(([conceptId, stats]) => (
                  <li key={conceptId} className="text-sm font-medium text-orange-800 flex items-center justify-between">
                    <span className="flex-1 pr-4">{(conceptId === 'c_bd1' ? 'Transações (ACID)' : `Conceito ${conceptId}`)}</span>
                    <Badge variant="warning" className="shrink-0">{stats.wrong} erros</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="space-y-3 pt-2">
            <Button 
              size="lg" 
              className="w-full h-12"
              variant="primary"
              disabled={wrong + dontKnow === 0}
              onClick={handleReviewErrors}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Revisar erros ({wrong + dontKnow})
            </Button>
            <Button size="lg" variant="outline" className="w-full h-12" onClick={handleNewSession}>
              Nova sessão
            </Button>
            <Button size="lg" variant="ghost" className="w-full h-12 text-slate-600 hover:text-slate-900" onClick={handleFinish}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
