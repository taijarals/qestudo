const fs = require('fs');

let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

// 1. Add handleMapConcepts
code = code.replace(
  /const pollProcessingStatus =/g,
  `const handleMapConcepts = async () => {
    if (!materialId) return;
    try {
      await fetch(\`\${ENV.API_URL}/materials/\${materialId}/map-concepts\`, { method: 'POST' });
      setIsProcessing(true);
      setMaterial(prev => prev ? { ...prev, status: 'mapping_concepts' } : undefined);
      pollProcessingStatus(materialId);
    } catch (e) {
      alert('Erro ao iniciar análise');
    }
  };

  const pollProcessingStatus =`
);

// 2. Update status check in loadData
code = code.replace(
  /\} else if \(m\?\.status === 'ready_for_mapping' \|\| m\?\.status === 'ready'\) \{/g,
  `} else if (m?.status === 'ready_for_mapping' || m?.status === 'ready' || m?.status === 'mapping_error') {`
);

// 3. Add UI blocks for ready_for_mapping and mapping_error, modify isProcessing view
const replacementJSX = `
      {material?.status === 'ready_for_mapping' && !isProcessing && (
        <Card className="p-6 border-blue-100 bg-blue-50/50">
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">PDF processado com sucesso.</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              {material.pageCount || '--'} páginas extraídas. Agora analise o conteúdo para identificar matérias, assuntos e conceitos.
            </p>
            <Button onClick={handleMapConcepts} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Analisar conteúdo
            </Button>
          </div>
        </Card>
      )}

      {material?.status === 'mapping_error' && !isProcessing && (
        <Card className="p-6 border-red-100 bg-red-50/50">
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Análise conceitual falhou</h3>
            <p className="text-slate-600 mb-2 max-w-md">
              PDF processado: ✓<br/>
              Páginas: {material.pageCount || '--'} ✓<br/>
              Texto extraído: ✓
            </p>
            <p className="text-red-600 font-medium mb-6 max-w-md">
              {material.processingError === 'quota_exceeded' 
                ? "Não foi possível analisar o conteúdo porque o limite da IA foi atingido. Seu PDF já está processado e não precisa ser enviado novamente." 
                : "Houve um erro ao analisar os conceitos. Seu PDF continua salvo."}
            </p>
            <Button onClick={handleMapConcepts} className="bg-red-600 hover:bg-red-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Tentar analisar novamente
            </Button>
          </div>
        </Card>
      )}

      {isProcessing && (
`;

code = code.replace(/\{isProcessing && \(/g, replacementJSX);

// 4. Wrap the Stats Card to only show when ready
code = code.replace(
  /\{\(!isProcessing\) && \(\s*<Card className="p-6">/g,
  `{(!isProcessing && material?.status === 'ready') && (\n        <Card className="p-6">`
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
