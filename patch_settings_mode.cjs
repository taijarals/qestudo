const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

const modeUI = `        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Modo de Geração</p>
            <p className="text-xl font-bold text-slate-900">{import.meta.env.VITE_AI_GENERATION_MODE || 'Balanced'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Modelo Primário</p>
            <p className="text-xl font-bold text-slate-900 truncate">{import.meta.env.VITE_GEMINI_PRIMARY_MODEL || 'gemini-1.5-flash'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Modelo de Escalonamento</p>
            <p className="text-xl font-bold text-slate-900 truncate">{import.meta.env.VITE_GEMINI_ESCALATION_MODEL || 'Não configurado'}</p>
          </Card>
        </div>`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">/, modeUI + '\n        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">');

const newStats = `            {summary?.tokensPerValidatedQuestion > 0 && (
              <p className="text-[10px] font-medium text-slate-500 mt-1">~{summary.tokensPerValidatedQuestion.toLocaleString()} tokens / quest. validada</p>
            )}
            {summary?.aiCallsPerValidatedQuestion > 0 && (
              <p className="text-[10px] font-medium text-slate-500 mt-1">~{summary.aiCallsPerValidatedQuestion} chamadas / quest. validada</p>
            )}
          </Card>`;

code = code.replace(/\{summary\?\.tokensPerValidatedQuestion > 0 && \(\s*<p className="text-\[10px\] font-medium text-slate-500 mt-1">~\{summary\.tokensPerValidatedQuestion\.toLocaleString\(\)\} \/ quest\. validada<\/p>\s*\)\}\s*<\/Card>/, newStats);

const opsMap = `
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
`;

// Replace the hardcoded operations display with the mapped array
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\s*(<Card[\s\S]*?<\/Card>\s*){3}<\/div>/, '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">' + opsMap + '</div>');

fs.writeFileSync('src/pages/Settings.tsx', code);
