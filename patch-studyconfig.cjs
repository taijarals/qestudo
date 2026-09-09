const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Play, Settings, Minus, Plus, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStudySession } from '../context/StudySessionContext';
import { Material } from '../domain';

export function StudyConfig() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMaterialId = searchParams.get('materialId');
  const { startSession } = useStudySession();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>(initialMaterialId || '');
  const [board, setBoard] = useState<string>('CEBRASPE');
  const [questionType, setQuestionType] = useState<string>('certo-errado');
  const [quantity, setQuantity] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        // filter out only ready materials
        const readyMaterials = data.filter((m: any) => m.status === 'ready');
        setMaterials(readyMaterials);
        if (!selectedMaterial && readyMaterials.length > 0) {
          setSelectedMaterial(readyMaterials[0].id);
        }
      })
      .catch(e => console.error(e));
  }, []);

  const handleStartSession = async () => {
    if (!selectedMaterial) {
      setErrorMsg('Selecione um material.');
      return;
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
          conceptIds: [],
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

        {/* Banca */}
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

        {/* Formato (Read-only for MVP, based on Board) */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Formato (automático pela banca)</label>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
            {questionType === 'certo-errado' ? 'Certo / Errado' : 'Múltipla Escolha (A-E)'}
          </div>
        </div>

        {/* Quantidade */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Quantidade de questões</label>
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
        </div>

        <div className="pt-4">
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

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
