const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

// Adicionar import para Trash2 (ícone de lixeira)
code = code.replace("import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, FileText, Target, BookOpen, FileQuestion, Sparkles, Loader2, Play } from 'lucide-react';", "import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, FileText, Target, BookOpen, FileQuestion, Sparkles, Loader2, Play, Trash2 } from 'lucide-react';");

// Adicionar states para delete modal
code = code.replace("const [viewScope, setViewScope] = useState<{name: string, questions: Question[]} | null>(null);", "const [viewScope, setViewScope] = useState<{name: string, questions: Question[]} | null>(null);\n  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);\n  const [isDeleting, setIsDeleting] = useState(false);");

// Adicionar função de deletar
const deleteFunction = `
  const handleDeleteMaterial = async () => {
    if (!materialId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(\`\${ENV.API_URL}/materials/\${materialId}\`, {
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
`;
code = code.replace("const loadData = async () => {", deleteFunction + "\n  const loadData = async () => {");

// Adicionar o botão no header
const headerOriginal = `<div className="flex items-center gap-4">
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
      </div>`;
const headerReplacement = `<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
      </div>`;
code = code.replace(headerOriginal, headerReplacement);

// Adicionar o delete modal no final do componente
const deleteModal = `
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
`;
code = code.replace("</div >", "</div >" + deleteModal); // Wait, there's no </div > usually, maybe </div>. Let me use replace last </div>
const lastDivIndex = code.lastIndexOf("</div>");
code = code.substring(0, lastDivIndex) + deleteModal + "\n    </div>" + code.substring(lastDivIndex + 6);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
