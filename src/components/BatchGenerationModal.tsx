
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
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'partial' | 'failed' | 'paused_quota'>('idle');
  const [batchId, setBatchId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiStats, setAiStats] = useState<any>(null);
  const [progress, setProgress] = useState({ generated: 0, validated: 0, requested: 0, rejected: 0, duplicates: 0 });

    useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`${ENV.API_URL}/ai-usage/summary`);
        if (res.ok) setAiStats(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    fetchStats();
  }, []);

  const startBatch = async () => {
    setStatus('processing');
    setErrorMessage(null);
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
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erro ao iniciar lote');
      }
      
      setBatchId(data.id);
      setProgress({ ...progress, requested: data.requestedQuantity });
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message);
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
          if (data.errorMessage) {
            setErrorMessage(data.errorMessage);
          }
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

            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Informações de Consumo</h4>
              <ul className="text-sm space-y-1 text-slate-700">
                <li className="flex justify-between"><span>Questões solicitadas:</span> <strong>{quantity}</strong></li>
                <li className="flex justify-between"><span>Máximo de tentativas:</span> <strong>{Math.max(2, Math.ceil(quantity * 1.5))}</strong></li>
                                <li className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                  <span>Consumo estimado (chamadas):</span> 
                  <strong>
                    {aiStats && aiStats.aiCallsPerValidatedQuestion > 0 
                      ? `~${Math.ceil(aiStats.aiCallsPerValidatedQuestion * quantity)} chamadas`
                      : 'Sem histórico suficiente'}
                  </strong>
                </li>
              </ul>
              {aiStats && aiStats.tokensPerValidatedQuestion > 0 && (
                 <p className="text-[10px] text-slate-400 mt-2 italic text-center">* Estimativa baseada no histórico médio de {aiStats.tokensPerValidatedQuestion.toLocaleString()} tokens/questão.</p>
              )}
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
              {status === 'completed' && <p className="text-sm text-slate-600 mt-2">{progress.validated} {progress.validated === 1 ? 'nova questão foi adicionada' : 'novas questões foram adicionadas'} ao banco.</p>}
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
            <p className="text-sm text-slate-600">Não foi possível gerar as questões.</p>
            {errorMessage && (
              <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100 text-left">
                {errorMessage}
              </p>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
