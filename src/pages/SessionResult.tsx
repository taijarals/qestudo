import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudySession } from '../context/StudySessionContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CircularProgress } from '../components/ui/CircularProgress';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';

export function SessionResult() {
  const navigate = useNavigate();
  const { activeSession, answers, endSession } = useStudySession();

  // Se acessar direto a página sem resultados na memória, volta pro dashboard
  if (!activeSession && answers.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Nenhum resultado encontrado</h2>
        <Button onClick={() => navigate('/')}>Ir para o Início</Button>
      </div>
    );
  }

  const total = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  const dontKnow = answers.filter(a => a.responseType === 'dont_know').length;
  const wrong = total - correct - dontKnow;

  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const handleFinish = () => {
    endSession();
    navigate('/');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Sessão Concluída! 🎉</h1>
        <p className="text-slate-500">Aqui está o resumo do seu desempenho.</p>
      </header>

      <Card className="p-10 flex flex-col items-center gap-8">
        <CircularProgress value={score} size={160} strokeWidth={12} colorClass="text-blue-500" />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl mt-4">
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-3xl font-bold text-green-700">{correct}</span>
            <span className="text-sm font-medium text-green-800">Acertos</span>
          </div>

          <div className="flex flex-col items-center p-4 bg-red-50 rounded-xl border border-red-100">
            <XCircle className="w-8 h-8 text-red-600 mb-2" />
            <span className="text-3xl font-bold text-red-700">{wrong}</span>
            <span className="text-sm font-medium text-red-800">Erros</span>
          </div>

          <div className="flex flex-col items-center p-4 bg-slate-100 rounded-xl border border-slate-200">
            <HelpCircle className="w-8 h-8 text-slate-500 mb-2" />
            <span className="text-3xl font-bold text-slate-700">{dontKnow}</span>
            <span className="text-sm font-medium text-slate-600">Não Sabia</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => navigate('/desempenho')}>
          Ver Mapa de Desempenho
        </Button>
        <Button size="lg" onClick={handleFinish} className="flex items-center gap-2">
          <span>Voltar ao Início</span>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
