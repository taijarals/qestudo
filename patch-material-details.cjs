const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  "import { ArrowLeft, ChevronDown, ChevronRight, FileText, Target, BookOpen, FileQuestion, GraduationCap } from 'lucide-react';",
  "import { ArrowLeft, ChevronDown, ChevronRight, FileText, Target, BookOpen, FileQuestion, GraduationCap, Play, Loader2 } from 'lucide-react';\nimport { ENV } from '../config/env';"
);

code = code.replace(
  "  const [loading, setLoading] = useState(true);",
  "  const [loading, setLoading] = useState(true);\n  const [isProcessing, setIsProcessing] = useState(false);\n  const [processingStats, setProcessingStats] = useState<{progress: number, error?: string, chunks?: number} | null>(null);"
);

const fetchCode = `
      setMaterial(m);
      setConcepts(c);
      setMasteries(mats);
      setQuestions(qts);
      setLoading(false);
`;

const fetchReplacement = `
      setMaterial(m);
      setConcepts(c);
      setMasteries(mats);
      setQuestions(qts);
      setLoading(false);
      
      if (m?.status === 'extracting' || m?.status === 'chunking') {
        setIsProcessing(true);
        pollProcessingStatus(m.id);
      } else if (m?.status === 'ready_for_mapping' || m?.status === 'ready') {
        fetchStats(m.id);
      }
`;

code = code.replace(fetchCode, fetchReplacement);

const newMethods = `
  const fetchStats = async (id: string) => {
    try {
      const res = await fetch(\`\${ENV.API_URL}/materials/\${id}/processing-status\`);
      if (res.ok) {
        const data = await res.json();
        setProcessingStats({ progress: data.processingProgress, error: data.processingError, chunks: data.chunkCount });
        if (material) {
           setMaterial({ ...material, status: data.status, pageCount: data.pageCount });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pollProcessingStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(\`\${ENV.API_URL}/materials/\${id}/processing-status\`);
        if (res.ok) {
          const data = await res.json();
          setProcessingStats({ progress: data.processingProgress, error: data.processingError, chunks: data.chunkCount });
          
          setMaterial(prev => prev ? { ...prev, status: data.status, pageCount: data.pageCount } : prev);

          if (data.status === 'ready_for_mapping' || data.status === 'error' || data.status === 'ready') {
            clearInterval(interval);
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 2000);
  };

  const handleProcessMaterial = async () => {
    if (!material) return;
    setIsProcessing(true);
    try {
      const res = await fetch(\`\${ENV.API_URL}/materials/\${material.id}/process\`, { method: 'POST' });
      if (res.ok) {
         setMaterial({ ...material, status: 'extracting' });
         pollProcessingStatus(material.id);
      } else {
         const err = await res.json();
         alert(err.error || 'Erro ao iniciar processamento');
         setIsProcessing(false);
      }
    } catch (error) {
       console.error(error);
       alert('Erro de rede');
       setIsProcessing(false);
    }
  };
`;

code = code.replace("  if (loading) {", newMethods + "\n  if (loading) {");

const uiCode = `                {material.status === 'ready' ? (
                  <Badge variant="success">Processado</Badge>
                ) : (
                  <Badge variant="warning">Em processamento</Badge>
                )}`;

const uiReplacement = `                {material.status === 'ready' ? (
                  <Badge variant="success">Processado</Badge>
                ) : material.status === 'ready_for_mapping' ? (
                  <Badge variant="success" className="bg-emerald-100 text-emerald-700">Conteúdo pronto para análise</Badge>
                ) : material.status === 'uploaded' ? (
                  <Badge variant="secondary">Aguardando processamento</Badge>
                ) : material.status === 'error' ? (
                  <Badge variant="destructive">Erro no processamento</Badge>
                ) : (
                  <Badge variant="warning">
                     {material.status === 'extracting' ? 'Extraindo texto...' : 'Preparando conteúdo...'}
                  </Badge>
                )}`;

code = code.replace(uiCode, uiReplacement);

const actionCode = `            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100">`;

const actionReplacement = `
            {material.status === 'uploaded' && (
              <div className="pt-2">
                <Button onClick={handleProcessMaterial} disabled={isProcessing} className="flex items-center gap-2">
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                   {isProcessing ? 'Iniciando...' : 'Processar material'}
                </Button>
              </div>
            )}
            
            {(material.status === 'extracting' || material.status === 'chunking') && processingStats && (
               <div className="pt-2 space-y-2">
                 <div className="flex justify-between text-sm text-slate-500">
                    <span>Progresso</span>
                    <span>{processingStats.progress}%</span>
                 </div>
                 <ProgressBar value={processingStats.progress} />
               </div>
            )}

            {material.status === 'error' && processingStats?.error && (
               <div className="pt-2">
                 <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                    Erro: {processingStats.error}
                 </div>
               </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100">`;

code = code.replace(actionCode, actionReplacement);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
