const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  "import { ArrowLeft, ChevronDown, ChevronRight, FileText, Target, BookOpen, FileQuestion, GraduationCap, Play, Loader2 } from 'lucide-react';",
  "import { ArrowLeft, ChevronDown, ChevronRight, FileText, Target, BookOpen, FileQuestion, GraduationCap, Play, Loader2, Sparkles } from 'lucide-react';"
);

code = code.replace(
  "      if (m?.status === 'extracting' || m?.status === 'chunking') {",
  "      if (m?.status === 'extracting' || m?.status === 'chunking' || m?.status === 'mapping_concepts') {"
);

code = code.replace(
  "          if (data.status === 'ready_for_mapping' || data.status === 'error' || data.status === 'ready') {",
  "          if (data.status === 'ready_for_mapping' || data.status === 'error' || data.status === 'ready' || data.status === 'mapping_error') {"
);

const handleMapConceptsCode = `
  const handleMapConcepts = async () => {
    if (!material) return;
    setIsProcessing(true);
    try {
      const res = await fetch(\`\${ENV.API_URL}/materials/\${material.id}/map-concepts\`, { method: 'POST' });
      if (res.ok) {
         setMaterial({ ...material, status: 'mapping_concepts' });
         pollProcessingStatus(material.id);
      } else {
         const err = await res.json();
         alert(err.error || 'Erro ao iniciar mapeamento');
         setIsProcessing(false);
      }
    } catch (error) {
       console.error(error);
       alert('Erro de rede');
       setIsProcessing(false);
    }
  };
`;

code = code.replace("  const handleProcessMaterial", handleMapConceptsCode + "\n  const handleProcessMaterial");

const uiBadgeCode = `                  <Badge variant="warning">
                     {material.status === 'extracting' ? 'Extraindo texto...' : 'Preparando conteúdo...'}
                  </Badge>`;

const uiBadgeReplacement = `                  <Badge variant="warning">
                     {material.status === 'extracting' ? 'Extraindo texto...' : material.status === 'mapping_concepts' ? 'Identificando assuntos e conceitos...' : 'Preparando conteúdo...'}
                  </Badge>`;

code = code.replace(uiBadgeCode, uiBadgeReplacement);

const mapButtonCode = `            {material.status === 'uploaded' && (`;

const mapButtonReplacement = `
            {material.status === 'ready_for_mapping' && (
              <div className="pt-2">
                <Button onClick={handleMapConcepts} disabled={isProcessing} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                   {isProcessing ? 'Iniciando análise...' : 'Analisar conteúdo'}
                </Button>
              </div>
            )}
            {material.status === 'uploaded' && (`

code = code.replace(mapButtonCode, mapButtonReplacement);

code = code.replace(
  "{(material.status === 'extracting' || material.status === 'chunking') && processingStats && (",
  "{(material.status === 'extracting' || material.status === 'chunking' || material.status === 'mapping_concepts') && processingStats && ("
);

code = code.replace(
  "{material.status === 'error' && processingStats?.error && (",
  "{(material.status === 'error' || material.status === 'mapping_error') && processingStats?.error && ("
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
