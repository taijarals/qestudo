import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';
import { performanceService } from '../services';
import { ConceptPerformance } from '../types';
import { ChevronRight, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Dominado': return 'bg-green-500';
    case 'Em consolidação': return 'bg-amber-400';
    case 'Aprendendo': return 'bg-orange-500';
    case 'Precisa revisar': return 'bg-red-500';
    default: return 'bg-slate-300';
  }
};

export function Performance() {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ 'c2': true });
  const [performanceData, setPerformanceData] = useState<ConceptPerformance[]>([]);

  useEffect(() => {
    performanceService.getPerformanceData().then(setPerformanceData);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cloud Computing</h1>
        </div>
      </header>

      <div className="flex gap-6 border-b border-slate-200">
        <button className="px-4 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600">Visão geral</button>
        <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700">Mapa de conhecimento</button>
        <button className="px-4 py-3 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700">Estatísticas</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <CircularProgress value={64} size={100} strokeWidth={8} colorClass="text-blue-500" />
          <p className="text-sm text-slate-500 mt-4 font-medium">Domínio no material</p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center bg-slate-50">
          <span className="text-4xl font-bold text-slate-900">118</span>
          <p className="text-sm text-slate-500 mt-2 font-medium">Questões respondidas</p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center bg-slate-50">
          <span className="text-4xl font-bold text-green-600">76%</span>
          <p className="text-sm text-slate-500 mt-2 font-medium">Taxa de acerto</p>
        </Card>
      </div>

      <Card className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-xl text-slate-900">Desempenho por assunto</h3>
          <select className="border-none bg-slate-100 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 outline-none">
            <option>Todos os assuntos</option>
          </select>
        </div>

        <div className="space-y-4">
          {performanceData.map((item) => (
            <div key={item.id} className="border border-slate-100 rounded-xl overflow-hidden">
              <div 
                className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${item.children ? 'cursor-pointer' : ''}`}
                onClick={() => item.children && toggleExpand(item.id)}
              >
                <div className="flex items-center gap-3 w-1/3">
                  {item.children ? (
                    expandedItems[item.id] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />
                  ) : (
                    <div className="w-5 h-5" />
                  )}
                  <span className="font-semibold text-slate-800">{item.name}</span>
                </div>
                
                <div className="flex-1 px-8">
                  <ProgressBar value={item.domain} colorClass={getStatusColor(item.status)} bgColorClass="bg-slate-200" className="h-3" />
                </div>
                
                <div className="w-16 text-right font-bold text-slate-700">
                  {item.domain}%
                </div>
              </div>

              {item.children && expandedItems[item.id] && (
                <div className="bg-slate-50 border-t border-slate-100">
                  {item.children.map(child => (
                    <div key={child.id} className="p-4 pl-12 flex items-center justify-between border-b border-slate-100 last:border-0 hover:bg-slate-100 transition-colors">
                      <div className="w-1/3 text-sm font-medium text-slate-600">
                        {child.name}
                      </div>
                      <div className="flex-1 px-8">
                        <ProgressBar value={child.domain} colorClass={getStatusColor(child.status)} bgColorClass="bg-slate-200" className="h-2" />
                      </div>
                      <div className="w-16 text-right font-semibold text-sm text-slate-700">
                        {child.domain}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 items-center justify-center text-xs font-medium text-slate-600 bg-slate-50 p-4 rounded-xl">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Dominado</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Em consolidação</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Aprendendo</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Precisa revisar</div>
        </div>
      </Card>
    </div>
  );
}
