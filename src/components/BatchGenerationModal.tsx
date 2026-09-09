import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Loader2, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { ENV } from '../config/env';

interface Props {
  materialId: string;
  scope: { id: string, name: string, type: string };
  onClose: () => void;
}

export function BatchGenerationModal({ materialId, scope, onClose }: Props) {
  const [quantity, setQuantity] = useState<number>(5);
  const [board, setBoard] = useState('CEBRASPE');
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'partial' | 'failed'>('idle');
  const [batchId, setBatchId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ generated: 0, validated: 0, requested: 0, rejected: 0, duplicates: 0 });

  const startBatch = async () => {
    setStatus('processing');
    try {
      const res = await fetch(`${ENV.API_URL}/question-batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId,
          scopeId: scope.id,
          scopeType: scope.type,
          board,
          questionType: board === 'CEBRASPE' ? 'certo-errado' : 'multipla-escolha',
          quantity
        })
      });
      const data = await res.json();
      setBatchId(data.id);
      setProgress({ ...progress, requested: data.requestedQuantity });
    } catch (e) {
      console.error(e);
      setStatus('failed');
    }
  };

  useEffect(() => {
    if (!batchId || status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${ENV.API_URL}/question-batches/${batchId}`);
        const data = await res.json();
        
        setProgress({
          generated: data.generatedCount,
          validated: data.validatedCount,
          requested: data.requestedQuantity,
          rejected: data.rejectedCount,
          duplicates: data.duplicateCount
        });

        if (data.status !== 'processing' && data.status !== 'pending') {
          setStatus(data.status);
          clearInterval(interval);
        }
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [batchId, status]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Gerar Questões</h3>
        <p className="text-sm text-slate-500 mb-6">Gerar questões sobre: <span className="font-semibold text-slate-700">{scope.name}</span></p>

        {status === 'idle' && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Escolha a banca:</label>
              <select 
                value={board} 
                onChange={e => setBoard(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CEBRASPE">CEBRASPE (Certo/Errado)</option>
                <option value="FGV">FGV (Múltipla Escolha)</option>
                <option value="FCC">FCC (Múltipla Escolha)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Quantas questões deseja gerar?</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setQuantity(n)}
                    className={`h-10 rounded-lg border font-medium transition-colors ${quantity === n ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={startBatch}>
              Iniciar Geração
            </Button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
            <div>
              <p className="font-medium text-slate-900">Gerando questões...</p>
              <p className="text-sm text-slate-500 mt-1">
                {progress.validated} de {quantity} validadas com sucesso.
              </p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 flex justify-center gap-4">
               <span>Geradas: {progress.generated}</span>
               <span>Rejeitadas/Dupl: {progress.rejected + progress.duplicates}</span>
            </div>
          </div>
        )}

        {(status === 'completed' || status === 'partial') && (
          <div className="py-6 text-center space-y-4">
            {status === 'completed' ? (
               <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            ) : (
               <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            )}
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {status === 'completed' ? 'Geração Concluída!' : 'Geração Parcial'}
              </h4>
              {status === 'completed' && <p className="text-sm text-slate-600 mt-2">{progress.validated} novas questões foram adicionadas ao banco.</p>}
              {status === 'partial' && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-100 text-left">
                  {progress.validated} novas questões foram geradas. As demais tentativas não apresentaram novidade suficiente ou não passaram na validação.
                </p>
              )}
            </div>
            <Button className="w-full mt-4" onClick={onClose}>
              Fechar e Ver Questões
            </Button>
          </div>
        )}

        {status === 'failed' && (
          <div className="py-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h4 className="text-lg font-bold text-slate-900">Erro na geração</h4>
            <p className="text-sm text-slate-600">Não foi possível concluir o lote de questões.</p>
            <Button variant="outline" className="w-full mt-4" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
