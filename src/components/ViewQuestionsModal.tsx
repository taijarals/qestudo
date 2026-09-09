import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '../domain';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface Props {
  scope: { name: string };
  questions: Question[];
  onClose: () => void;
}

export function ViewQuestionsModal({ scope, questions, onClose }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white flex flex-col relative overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Questões: {scope.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{questions.length} questões validadas</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhuma questão validada neste núcleo ainda.
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={q.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div 
                  className="p-4 bg-white hover:bg-slate-50 cursor-pointer flex gap-4 items-start"
                  onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-700">{q.board}</Badge>
                      <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-700">{q.type === 'certo-errado' ? 'Certo/Errado' : 'Múltipla Escolha'}</Badge>
                      <Badge variant="outline" className="bg-slate-100 border-slate-200 text-slate-700 capitalize">{q.difficulty}</Badge>
                      {q.coverageType && <Badge variant="blue" className="bg-purple-50 text-purple-700 border-purple-200 capitalize">{q.coverageType.replace('_', ' ')}</Badge>}
                    </div>
                    <p className="text-slate-800 line-clamp-2 text-sm font-medium">{q.statement}</p>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {expandedId === q.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
                
                {expandedId === q.id && (
                  <div className="p-5 bg-slate-50 border-t border-slate-200 text-sm">
                    <p className="font-medium text-slate-900 mb-5 whitespace-pre-wrap leading-relaxed">{q.statement}</p>
                    
                    <div className="space-y-2 mb-6">
                      {q.options?.map(opt => (
                        <div key={opt.id} className={`p-3 rounded-md border ${opt.isCorrect ? 'bg-green-50 border-green-300 font-medium text-green-900 shadow-sm' : 'bg-white border-slate-200 text-slate-700'}`}>
                          <span className="mr-2 font-bold">{opt.position === 0 ? 'A)' : opt.position === 1 ? 'B)' : opt.position === 2 ? 'C)' : opt.position === 3 ? 'D)' : 'E)'}</span>
                          {opt.text}
                          {opt.isCorrect && <span className="ml-2 text-green-600 text-xs uppercase font-bold tracking-wider float-right mt-0.5">Gabarito</span>}
                        </div>
                      ))}
                    </div>
                    
                    {q.explanation && (
                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <h5 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Explicação</h5>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
