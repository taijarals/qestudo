import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { materialService } from '../services';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, FileText, Target, BookOpen, FileQuestion, Sparkles, Loader2, Play, Trash2 } from 'lucide-react';
import { ENV } from '../config/env';
import { Concept, Material, Question } from '../domain';
import { BatchGenerationModal } from '../components/BatchGenerationModal';
import { ViewQuestionsModal } from '../components/ViewQuestionsModal';

interface ConceptNode {
  concept: Concept;
  children: ConceptNode[];
  leafConceptIds: string[];
}

export function MaterialDetails() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [material, setMaterial] = useState<Material | undefined>();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [coverageTree, setCoverageTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<{progress: number, error?: string, chunks?: number} | null>(null);
  
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchScope, setBatchScope] = useState<{id: string, name: string, type: string} | null>(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewScope, setViewScope] = useState<{name: string, questions: Question[]} | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  
  const handleDeleteMaterial = async () => {
    if (!materialId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${ENV.API_URL}/materials/${materialId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        navigate('/materiais');
      } else {
        const error = await res.json();
        alert('Erro ao excluir material: ' + (error.error || error.message));
        setIsDeleting(false);
      }
    } catch (e: any) {
      alert('Erro de conexão ao excluir material.');
      setIsDeleting(false);
    }
  };

  const loadData = async () => {
    if (!materialId) return;
    setLoading(true);
    
    try {
      const m = await materialService.getMaterialById(materialId);
      const c = await materialService.getMaterialConcepts(materialId);
      const qts = await materialService.getQuestionsByMaterial(materialId);
      
      setMaterial(m);
      setConcepts(c);
      setQuestions(qts);
      
      const covRes = await fetch(`${ENV.API_URL}/materials/${materialId}/coverage-tree`);
      if (covRes.ok) setCoverageTree(await covRes.json());
      
      setLoading(false);
      
      if (m?.status === 'extracting' || m?.status === 'chunking' || m?.status === 'mapping_concepts') {
        setIsProcessing(true);
        pollProcessingStatus(m.id);
      } else if (m?.status === 'ready_for_mapping' || m?.status === 'ready' || m?.status === 'mapping_error') {
        fetchStats(m.id);
        
        // Auto expand top level nodes initially
        const roots = c.filter(x => !x.parentId);
        const toExpand: Record<string, boolean> = {};
        roots.forEach(r => {
          toExpand[r.id] = true;
          c.filter(x => x.parentId === r.id).forEach(sub => toExpand[sub.id] = true);
        });
        setExpandedNodes(prev => ({ ...toExpand, ...prev }));
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [materialId]);

  const handleMapConcepts = async () => {
    if (!materialId) return;
    try {
      await fetch(`${ENV.API_URL}/materials/${materialId}/map-concepts`, { method: 'POST' });
      setIsProcessing(true);
      setMaterial(prev => prev ? { ...prev, status: 'mapping_concepts' } : undefined);
      pollProcessingStatus(materialId);
    } catch (e) {
      alert('Erro ao iniciar análise');
    }
  };

  const pollProcessingStatus = (id: string) => {
    const interval = setInterval(async () => {
      const m = await materialService.getMaterialById(id);
      setMaterial(m);
      fetchStats(id);
      
      if (m?.status !== 'extracting' && m?.status !== 'chunking' && m?.status !== 'mapping_concepts') {
        setIsProcessing(false);
        clearInterval(interval);
        loadData();
      }
    }, 3000);
  };

  const fetchStats = async (id: string) => {
    try {
      const res = await fetch(`${ENV.API_URL}/materials/${id}/processing-status`);
      if (res.ok) {
        const data = await res.json();
        setProcessingStats({ progress: data.processingProgress || 0, error: data.processingError, chunks: data.chunkCount });
      }
    } catch (e) { console.error(e); }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStudyMaterial = () => {
    navigate(`/estudo/configurar?material=${materialId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Material não encontrado</h2>
        <Button variant="outline" onClick={() => navigate('/materiais')}>Voltar aos materiais</Button>
      </div>
    );
  }

  const buildTree = (parentId: string | null = null): ConceptNode[] => {
    return concepts
      .filter(c => c.parentId === parentId)
      .map(c => {
        const children = buildTree(c.id);
        const leafConceptIds = c.level === 'concept' ? [c.id] : children.flatMap(ch => ch.leafConceptIds);
        return { concept: c, children, leafConceptIds };
      });
  };

  const conceptTree = buildTree(null);

  const getQuestionsForNode = (node: ConceptNode) => {
    return questions.filter(q => q.validationStatus === 'validated' && node.leafConceptIds.includes(q.conceptId));
  };

  const renderConceptNode = (node: ConceptNode, depth = 0) => {
    const isExpanded = expandedNodes[node.concept.id];
    const hasChildren = node.children.length > 0;
    
    const cov = coverageTree?.nodes?.[node.concept.id];
    const capacity = cov?.estimatedQuestionCapacity || 0;
    const validatedCount = cov?.validatedQuestionCount || 0;
    const coverage = cov?.coverage || 0;
    const potential = cov?.remainingPotential || 'high';

    const potentialText = { high: 'Alto', medium: 'Médio', low: 'Baixo', exhausted: 'Praticamente esgotado' }[potential as string] || 'Alto';
    
    // Only show as card if it's a discipline, topic, or subtopic. Leaf concepts can be simpler.
    if (node.concept.level === 'concept') {
      return (
        <div key={node.concept.id} className="py-2 flex items-center justify-between border-b border-slate-50 last:border-0 pl-2">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
             <span className="text-sm font-medium text-slate-700">{node.concept.name}</span>
           </div>
           <div className="flex items-center gap-4 text-xs text-slate-500">
             <span>{validatedCount} qts</span>
             <span className="w-16 text-right font-semibold text-blue-600">{coverage}% expl.</span>
           </div>
        </div>
      );
    }

    return (
      <div key={node.concept.id} className={`mb-4 ${depth > 0 ? 'ml-4 sm:ml-8' : 'mt-6'}`}>
        <Card className={`overflow-hidden border ${depth === 0 ? 'border-slate-300 shadow-sm' : 'border-slate-200'}`}>
          <div className={`p-4 ${depth === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                    {node.concept.level === 'discipline' ? 'Matéria' : node.concept.level === 'topic' ? 'Assunto' : node.concept.level === 'subtopic' ? 'Subassunto' : 'Conceito'}
                  </span>
                  <h3 className={`font-bold text-slate-900 ${depth === 0 ? 'text-lg' : 'text-base'}`}>
                    {node.concept.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Conceitos</p>
                    <p className="text-sm font-semibold text-slate-700">{node.leafConceptIds.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Questões Validadas</p>
                    <p className="text-sm font-semibold text-slate-700">{validatedCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400" title="Estimativa baseada no tamanho do núcleo e complexidade">Capacidade Estimada</p>
                    <p className="text-sm font-semibold text-slate-700">~{capacity} questões</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Cobertura Estimada</p>
                    <p className="text-sm font-bold text-blue-600">{coverage}%</p>
                    <p className="text-[10px] text-slate-500 font-medium">Potencial: {potentialText}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-36 mt-2 lg:mt-0">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => { setBatchScope({ id: node.concept.id, name: node.concept.name, type: node.concept.level || 'concept' }); setIsBatchModalOpen(true); }}>
                  Gerar questões
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => { setViewScope({ name: node.concept.name, questions: getQuestionsForNode(node) }); setIsViewModalOpen(true); }}>
                  Ver questões
                </Button>
                {hasChildren && (
                  <Button size="sm" variant="ghost" className="w-full text-slate-500 hidden lg:flex" onClick={() => toggleNode(node.concept.id)}>
                    {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
                  </Button>
                )}
                {hasChildren && (
                  <Button size="sm" variant="ghost" className="w-full text-slate-500 flex lg:hidden" onClick={() => toggleNode(node.concept.id)}>
                    {isExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {isExpanded && hasChildren && (
            <div className="p-2 sm:p-4 border-t border-slate-100 bg-white">
              {node.children.map(child => renderConceptNode(child, depth + 1))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const disciplines = conceptTree.filter(n => n.concept.level === 'discipline');
  const renderedTree = disciplines.length > 0 ? disciplines : conceptTree;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/materiais')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{material.title}</h1>
            <p className="text-sm text-slate-500 mt-1">Visão geral do material e exploração de questões</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0" 
          onClick={() => setIsDeleteModalOpen(true)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir Material
        </Button>
      </div>

      
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

        <Card className="p-6 border-blue-100 bg-blue-50/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {material.status === 'extracting' ? 'Extraindo texto do PDF...' : 
                 material.status === 'chunking' ? 'Analisando estrutura...' : 
                 'Mapeando conceitos...'}
              </h3>
              <p className="text-sm text-slate-600">Este processo pode levar alguns minutos.</p>
            </div>
          </div>
          
          {processingStats && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">Progresso</span>
                <span className="text-blue-600 font-bold">{Math.round(processingStats.progress)}%</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${processingStats.progress}%` }}
                />
              </div>
              {processingStats.chunks !== undefined && (
                <p className="text-xs text-slate-500 text-right mt-1">
                  {processingStats.chunks} blocos processados
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {(!isProcessing) && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Estatísticas do Material</h2>
              <p className="text-sm text-slate-500">Resumo da extração e banco de questões geradas</p>
            </div>
            
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
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-6 border-t border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Páginas</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{material.pageCount || '--'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Assuntos</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{concepts.filter(c => c.level === 'topic' || c.level === 'subtopic').length}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Conceitos</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{concepts.filter(c => c.level === 'concept').length}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1" title="Apenas questões com status validado">
                <FileQuestion className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Qts Validadas</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{questions.filter(q => q.validationStatus === 'validated').length}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 text-slate-500 mb-1" title="Estimativa baseada nos conceitos e abordagens já exploradas.">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Cobertura Est.</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{coverageTree?.material?.coverage || 0}%</span>
            </div>
          </div>
        </Card>
      )}

      {(!isProcessing && concepts.length > 0) && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Árvore de Conhecimentos</h2>
          {renderedTree.map(node => renderConceptNode(node, 0))}
        </div>
      )}

      {isBatchModalOpen && batchScope && (
        <BatchGenerationModal 
          materialId={material.id}
          scope={batchScope}
          onClose={() => {
            setIsBatchModalOpen(false);
            loadData(); // Reload stats and coverage
          }}
        />
      )}

      {isViewModalOpen && viewScope && (
        <ViewQuestionsModal
          scope={viewScope}
          questions={viewScope.questions}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir este material?</h3>
            <p className="text-sm text-slate-600 mb-6">
              Esta ação apagará o PDF, conceitos, questões e histórico diretamente relacionado a este material. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleDeleteMaterial}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir definitivamente'}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
