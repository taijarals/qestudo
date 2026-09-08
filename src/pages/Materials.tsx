import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { mockMaterials } from '../mocks/data';
import { Upload, Cloud, Database, FileText, FileBadge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getIcon = (title: string) => {
  if (title.includes('Cloud')) return <Cloud className="w-8 h-8 text-blue-500" />;
  if (title.includes('Banco')) return <Database className="w-8 h-8 text-blue-500" />;
  if (title.includes('Direito')) return <FileText className="w-8 h-8 text-pink-500" />;
  return <FileBadge className="w-8 h-8 text-slate-500" />;
};

export function Materials() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'todos' | 'processamento' | 'concluidos'>('todos');

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus materiais</h1>
          <p className="text-slate-500 mt-1">Envie seus PDFs e acompanhe seu progresso.</p>
        </div>
        <Button className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>Enviar PDF</span>
        </Button>
      </header>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'todos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Todos ({mockMaterials.length})
        </button>
        <button
          onClick={() => setActiveTab('processamento')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'processamento' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Em processamento (1)
        </button>
        <button
          onClick={() => setActiveTab('concluidos')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'concluidos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Concluídos (5)
        </button>
      </div>

      <div className="space-y-4">
        {mockMaterials.map((material) => (
          <Card key={material.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
              {getIcon(material.title)}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{material.fileName}</h3>
                <div className="mt-2">
                  {material.status === 'ready' ? (
                    <Badge variant="success">Processado</Badge>
                  ) : (
                    <Badge variant="warning">Em processamento</Badge>
                  )}
                </div>
              </div>

              {material.status === 'ready' && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <ProgressBar value={material.masteryScore || 0} />
                  </div>
                  <span className="font-bold text-slate-900">{material.masteryScore}%</span>
                </div>
              )}
              
              <div className="text-sm text-slate-500 flex items-center gap-4">
                <span>{material.conceptCount} conceitos</span>
                <span>{material.questionCount} questões</span>
                {material.masteryScore !== null && <span>Domínio: {material.masteryScore}%</span>}
                {material.masteryScore === null && <span>Domínio: --</span>}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              {material.status === 'ready' ? (
                <>
                  <Button onClick={() => navigate('/estudar')} className="w-full sm:w-32">Estudar</Button>
                  <Button variant="outline" className="w-full sm:w-32">Ver conteúdo</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" disabled className="w-full sm:w-32">Aguarde</Button>
                  <Button variant="outline" className="w-full sm:w-32">Ver detalhes</Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
