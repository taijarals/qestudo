import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '../components/ui/CircularProgress';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { materialService } from '../services';
import { Material } from '../domain';
import { Target, CheckCircle2, Calendar, AlertTriangle, ArrowRight, Cloud, Database, FileText } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  'Cloud Computing - Aula 01.pdf': <Cloud className="w-6 h-6 text-blue-500" />,
  'Banco de Dados - Teoria.pdf': <Database className="w-6 h-6 text-blue-500" />,
  'Direito Administrativo.pdf': <FileText className="w-6 h-6 text-pink-500" />
};

export function Dashboard() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    materialService.getMaterials().then(setMaterials);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bom dia, Taijara! 👋</h1>
          <p className="text-slate-500 mt-1">Disciplina hoje, aprovação amanhã.</p>
        </div>
        <p className="text-sm text-slate-400 italic">"Pequenos avanços, grandes resultados."</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Stats */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <CircularProgress value={68} colorClass="text-green-500" />
                <h3 className="font-bold text-lg mt-4 text-slate-900">Domínio geral</h3>
                <p className="text-sm text-slate-500 text-center">Seu progresso em todos<br />os materiais</p>
              </div>

              <div className="grid grid-cols-2 gap-8 flex-1 ml-12">
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                  <Target className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">1.248</span>
                  <span className="text-sm text-slate-500">Questões respondidas</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">76%</span>
                  <span className="text-sm text-slate-500">Taxa de acerto</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">3</span>
                  <span className="text-sm text-slate-500">Conceitos em risco</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                  <Calendar className="w-8 h-8 text-orange-500 mb-2" />
                  <span className="text-2xl font-bold text-slate-900">12</span>
                  <span className="text-sm text-slate-500">Revisões pendentes</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button size="lg" className="w-full flex items-center justify-center space-x-2" onClick={() => navigate('/estudar')}>
                <span>Continuar estudando</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Materials */}
        <div className="lg:col-span-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Seus materiais</h2>
            <button onClick={() => navigate('/materiais')} className="text-blue-600 text-sm font-medium hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {materials.filter(m => m.status === 'ready').slice(0, 3).map((material) => (
              <Card key={material.id} className="p-4 flex items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer" onClick={() => navigate('/materiais')}>
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                  {icons[material.fileName] || <FileText className="w-6 h-6 text-slate-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{material.title}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1">
                      <ProgressBar value={material.masteryScore || 0} colorClass={material.masteryScore && material.masteryScore < 40 ? 'bg-red-500' : 'bg-blue-600'} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 w-12 text-right">{material.masteryScore}%</span>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500 shrink-0 w-32">
                  <p>{material.questionCount} questões</p>
                  <p>{material.conceptCount} conceitos</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
