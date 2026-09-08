import React from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockErrors } from '../mocks/data';
import { Cloud, Database, ExternalLink } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  'Cloud Computing': <Cloud className="w-6 h-6 text-blue-500" />,
  'Banco de Dados': <Database className="w-6 h-6 text-blue-500" />,
};

export function ErrorNotebook() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Caderno de erros</h1>
        <p className="text-slate-500 mt-1">Revise seus principais pontos de atenção.</p>
      </header>

      <div className="flex gap-4 mb-6">
        <Badge variant="blue" className="px-4 py-2 text-sm cursor-pointer">Por assunto</Badge>
        <Badge variant="default" className="px-4 py-2 text-sm bg-white cursor-pointer hover:bg-slate-50">Todas as questões</Badge>
      </div>

      <div className="space-y-6">
        {mockErrors.map((errorGroup) => (
          <Card key={errorGroup.id} className="overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  {icons[errorGroup.subject] || <div className="w-6 h-6 text-slate-400" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{errorGroup.subject}</h3>
              </div>
              <Badge variant="danger" className="text-sm px-3 py-1">{errorGroup.errorCount} erros</Badge>
            </div>
            <div className="p-0">
              {errorGroup.concepts.map((concept, index) => (
                <div key={index} className="flex items-center justify-between p-4 px-6 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    <span className="text-slate-700 font-medium">{concept.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold text-slate-900">{concept.count}</span>
                    <button className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-blue-50 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
