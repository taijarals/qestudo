const fs = require('fs');
let code = fs.readFileSync('src/components/BatchGenerationModal.tsx', 'utf-8');

code = code.replace(
  /<p className="text-sm text-slate-500 mb-6">Escopo: <span className="font-semibold text-slate-700">\{scope\.name\}<\/span><\/p>/,
  '<p className="text-sm text-slate-500 mb-6">Gerar questões sobre: <span className="font-semibold text-slate-700">{scope.name}</span></p>'
);

code = code.replace(
  /<label className="text-sm font-semibold text-slate-900 block mb-2">Banca<\/label>/,
  '<label className="text-sm font-semibold text-slate-900 block mb-2">Escolha a banca:</label>'
);

code = code.replace(
  /<label className="text-sm font-semibold text-slate-900 block mb-2">Quantidade<\/label>/,
  '<label className="text-sm font-semibold text-slate-900 block mb-2">Quantas questões deseja gerar?</label>'
);

code = code.replace(
  /O conteúdo restante apresentou baixa novidade ou não passou na validação\. O potencial deste núcleo pode estar esgotado\./,
  '{progress.validated} novas questões foram geradas. As demais tentativas não apresentaram novidade suficiente ou não passaram na validação.'
);

code = code.replace(
  /<p className="text-sm text-slate-600 mt-2">\s*\{progress\.validated\} novas questões foram adicionadas ao banco\.\s*<\/p>/,
  `{status === 'completed' && <p className="text-sm text-slate-600 mt-2">{progress.validated} novas questões foram adicionadas ao banco.</p>}`
);

fs.writeFileSync('src/components/BatchGenerationModal.tsx', code);
