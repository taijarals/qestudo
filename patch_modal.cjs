const fs = require('fs');
let code = fs.readFileSync('src/components/BatchGenerationModal.tsx', 'utf-8');

// Add stats state
code = code.replace("const [progress, setProgress] = useState", "const [aiStats, setAiStats] = useState<any>(null);\n  const [progress, setProgress] = useState");

// Add useEffect to load stats
const effectInsertion = `  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(\`\${ENV.API_URL}/ai-usage/summary\`);
        if (res.ok) setAiStats(await res.json());
      } catch (e) {
        console.error(e);
      }
    }
    fetchStats();
  }, []);
`;
code = code.replace("const startBatch =", effectInsertion + "\n  const startBatch =");

// Status type
code = code.replace("status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'partial' | 'failed'>", "status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'partial' | 'failed' | 'paused_quota'>");

// Update status in interval
const intervalUpdate = `if (data.status !== 'processing' && data.status !== 'pending') {
          setStatus(data.status);`;
code = code.replace(intervalUpdate, intervalUpdate);

// Add estimation text
const idleContentRegex = /<Button className="w-full" onClick={startBatch}>/;
const estimationCode = `
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4 mb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Informações de Consumo</h4>
              <ul className="text-sm space-y-1 text-slate-700">
                <li className="flex justify-between"><span>Questões solicitadas:</span> <strong>{quantity}</strong></li>
                <li className="flex justify-between"><span>Máximo de tentativas:</span> <strong>{Math.max(2, Math.ceil(quantity * 1.5))}</strong></li>
                <li className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                  <span>Consumo estimado:</span> 
                  <strong>
                    {aiStats && aiStats.tokensPerValidatedQuestion > 0 
                      ? \`~\${(aiStats.tokensPerValidatedQuestion * quantity).toLocaleString()} tokens\`
                      : 'Sem histórico suficiente'}
                  </strong>
                </li>
              </ul>
              {aiStats && aiStats.tokensPerValidatedQuestion > 0 && (
                 <p className="text-[10px] text-slate-400 mt-2 italic text-center">* Estimativa baseada no histórico médio de {aiStats.tokensPerValidatedQuestion.toLocaleString()} tokens/questão.</p>
              )}
            </div>
            <Button className="w-full" onClick={startBatch}>`;
code = code.replace(idleContentRegex, estimationCode);

// Add paused_quota UI
const failedRegex = /\{status === 'failed' && \(/;
const pausedQuotaCode = `{(status === 'failed' || status === 'paused_quota') && (
          <div className="py-6 text-center space-y-4">
            <AlertTriangle className={\`w-12 h-12 mx-auto \${status === 'paused_quota' ? 'text-amber-500' : 'text-red-500'}\`} />
            <h4 className="text-lg font-bold text-slate-900">
              {status === 'paused_quota' ? 'Limite Atingido' : 'Erro na geração'}
            </h4>
            <p className="text-sm text-slate-600">
              {status === 'paused_quota' ? 'A geração foi pausada para evitar novas tentativas.' : 'Não foi possível gerar as questões.'}
            </p>
            {errorMessage && (
              <p className={\`text-xs mt-2 p-2 rounded border text-left \${status === 'paused_quota' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-100'}\`}>
                {errorMessage}
              </p>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}`;
code = code.replace(/\{status === 'failed' && \([\s\S]*?\}\)}/, pausedQuotaCode);


fs.writeFileSync('src/components/BatchGenerationModal.tsx', code);
