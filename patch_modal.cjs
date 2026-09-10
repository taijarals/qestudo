const fs = require('fs');

let code = fs.readFileSync('src/components/BatchGenerationModal.tsx', 'utf-8');

const newConsumptionHtml = `                <li className="flex justify-between mt-2 pt-2 border-t border-slate-200">
                  <span>Consumo estimado (chamadas):</span> 
                  <strong>
                    {aiStats && aiStats.aiCallsPerValidatedQuestion > 0 
                      ? \`~\${Math.ceil(aiStats.aiCallsPerValidatedQuestion * quantity)} chamadas\`
                      : 'Sem histórico suficiente'}
                  </strong>
                </li>`;

code = code.replace(/<li className="flex justify-between mt-2 pt-2 border-t border-slate-200">[\s\S]*?<\/li>/, newConsumptionHtml);

const newAsteriskHtml = `              {aiStats && aiStats.aiCallsPerValidatedQuestion > 0 && (
                 <p className="text-[10px] text-slate-400 mt-2 italic text-center">* Estimativa baseada no histórico de chamadas/questão.</p>
              )}`;

code = code.replace(/\{aiStats && aiStats\.tokensPerValidatedQuestion > 0 && \([\s\S]*?\}\)/, newAsteriskHtml);

fs.writeFileSync('src/components/BatchGenerationModal.tsx', code);
