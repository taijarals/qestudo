const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');

// Replace Summary display
code = code.replace(
  /<p className="text-2xl font-bold text-slate-900">\{summary\?\.promptTokens\?\.toLocaleString\(\) \?\? '--'\}<\/p>/g,
  '<p className="text-2xl font-bold text-slate-900">{summary?.promptTokens != null ? summary.promptTokens.toLocaleString() : \'--\'}</p>'
);

code = code.replace(
  /<p className="text-2xl font-bold text-slate-900">\{summary\?\.outputTokens\?\.toLocaleString\(\) \?\? '--'\}<\/p>/g,
  '<p className="text-2xl font-bold text-slate-900">{summary?.outputTokens != null ? summary.outputTokens.toLocaleString() : \'--\'}</p>'
);

const totalTokensReplace = `<Card className="p-4">
            <p className="text-xs uppercase font-bold text-slate-500 mb-1">Tokens totais</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-blue-600">{summary?.totalTokens != null ? summary.totalTokens.toLocaleString() : '--'}</p>
              {summary?.hasMissingTokenData && (
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold" title="Algumas chamadas não retornaram dados de tokens">Parcial</span>
              )}
            </div>
            {summary?.tokensPerValidatedQuestion > 0 && (
              <p className="text-[10px] font-medium text-slate-500 mt-1">~{summary.tokensPerValidatedQuestion.toLocaleString()} / quest. validada</p>
            )}
          </Card>`;

const oldTotalTokensRegex = /<Card className="p-4">\s*<p className="text-xs uppercase font-bold text-slate-500 mb-1">Tokens totais<\/p>\s*<p className="text-2xl font-bold text-blue-600">\{summary\?\.totalTokens\?\.toLocaleString\(\) \?\? '--'\}<\/p>\s*\{summary\?\.tokensPerValidatedQuestion > 0 && \(\s*<p className="text-\[10px\] font-medium text-slate-500 mt-1">~\{summary\.tokensPerValidatedQuestion\.toLocaleString\(\)\} \/ quest\. validada<\/p>\s*\)\}\s*<\/Card>/;

code = code.replace(oldTotalTokensRegex, totalTokensReplace);

// Replace Operations tokens
code = code.replace(
  /<p className="text-lg font-bold text-slate-900">\{summary\?\.operations\?\.concept_mapping\?\.totalTokens\?\.toLocaleString\(\) \?\? '--'\} <span className="text-xs font-normal text-slate-500">tokens<\/span><\/p>/g,
  '<p className="text-lg font-bold text-slate-900">{summary?.operations?.concept_mapping?.totalTokens != null ? summary.operations.concept_mapping.totalTokens.toLocaleString() : \'--\'} <span className="text-xs font-normal text-slate-500">tokens</span></p>'
);

code = code.replace(
  /<p className="text-lg font-bold text-slate-900">\{summary\?\.operations\?\.question_generation\?\.totalTokens\?\.toLocaleString\(\) \?\? '--'\} <span className="text-xs font-normal text-slate-500">tokens<\/span><\/p>/g,
  '<p className="text-lg font-bold text-slate-900">{summary?.operations?.question_generation?.totalTokens != null ? summary.operations.question_generation.totalTokens.toLocaleString() : \'--\'} <span className="text-xs font-normal text-slate-500">tokens</span></p>'
);

code = code.replace(
  /<p className="text-lg font-bold text-slate-900">\{summary\?\.operations\?\.question_validation\?\.totalTokens\?\.toLocaleString\(\) \?\? '--'\} <span className="text-xs font-normal text-slate-500">tokens<\/span><\/p>/g,
  '<p className="text-lg font-bold text-slate-900">{summary?.operations?.question_validation?.totalTokens != null ? summary.operations.question_validation.totalTokens.toLocaleString() : \'--\'} <span className="text-xs font-normal text-slate-500">tokens</span></p>'
);

// Format Time properly with America/Bahia timezone
code = code.replace(
  /\{new Date\(item\.createdAt\)\.toLocaleTimeString\(\[\], \{ hour: '2-digit', minute: '2-digit', second: '2-digit' \}\)\}/g,
  "{new Date(item.createdAt).toLocaleTimeString('pt-BR', { timeZone: 'America/Bahia', hour: '2-digit', minute: '2-digit', second: '2-digit' })}"
);

// Ensure status formatting doesn't break
code = code.replace(
  /\{item\.totalTokens \? item\.totalTokens\.toLocaleString\(\) : '--'\}/g,
  "{item.totalTokens != null ? item.totalTokens.toLocaleString() : '--'}"
);

fs.writeFileSync('src/pages/Settings.tsx', code);
