const fs = require('fs');

let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

// Unwrap the Stats card
code = code.replace(
  /\{\(!isProcessing && material\?\.status === 'ready'\) && \(\s*<Card className="p-6">/,
  `{(!isProcessing) && (\n        <Card className="p-6">`
);

// Modify the buttons inside the Stats card
const originalButtons = `<div className="flex gap-3">
              <Button onClick={() => { setBatchScope({ id: material.id, name: 'Material Completo', type: 'material' }); setIsBatchModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar questões do material
              </Button>
              <Button onClick={handleStudyMaterial} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Play className="w-4 h-4 mr-2" />
                Estudar
              </Button>
            </div>`;

const newButtons = `
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-3">
                <Button 
                  onClick={() => { setBatchScope({ id: material.id, name: 'Material Completo', type: 'material' }); setIsBatchModalOpen(true); }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  disabled={material.status !== 'ready'}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar questões do material
                </Button>
                <Button 
                  onClick={handleStudyMaterial} 
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:border-slate-200 disabled:text-slate-400"
                  disabled={material.status !== 'ready'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Estudar
                </Button>
              </div>
              {material.status !== 'ready' && (
                <span className="text-xs text-red-500 pr-1">Analise o conteúdo antes de gerar questões ou estudar.</span>
              )}
            </div>`;

code = code.replace(originalButtons, newButtons);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
