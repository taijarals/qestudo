const fs = require('fs');

const replacement = `
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Play, Settings, Minus, Plus, ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudySession } from '../context/StudySessionContext';
import { Material } from '../domain';

interface ConceptNode {
  id: string;
  name: string;
  level: string;
  children: ConceptNode[];
}

export function StudyConfig() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { materialId?: string, mode?: string, conceptId?: string } | null;
  const initialMaterialId = state?.materialId || '';
  const initialMode = state?.mode || 'all';
  const initialConceptId = state?.conceptId;

  const { startSession } = useStudySession();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(initialMaterialId);
  const [board, setBoard] = useState<string>('CEBRASPE');
  const [questionType, setQuestionType] = useState<string>('certo-errado');
  const [quantity, setQuantity] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [studyScope, setStudyScope] = useState<'all' | 'specific'>(initialMode as any);
  const [concepts, setConcepts] = useState<ConceptNode[]>([]);
  const [selectedConceptIds, setSelectedConceptIds] = useState<Record<string, boolean>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        const readyMaterials = data.filter((m: any) => m.status === 'ready');
        setMaterials(readyMaterials);
        if (!selectedMaterial && readyMaterials.length > 0) {
          setSelectedMaterial(readyMaterials[0].id);
        }
      })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (selectedMaterial) {
      fetch(\`/api/materials/\${selectedMaterial}/concepts\`)
        .then(res => res.json())
        .then((data: ConceptNode[]) => {
          setConcepts(data);
          
          if (initialConceptId && studyScope === 'specific') {
            // Find and expand parents
            const toSelect: Record<string, boolean> = {};
            const toExpand: Record<string, boolean> = {};
            
            const findAndSelect = (nodes: ConceptNode[], parents: string[]) => {
              for (const n of nodes) {
                if (n.id === initialConceptId) {
                  parents.forEach(p => toExpand[p] = true);
                  selectNodeAndDescendants(n, true, toSelect);
                } else if (n.children) {
                  findAndSelect(n.children, [...parents, n.id]);
                }
              }
            };
            findAndSelect(data, []);
            setSelectedConceptIds(toSelect);
            setExpandedNodes(toExpand);
          } else {
             setSelectedConceptIds({});
          }
        })
        .catch(e => console.error(e));
    } else {
      setConcepts([]);
      setSelectedConceptIds({});
    }
  }, [selectedMaterial]);

  const selectNodeAndDescendants = (node: ConceptNode, value: boolean, acc: Record<string, boolean>) => {
    acc[node.id] = value;
    if (node.children) {
      node.children.forEach(child => selectNodeAndDescendants(child, value, acc));
    }
  };

  const handleToggleSelection = (node: ConceptNode) => {
    const isSelected = !!selectedConceptIds[node.id];
    const newSelections = { ...selectedConceptIds };
    selectNodeAndDescendants(node, !isSelected, newSelections);
    setSelectedConceptIds(newSelections);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const getLeafConceptIds = (nodes: ConceptNode[]): string[] => {
    let leaves: string[] = [];
    nodes.forEach(node => {
      if (node.level === 'concept') {
         if (selectedConceptIds[node.id]) leaves.push(node.id);
      } else if (node.children) {
         leaves = leaves.concat(getLeafConceptIds(node.children));
      }
    });
    return leaves;
  };

  const getTotalLeafCount = (nodes: ConceptNode[]): number => {
    let count = 0;
    nodes.forEach(node => {
      if (node.level === 'concept') count++;
      else if (node.children) count += getTotalLeafCount(node.children);
    });
    return count;
  };

  const renderTree = (nodes: ConceptNode[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = !!expandedNodes[node.id];
      const hasChildren = node.children && node.children.length > 0;
      const isSelected = !!selectedConceptIds[node.id];

      return (
        <div key={node.id} className="select-none">
          <div 
            className="flex items-center p-2 hover:bg-slate-50 transition-colors cursor-pointer"
            style={{ paddingLeft: \`\${depth * 1.5}rem\` }}
          >
            <div className="w-6 shrink-0 flex items-center justify-center">
              {hasChildren && (
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                  className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                checked={isSelected}
                onChange={() => handleToggleSelection(node)}
              />
              <span className="truncate text-sm text-slate-700">
                 {node.level === 'discipline' ? 'Matéria: ' : node.level === 'topic' ? 'Assunto: ' : node.level === 'subtopic' ? 'Subassunto: ' : ''}
                 <span className={node.level === 'discipline' ? 'font-bold' : node.level === 'concept' ? 'text-slate-600' : 'font-medium'}>
                   {node.name}
                 </span>
              </span>
            </label>
          </div>
          {isExpanded && hasChildren && (
            <div>{renderTree(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const leafCount = studyScope === 'all' ? getTotalLeafCount(concepts) : getLeafConceptIds(concepts).length;

  const handleStartSession = async () => {
    if (!selectedMaterial) {
      setErrorMsg('Selecione um material.');
      return;
    }

    let finalConceptIds: string[] = [];
    if (studyScope === 'specific') {
      finalConceptIds = getLeafConceptIds(concepts);
      if (finalConceptIds.length === 0) {
        setErrorMsg('Selecione pelo menos um assunto ou conceito.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialIds: [selectedMaterial],
          boards: [board],
          questionTypes: [questionType],
          mode: 'adaptive',
          quantity: quantity,
          conceptIds: finalConceptIds,
          questionIds: [],
          status: 'active'
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao criar sessão');
      }

      const session = await res.json();
      startSession(session);
      navigate('/sessao');
    } catch (e: any) {
      setErrorMsg(e.message || 'Erro ao iniciar sessão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Configurar Estudo
        </h1>
        <p className="text-slate-500 mt-1">Escolha como você quer estudar.</p>
      </header>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <Card className="p-8 space-y-8">
        {/* Materiais */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">Material</label>
          <select 
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {materials.length === 0 && <option value="">Nenhum material processado disponível</option>}
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.title || m.fileName}</option>
            ))}
          </select>
        </div>

        {/* O que estudar */}
        {selectedMaterial && concepts.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900">O que você quer estudar?</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="studyScope" 
                  checked={studyScope === 'all'}
                  onChange={() => setStudyScope('all')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-slate-700">Material completo</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="studyScope" 
                  checked={studyScope === 'specific'}
                  onChange={() => setStudyScope('specific')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-slate-700">Selecionar assuntos</span>
              </label>
            </div>

            {studyScope === 'specific' && (
              <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                 {renderTree(concepts)}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Banca</label>
          <div className="flex flex-wrap gap-6">
            {['CEBRASPE', 'FGV', 'FCC'].map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="banca" 
                  checked={board === b}
                  onChange={() => {
                    setBoard(b);
                    if (b === 'CEBRASPE') setQuestionType('certo-errado');
                    else setQuestionType('multipla-escolha');
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-slate-700">{b}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Formato (automático pela banca)</label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            {questionType === 'certo-errado' ? 'Certo / Errado' : 'Múltipla Escolha (A-E)'}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Quantidade de questões</label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <button 
                onClick={() => setQuantity(Math.max(5, quantity - 5))}
                className="w-10 h-10 flex items-center justify-center rounded-l-lg border border-slate-300 bg-slate-50 hover:bg-slate-100"
              >
                <Minus className="w-4 h-4 text-slate-600" />
              </button>
              <input 
                type="text" 
                readOnly 
                value={quantity}
                className="w-16 h-10 border-y border-slate-300 text-center font-semibold text-slate-900 bg-white" 
              />
              <button 
                onClick={() => setQuantity(Math.min(50, quantity + 5))}
                className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-slate-300 bg-slate-50 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Se necessário, novas questões serão geradas a partir do material durante o estudo.
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="text-sm text-center text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            {studyScope === 'all' ? (
               <span className="font-medium">Material completo — você estudará {leafCount} conceitos.</span>
            ) : (
               <span className="font-medium">Você estudará {leafCount} conceitos selecionados.</span>
            )}
          </div>
          <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleStartSession} disabled={isLoading || !selectedMaterial}>
            <span>{isLoading ? 'Criando sessão...' : 'Começar sessão'}</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/StudyConfig.tsx', replacement);
