import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { ENV } from '../config/env';
import { Loader2, Activity, Database, Zap, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export function Settings() {
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, histRes] = await Promise.all([
          fetch(`${ENV.API_URL}/ai-usage/summary`),
          fetch(`${ENV.API_URL}/ai-usage/history`)
        ]);
        
        if (sumRes.ok) setSummary(await sumRes.json());
        if (histRes.ok) setHistory(await histRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie as preferências e controle o uso do sistema.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" /> Uso de IA
        </h2>
        
        {/* Protection Settings */}
        <Card className="p-5 border-blue-100 bg-blue-50/30">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Proteção de consumo
          </h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span>Máximo de tentativas por questão</span>
              <span className="font-semibold bg-white px-2 py-1 rounded shadow-sm">Adaptativo (mín 2)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-100">
              <span>Parar lote após rejeições consecutivas</span>
              <span className="font-semibold bg-white px-2 py-1 rounded shadow-sm">3 tentativas</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Parar imediatamente ao atingir quota</span>
              <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm">Sempre ativado</span>
            </div>
          </div>
        </Card>

        {/* Global Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Chamadas hoje</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.calls ?? '--'}</p>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-green-600">{summary?.successfulCalls ?? 0} suc</span> · <span className="text-red-500">{summary?.failedCalls ?? 0} falhas</span>
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Tokens de entrada</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.promptTokens != null ? summary.promptTokens.toLocaleString() : '--'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Tokens de saída</p>
            <p className="text-2xl font-bold text-slate-900">{summary?.outputTokens != null ? summary.outputTokens.toLocaleString() : '--'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Tokens totais</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-blue-600">{summary?.totalTokens != null ? summary.totalTokens.toLocaleString() : '--'}</p>
              {summary?.hasMissingTokenData && summary?.totalTokens != null && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold" title="Algumas chamadas não retornaram dados de tokens">Parcial</span>
              )}
            </div>
                        {summary?.tokensPerValidatedQuestion > 0 && (
              <p className="text-[10px] font-medium text-slate-500 mt-1">~{summary.tokensPerValidatedQuestion.toLocaleString()} tokens / quest. validada</p>
            )}
            {summary?.aiCallsPerValidatedQuestion > 0 && (
              <p className="text-[10px] font-medium text-slate-500 mt-1">~{summary.aiCallsPerValidatedQuestion} chamadas / quest. validada</p>
            )}
          </Card>
        </div>

        {/* By Operation */}
        <h3 className="font-bold text-slate-800 mt-6 mb-3">Uso por atividade</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['concept_mapping', 'question_generation', 'question_validation', 'question_batch_generation', 'question_batch_validation', 'question_escalation_validation'].map(opKey => {
            const opData = summary?.operations?.[opKey as keyof typeof summary.operations];
            if (!opData || opData.calls === 0) return null;
            
            const titles: Record<string, string> = {
              concept_mapping: 'Mapeamento de Conceitos',
              question_generation: 'Geração de Questão (Legado)',
              question_validation: 'Validação de Questão (Legado)',
              question_batch_generation: 'Geração em Lote',
              question_batch_validation: 'Validação em Lote',
              question_escalation_validation: 'Validação com Escalonamento'
            };
            
            return (
              <Card key={opKey} className="p-4 border-l-4 border-blue-500">
                <p className="text-sm font-bold text-slate-700 mb-2">{titles[opKey]}</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Chamadas:</span>
                    <span className="text-sm font-semibold">{opData.calls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Sucessos:</span>
                    <span className="text-sm font-semibold text-emerald-600">{opData.successfulCalls}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Falhas:</span>
                    <span className="text-sm font-semibold text-rose-600">{opData.failedCalls}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                    <span className="text-xs text-slate-500">Consumo:</span>
                    <span className="text-sm font-bold text-slate-900">{opData.totalTokens != null ? opData.totalTokens.toLocaleString() : '--'} <span className="text-[10px] font-normal text-slate-500">tokens</span></span>
                  </div>
                </div>
              </Card>
            );
          })}
</div>

        {/* History Table */}
        <h3 className="font-bold text-slate-800 mt-8 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Histórico recente
        </h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Horário</th>
                  <th className="px-4 py-3 font-semibold">Operação</th>
                  <th className="px-4 py-3 font-semibold">Modelo</th>
                  <th className="px-4 py-3 font-semibold text-right">Tokens</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(item.createdAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Bahia', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {item.operation === 'concept_mapping' ? 'Mapeamento' : 
                       item.operation === 'question_generation' ? 'Geração' : 'Validação'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{item.model}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {item.totalTokens != null ? item.totalTokens.toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Sucesso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full" title={item.errorMessage || item.errorType}>
                          <XCircle className="w-3 h-3" /> {item.errorType || 'Erro'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Nenhum registro de uso encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </section>
    </div>
  );
}
