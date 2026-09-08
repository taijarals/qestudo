import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { materialService } from '../services';
import { Material } from '../domain';
import { Upload, Cloud, Database, FileText, FileBadge, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENV } from '../config/env';

const getIcon = (title: string) => {
  if (title.includes('Cloud')) return <Cloud className="w-8 h-8 text-blue-500" />;
  if (title.includes('Banco')) return <Database className="w-8 h-8 text-blue-500" />;
  if (title.includes('Direito')) return <FileText className="w-8 h-8 text-pink-500" />;
  return <FileBadge className="w-8 h-8 text-slate-500" />;
};

export function Materials() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'todos' | 'processamento' | 'concluidos'>('todos');
  const [materials, setMaterials] = useState<Material[]>([]);


  const fetchMaterials = () => {
    materialService.getMaterials().then(setMaterials);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Apenas arquivos PDF são permitidos.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 50MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${ENV.API_URL}/materials/upload`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 201) {
          fetchMaterials();
          if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
          try {
            const res = JSON.parse(xhr.responseText);
            alert(res.error || 'Erro ao enviar arquivo.');
          } catch {
            alert('Erro ao enviar arquivo.');
          }
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        alert('Erro de rede ao enviar arquivo.');
      };

      xhr.send(formData);
    } catch (error) {
      console.error(error);
      alert('Erro inesperado.');
      setIsUploading(false);
    }
  };


  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Meus materiais</h1>
          <p className="text-slate-500 mt-1">Envie seus PDFs e acompanhe seu progresso.</p>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />
        <Button className="flex items-center gap-2" onClick={handleUploadClick} disabled={isUploading}>
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          <span>{isUploading ? `Enviando... ${uploadProgress}%` : 'Enviar PDF'}</span>
        </Button>
      </header>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'todos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Todos ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('processamento')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'processamento' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Em processamento ({materials.filter(m => m.status !== 'ready').length})
        </button>
        <button
          onClick={() => setActiveTab('concluidos')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'concluidos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Concluídos ({materials.filter(m => m.status === 'ready').length})
        </button>
      </div>

      <div className="space-y-4">
        {materials.map((material) => (
          <Card key={material.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
              {getIcon(material.title)}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{material.fileName}</h3>
                <div className="mt-2">
                  {material.status === 'ready' ? (
                    <Badge variant="success">Processado</Badge>
                  ) : (
                    <Badge variant="warning">Em processamento</Badge>
                  )}
                </div>
              </div>

              {material.status === 'ready' && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <ProgressBar value={material.masteryScore || 0} />
                  </div>
                  <span className="font-bold text-slate-900">{material.masteryScore}%</span>
                </div>
              )}
              
              <div className="text-sm text-slate-500 flex items-center gap-4">
                <span>{material.conceptCount} conceitos</span>
                <span>{material.questionCount} questões</span>
                {material.masteryScore !== null && <span>Domínio: {material.masteryScore}%</span>}
                {material.masteryScore === null && <span>Domínio: --</span>}
              </div>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 shrink-0">
              {material.status === 'ready' ? (
                <>
                  <Button onClick={() => navigate('/estudar')} className="w-full sm:w-32">Estudar</Button>
                  <Button variant="outline" className="w-full sm:w-32" onClick={() => navigate(`/materiais/${material.id}`)}>Ver conteúdo</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" disabled className="w-full sm:w-32">Aguarde</Button>
                  <Button variant="outline" className="w-full sm:w-32">Ver detalhes</Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
