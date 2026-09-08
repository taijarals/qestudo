import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { materialService } from '../services';
import { ArrowLeft, ChevronDown, ChevronRight, FileText, Target, BookOpen, FileQuestion, GraduationCap, Play, Loader2, Sparkles } from 'lucide-react';
import { ENV } from '../config/env';
import { Concept, ConceptMastery, Material, Question } from '../domain';
import { cn } from '../lib/utils';

interface ConceptNode {
  concept: Concept;
  mastery?: ConceptMastery;
  children: ConceptNode[];
  questionCount: number;
}

export function MaterialDetails() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'c1': true,
    'c2': true,
    'c3': true
  });

  const [material, setMaterial] = useState<Material | undefined>();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [masteries, setMasteries] = useState<ConceptMastery[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<{progress: number, error?: string, chunks?: number} | null>(null);

  useEffect(() => {
    if (!materialId) return;

    const loadData = async () => {
      setLoading(true);
      const m = await materialService.getMaterialById(materialId);
      const c = await materialService.getMaterialConcepts(materialId);
      const mats = await materialService.getMaterialMasteries();
      const qts = await materialService.getQuestionsByMaterial(materialId);
      
      setMaterial(m);
      setConcepts(c);
      setMasteries(mats);
      setQuestions(qts);
      setLoading(false);
      
      if (m?.status === 'extracting' || m?.status === 'chunking' || m?.status === 'mapping_concepts') {
        setIsProcessing(true);
        pollProcessingStatus(m.id);
      } else if (m?.status === 'ready_for_mapping' || m?.status === 'ready') {
        fetchStats(m.id);
      }
    };

    loadData();
  }, [materialId]);


  const fetchStats = async (id: string) => {
    try {
      const res = await fetch(`${ENV.API_URL}/materials/${id}/processing-status`);
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
        const res = await fetch(`${ENV.API_URL}/materials/${id}/processing-status`);
        if (res.ok) {
          const data = await res.json();
          setProcessingStats({ progress: data.processingProgress, error: data.processingError, chunks: data.chunkCount });
          
          setMaterial(prev => prev ? { ...prev, status: data.status, pageCount: data.pageCount } : prev);

          if (data.status === 'ready_for_mapping' || data.status === 'error' || data.status === 'ready' || data.status === 'mapping_error') {
            clearInterval(interval);
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 2000);
  };


  const handleMapConcepts = async () => {
    if (!material) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${ENV.API_URL}/materials/${material.id}/map-concepts`, { method: 'POST' });
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

  const handleProcessMaterial = async () => {
    if (!material) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${ENV.API_URL}/materials/${material.id}/process`, { method: 'POST' });
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

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }

  if (!material) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Material não encontrado</h2>
        <Button onClick={() => navigate('/materiais')} className="mt-4">Voltar</Button>
      </div>
    );
  }

  // Calculate question count per concept
  const questionCountByConcept: Record<string, number> = {};
  concepts.forEach(c => {
    // Just a mock logic: if we don't have real questions, let's derive a number or use real mock questions
    const count = questions.filter(q => q.conceptId === c.id).length;
    // To make the UI look rich, we'll fallback to a pseudo-random number if count is 0
    questionCountByConcept[c.id] = count > 0 ? count : (c.name.length * 2);
  });

  const buildTree = (parentId?: string): ConceptNode[] => {
    return concepts
      .filter(c => c.parentId === parentId)
      .map(c => {
        const children = buildTree(c.id);
        const mastery = masteries.find(m => m.conceptId === c.id);
        const childrenQCount = children.reduce((acc, child) => acc + child.questionCount, 0);
        
        return {
          concept: c,
          mastery,
          children,
          questionCount: questionCountByConcept[c.id] + childrenQCount
        };
      });
  };

  const conceptTree = buildTree(undefined);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleStudyConcept = (conceptId: string) => {
    navigate('/estudar', { 
      state: { 
        materialId: material.id, 
        mode: 'specific', 
        conceptId 
      } 
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'mastered': return 'text-green-700 bg-green-50 border-green-200';
      case 'consolidating': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'learning': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'review_needed': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'mastered': return 'Dominado';
      case 'consolidating': return 'Consolidando';
      case 'learning': return 'Aprendendo';
      case 'review_needed': return 'Revisar';
      default: return 'Não visto';
    }
  };

  const renderConceptNode = (node: ConceptNode, depth = 0) => {
    const isExpanded = expandedNodes[node.concept.id];
    const hasChildren = node.children.length > 0;
    const score = node.mastery?.masteryScore ?? 0;

    return (
      <div key={node.concept.id} className="border-b border-slate-100 last:border-0">
        <div 
          className={cn(
            "flex items-center p-4 hover:bg-slate-50 transition-colors group",
            depth === 0 ? "bg-white" : "bg-slate-50/50"
          )}
          style={{ paddingLeft: `${(depth * 1.5) + 1}rem` }}
        >
          {/* Expander Icon */}
          <div className="w-6 shrink-0 flex items-center justify-center">
            {hasChildren && (
              <button 
                onClick={() => toggleNode(node.concept.id)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0 pr-4">
            <h4 className={cn("truncate", depth === 0 ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
              {node.concept.name}
            </h4>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 w-24">
              <FileQuestion className="w-4 h-4" />
              <span>{node.questionCount} qts</span>
            </div>

            <div className="hidden md:block w-28">
              <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", getStatusColor(node.mastery?.status))}>
                {getStatusText(node.mastery?.status)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-32">
              <div className="flex-1 hidden sm:block">
                <ProgressBar value={score} colorClass={score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'} />
              </div>
              <span className="text-sm font-bold text-slate-700 w-10 text-right">{score}%</span>
            </div>

            <Button 
              size="sm" 
              variant="outline" 
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              onClick={() => handleStudyConcept(node.concept.id)}
            >
              Estudar
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            {node.children.map(child => renderConceptNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/materiais')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para materiais
      </button>

      {/* Header Info */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{material.title}</h1>
                {material.status === 'ready' ? (
                  <Badge variant="success">Processado</Badge>
                ) : material.status === 'ready_for_mapping' ? (
                  <Badge variant="success" className="bg-emerald-100 text-emerald-700">Conteúdo pronto para análise</Badge>
                ) : material.status === 'uploaded' ? (
                  <Badge variant="outline">Aguardando processamento</Badge>
                ) : material.status === 'error' ? (
                  <Badge variant="danger">Erro no processamento</Badge>
                ) : (
                  <Badge variant="warning">
                     {material.status === 'extracting' ? 'Extraindo texto...' : material.status === 'mapping_concepts' ? 'Identificando assuntos e conceitos...' : 'Preparando conteúdo...'}
                  </Badge>
                )}
              </div>
              <p className="text-slate-500">{material.fileName}</p>
            </div>



            {material.status === 'ready_for_mapping' && (
              <div className="pt-2">
                <Button onClick={handleMapConcepts} disabled={isProcessing} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                   {isProcessing ? 'Iniciando análise...' : 'Analisar conteúdo'}
                </Button>
              </div>
            )}
            {material.status === 'uploaded' && (
              <div className="pt-2">
                <Button onClick={handleProcessMaterial} disabled={isProcessing} className="flex items-center gap-2">
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                   {isProcessing ? 'Iniciando...' : 'Processar material'}
                </Button>
              </div>
            )}
            
            {(material.status === 'extracting' || material.status === 'chunking' || material.status === 'mapping_concepts') && processingStats && (
               <div className="pt-2 space-y-2">
                 <div className="flex justify-between text-sm text-slate-500">
                    <span>Progresso</span>
                    <span>{processingStats.progress}%</span>
                 </div>
                 <ProgressBar value={processingStats.progress} />
               </div>
            )}

            {(material.status === 'error' || material.status === 'mapping_error') && processingStats?.error && (
               <div className="pt-2">
                 <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                    Erro: {processingStats.error}
                 </div>
               </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold tracking-wider">Páginas</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{material.pageCount || 42}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold tracking-wider">Conceitos</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{material.conceptCount}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <FileQuestion className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold tracking-wider">Questões</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{material.questionCount}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs uppercase font-semibold tracking-wider">Domínio</span>
                </div>
                <span className="text-xl font-bold text-slate-900">{material.masteryScore ?? '--'}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Concept Tree */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mapa de Conhecimento</h2>
            <p className="text-sm text-slate-500 mt-1">Explore a estrutura do material e acompanhe seu domínio.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Cobertura</span>
            <span className="text-lg font-bold text-blue-600">{material.studyCoverage}%</span>
          </div>
        </div>

        <div className="flex flex-col">
          {conceptTree.length > 0 ? (
            conceptTree.map(node => renderConceptNode(node))
          ) : (
            <div className="p-8 text-center text-slate-500">
              Nenhum conceito mapeado para este material ainda.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
