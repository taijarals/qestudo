const fs = require('fs');
let code = fs.readFileSync('src/pages/Materials.tsx', 'utf-8');

code = code.replace(
  "import { Upload, Cloud, Database, FileText, FileBadge } from 'lucide-react';",
  "import { Upload, Cloud, Database, FileText, FileBadge, Loader2 } from 'lucide-react';"
);

code = code.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useNavigate } from 'react-router-dom';\nimport { ENV } from '../config/env';"
);

code = code.replace(
  "export function Materials() {",
  `export function Materials() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
`
);

code = code.replace(
  "  useEffect(() => {\n    materialService.getMaterials().then(setMaterials);\n  }, []);",
  `
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
      xhr.open('POST', \`\${ENV.API_URL}/materials/upload\`);
      
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
`
);

code = code.replace(
  '<Button className="flex items-center gap-2">',
  `<input type="file" ref={fileInputRef} className="hidden" accept=".pdf,application/pdf" onChange={handleFileChange} />
        <Button className="flex items-center gap-2" onClick={handleUploadClick} disabled={isUploading}>`
);

code = code.replace(
  '<Upload className="w-4 h-4" />',
  `{isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}`
);

code = code.replace(
  '<span>Enviar PDF</span>',
  `<span>{isUploading ? \`Enviando... \${uploadProgress}%\` : 'Enviar PDF'}</span>`
);

fs.writeFileSync('src/pages/Materials.tsx', code);
