import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { materialService } from '../services';
import { Material } from '../domain';
import { Upload, Cloud, Database, FileText, FileBadge, Loader2, Play, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENV } from '../config/env';

const getIcon = (title: string) => {
  if (!title) return <FileBadge className="w-8 h-8 text-slate-500" />;
  if (title.includes('Cloud')) return <Cloud className="w-8 h-8 text-blue-500" />;
  if (title.includes('Banco')) return <Database className="w-8 h-8 text-blue-500" />;
  if (title.includes('Direito')) return <FileText className="w-8 h-8 text-pink-500" />;
  return <FileBadge className="w-8 h-8 text-slate-500" />;
};

const PROCESSING_STATES = ['extracting', 'chunking', 'mapping_concepts'];
const ERROR_STATES = ['error', 'processing_error', 'mapping_error', 'pdf_requires_ocr'];
const ACTION_STATES = ['uploaded', 'ready_for_mapping'];

export function Materials() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'todos' | 'processamento' | 'concluidos'>('todos');
  const [materials, setMaterials] = useState<Material[]>([]);

  const fetchMaterials = () => {
    materialService.getMaterials().then(setMaterials);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Polling logic
  useEffect(() => {
    const hasProcessing = materials.some(m => PROCESSING_STATES.includes(m.status));
    if (hasProcessing) {
      const interval = setInterval(fetchMaterials, 3000);
      return () => clearInterval(interval);
    }
  }, [materials]);

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

  const handleProcessMaterial = async (id: string) => {
    try {
      const res = await fetch(`${ENV.API_URL}/materials/${id}/process`, { method: 'POST' });
      if (res.ok) {
         fetchMaterials(); // Immediately update status
      } else {
         const err = await res.json();
         alert(err.error || 'Erro ao iniciar processamento');
      }
    } catch (error) {
       alert('Erro de rede');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ready') return <Badge variant="success">Processado</Badge>;
    if (ERROR_STATES.includes(status)) return <Badge variant="danger">Erro</Badge>;
    if (PROCESSING_STATES.includes(status)) {
       let label = 'Em processamento';
       if (status === 'extracting') label = 'Extraindo texto...';
       if (status === 'chunking') label = 'Organizando conteúdo...';
       if (status === 'mapping_concepts') label = 'Identificando assuntos...';
       return <Badge variant="warning">{label}</Badge>;
    }
    if (status === 'uploaded') return <Badge variant="outline">Pronto para processar</Badge>;
    if (status === 'ready_for_mapping') return <Badge variant="outline">Texto extraído — pronto para analisar</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const processingCount = materials.filter(m => PROCESSING_STATES.includes(m.status)).length;
  const readyCount = materials.filter(m => m.status === 'ready').length;

  const filteredMaterials = materials.filter(m => {
    if (activeTab === 'processamento') return PROCESSING_STATES.includes(m.status);
    if (activeTab === 'concluidos') return m.status === 'ready';
    return true;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
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

      {materials.length === 0 && !isUploading ? (
        <Card className="p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <FileBadge className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nenhum material enviado ainda.</h2>
          <p className="text-slate-500 mb-6 max-w-md">Faça upload do seu primeiro PDF para extrairmos os conceitos e gerarmos questões para você.</p>
          <Button className="flex items-center gap-2" onClick={handleUploadClick}>
            <Upload className="w-4 h-4" /> Enviar meu primeiro PDF
          </Button>
        </Card>
      ) : (
        <>
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
              Em processamento ({processingCount})
            </button>
            <button
              onClick={() => setActiveTab('concluidos')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'concluidos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Concluídos ({readyCount})
            </button>
          </div>

          <div className="space-y-4">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                  {getIcon(material.title)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 truncate" title={material.fileName || material.title}>
                      {material.fileName || material.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(material.status)}
                      {ERROR_STATES.includes(material.status) && (
                         <span className="text-sm text-red-600 flex items-center gap-1">
                           <AlertTriangle className="w-4 h-4" /> {material.status === 'mapping_error' ? 'PDF processado, mas ocorreu um erro ao analisar o conteúdo.' : 'Não foi possível processar este PDF.'}
                         </span>
                      )}
                    </div>
                  </div>

                  {material.status === 'ready' && (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 max-w-xs">
                        <ProgressBar value={material.masteryScore || 0} />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{material.masteryScore}%</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span>{material.conceptCount || 0} conceitos</span>
                    <span>{material.questionCount || 0} questões</span>
                    {material.masteryScore !== null && material.masteryScore !== undefined && <span>Domínio: {material.masteryScore}%</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full sm:w-40">
                  {material.status === 'ready' && (
                    <>
                      <Button onClick={() => navigate(`/estudar?materialId=${material.id}`)} className="w-full">Estudar</Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/materiais/${material.id}`)}>Ver conteúdo</Button>
                    </>
                  )}

                  {material.status === 'uploaded' && (
                    <>
                      <Button onClick={() => handleProcessMaterial(material.id)} className="w-full bg-blue-600 hover:bg-blue-700">
                         <Play className="w-4 h-4 mr-2" /> Processar PDF
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/materiais/${material.id}`)}>Ver detalhes</Button>
                    </>
                  )}

                  {PROCESSING_STATES.includes(material.status) && (
                    <>
                      <Button variant="secondary" disabled className="w-full opacity-80">
                         <Loader2 className="w-4 h-4 animate-spin mr-2" />
                         Processando
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/materiais/${material.id}`)}>Ver detalhes</Button>
                    </>
                  )}

                  {material.status === 'ready_for_mapping' && (
                    <>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/materiais/${material.id}`)}>Ver detalhes para Analisar</Button>
                    </>
                  )}

                  {ERROR_STATES.includes(material.status) && (
                    <>
                      <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleProcessMaterial(material.id)}>
                         Tentar novamente
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate(`/materiais/${material.id}`)}>Ver detalhes</Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
