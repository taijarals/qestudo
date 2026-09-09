const fs = require('fs');
const code = `import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Badge } from '../components/ui/Badge';
import { CheckCircle2, XCircle, HelpCircle, Target, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudySession } from '../context/StudySessionContext';

export function SessionResult() {
  const navigate = useNavigate();
  const { activeSession, answers, endSession, startSession } = useStudySession();

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sessão não encontrada</h2>
        <p className="text-slate-500 mb-6">Não há resultados para exibir.</p>
        <Button onClick={() => navigate('/estudar')}>Voltar para materiais</Button>
      </div>
    );
  }

  const total = activeSession.quantity || answers.length;
  const answered = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  const dontKnow = answers.filter(a => a.responseType === 'dont_know').length;
  const wrong = answered - correct - dontKnow;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  let durationText = '--';
  if (activeSession.startedAt) {
    const end = activeSession.finishedAt ? new Date(activeSession.finishedAt) : new Date();
    const start = new Date(activeSession.startedAt);
    const ms = end.getTime() - start.getTime();
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    durationText = \`\${mins}m \${secs}s\`;
  }

  const handleFinish = () => {
    endSession();
    navigate('/');
  };

  const handleNewSession = () => {
    endSession();
    navigate('/estudar');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sessão Concluída! 🎉</h1>
          <p className="text-slate-500 mt-1">Resumo do seu desempenho.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-slate-700 font-medium">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Duração: {durationText}</span>
        </div>
      </header>

      <Card className="p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center shrink-0">
          <CircularProgress value={score} size={140} strokeWidth={10} colorClass={score >= 70 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'} />
          <span className="text-sm font-semibold text-slate-500 mt-4 uppercase tracking-wider">Desempenho</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
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

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button size="lg" className="flex-1 h-12" onClick={handleNewSession}>
          Nova sessão
        </Button>
        <Button size="lg" variant="outline" className="flex-1 h-12" onClick={handleFinish}>
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/SessionResult.tsx', code);
