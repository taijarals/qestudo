import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Minus, Plus } from 'lucide-react';

export function StudyConfig() {
  const navigate = useNavigate();
  const [quantity, setQuantity] = React.useState(10);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Configurar sessão</h1>
        <p className="text-slate-500 mt-1">Escolha como você quer estudar.</p>
      </header>

      <Card className="p-8 space-y-8">
        
        {/* Materiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Matéria</label>
            <select className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>Cloud Computing</option>
              <option>Banco de Dados</option>
              <option>Direito Administrativo</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Material</label>
            <select className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
              <option>Aula 01 - Fundamentos</option>
              <option>Todos os materiais</option>
            </select>
          </div>
        </div>

        {/* Banca */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Banca</label>
          <div className="flex flex-wrap gap-6">
            {['CEBRASPE', 'FGV', 'FCC', 'Misturado'].map(banca => (
              <label key={banca} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="banca" defaultChecked={banca === 'CEBRASPE'} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-700">{banca}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Formato */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-900">Formato de questões</label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-slate-700">Certo / Errado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
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
          
          <label className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 cursor-pointer transition-colors">
            <input type="radio" name="modo" defaultChecked className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Adaptativo</span>
              <span className="text-sm text-slate-600">O sistema escolhe os assuntos com base no seu desempenho.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="radio" name="modo" className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Assunto específico</span>
              <span className="text-sm text-slate-600">Escolha um assunto ou conceito.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="radio" name="modo" className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Aleatório</span>
              <span className="text-sm text-slate-600">Questões aleatórias deste material.</span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input type="radio" name="modo" className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500" />
            <div>
              <span className="block font-semibold text-slate-900">Revisão</span>
              <span className="text-sm text-slate-600">Foque nos seus pontos mais fracos.</span>
            </div>
          </label>
        </div>

        <div className="pt-4">
          <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/sessao')}>
            <span>Começar sessão</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
