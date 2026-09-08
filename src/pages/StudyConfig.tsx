import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useStudySession } from '../context/StudySessionContext';
import { mockQuestions } from '../mocks/data';
import { BoardType, QuestionType, StudyMode, StudySessionConfig, StudySession } from '../domain';

export function StudyConfig() {
  const navigate = useNavigate();
  const { startSession } = useStudySession();

  const [subject, setSubject] = useState('Cloud Computing');
  const [material, setMaterial] = useState('1'); // Mock ID
  const [board, setBoard] = useState<BoardType | 'Misturado'>('CEBRASPE');
  const [formats, setFormats] = useState({ ce: true, me: true });
  const [quantity, setQuantity] = useState(10);
  const [mode, setMode] = useState<StudyMode>('adaptive');
  const [concept, setConcept] = useState('c1');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartSession = () => {
    setErrorMsg('');
    
    // 1. Validation
    if (!formats.ce && !formats.me) {
      setErrorMsg('Selecione pelo menos um formato de questão.');
      return;
    }

    // 2. Build Config
    const selectedBoards: BoardType[] = board === 'Misturado' 
      ? ['CEBRASPE', 'FGV', 'FCC'] 
      : [board as BoardType];
    
    const selectedTypes: QuestionType[] = [];
    if (formats.ce) selectedTypes.push('certo-errado');
    if (formats.me) selectedTypes.push('multipla-escolha');

    const config: StudySessionConfig = {
      materialIds: [material],
      boards: selectedBoards,
      questionTypes: selectedTypes,
      quantity,
      mode,
      conceptIds: mode === 'specific' ? [concept] : undefined,
    };

    // 3. Select Questions based on config
    let availableQuestions = mockQuestions.filter(q => 
      config.boards.includes(q.board) && 
      config.questionTypes.includes(q.type)
    );

    if (config.conceptIds && config.conceptIds.length > 0) {
      availableQuestions = availableQuestions.filter(q => config.conceptIds?.includes(q.conceptId));
    }

    if (availableQuestions.length === 0) {
      setErrorMsg('Nenhuma questão encontrada com estes filtros. Tente misturar as bancas ou formatos.');
      return;
    }

    const questionIds = availableQuestions.map(q => q.id).slice(0, quantity);

    // 4. Create Session
    const session: StudySession = {
      id: `sess_${Date.now()}`,
      config,
      questionIds,
      currentQuestionIndex: 0,
      startedAt: new Date(),
      status: 'active'
    };

    startSession(session);
    navigate('/sessao');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Configurar sessão</h1>
        <p className="text-slate-500 mt-1">Escolha como você quer estudar.</p>
      </header>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <Card className="p-8 space-y-8">
        
        {/* Materiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Matéria</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Banco de Dados">Banco de Dados</option>
              <option value="Direito Administrativo">Direito Administrativo</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Material</label>
            <select 
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="1">Aula 01 - Fundamentos</option>
              <option value="2">Todos os materiais</option>
            </select>
          </div>
        </div>

        {/* Banca */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Banca</label>
          <div className="flex flex-wrap gap-6">
            {['CEBRASPE', 'FGV', 'FCC', 'Misturado'].map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="banca" 
                  checked={board === b}
                  onChange={() => setBoard(b as BoardType | 'Misturado')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-slate-700">{b}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Formato */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Formato de questões</label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formats.ce}
                onChange={(e) => setFormats({...formats, ce: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
              />
              <span className="text-slate-700">Certo / Errado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formats.me}
                onChange={(e) => setFormats({...formats, me: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
              />
              <span className="text-slate-700">Múltipla escolha (A-E)</span>
            </label>
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
              onClick={() => setQuantity(Math.min(100, quantity + 5))}
              className="w-10 h-10 flex items-center justify-center rounded-r-lg border border-slate-300 bg-slate-50 hover:bg-slate-100"
            >
              <Plus className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Modo de estudo */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-900">Modo de estudo</label>
          
          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${mode === 'adaptive' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input type="radio" name="modo" checked={mode === 'adaptive'} onChange={() => setMode('adaptive')} className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Adaptativo</span>
              <span className="text-sm text-slate-600">O sistema escolhe os assuntos com base no seu desempenho.</span>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${mode === 'specific' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input type="radio" name="modo" checked={mode === 'specific'} onChange={() => setMode('specific')} className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div className="flex-1">
              <span className="block font-semibold text-slate-900">Assunto específico</span>
              <span className="text-sm text-slate-600">Escolha um assunto ou conceito.</span>
              
              {mode === 'specific' && (
                <div className="mt-4">
                  <select 
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="c1">Características essenciais</option>
                    <option value="c2">Modelos de serviço</option>
                    <option value="c_bd1">Transações (ACID)</option>
                  </select>
                </div>
              )}
            </div>
          </label>

          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${mode === 'random' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input type="radio" name="modo" checked={mode === 'random'} onChange={() => setMode('random')} className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Aleatório</span>
              <span className="text-sm text-slate-600">Questões aleatórias deste material.</span>
            </div>
          </label>

          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${mode === 'review' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
            <input type="radio" name="modo" checked={mode === 'review'} onChange={() => setMode('review')} className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Revisão</span>
              <span className="text-sm text-slate-600">Foque nos seus pontos mais fracos.</span>
            </div>
          </label>
        </div>

        <div className="pt-4">
          <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleStartSession}>
            <span>Começar sessão</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
