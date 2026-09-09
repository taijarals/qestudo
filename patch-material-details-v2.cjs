const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

// Add coverage imports and state
code = code.replace(
  "import { cn } from '../lib/utils';",
  "import { cn } from '../lib/utils';\nimport { BatchGenerationModal } from '../components/BatchGenerationModal';"
);

code = code.replace(
  "const [processingStats, setProcessingStats] = useState<{progress: number, error?: string, chunks?: number} | null>(null);",
  "const [processingStats, setProcessingStats] = useState<{progress: number, error?: string, chunks?: number} | null>(null);\n  const [coverageTree, setCoverageTree] = useState<any>(null);\n  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);\n  const [batchScope, setBatchScope] = useState<{id: string, name: string, type: string} | null>(null);"
);

// Load coverage tree
const loadDataRegex = /setLoading\(false\);\s*if \(m\?.status === 'extracting'/;
code = code.replace(
  loadDataRegex,
  `setLoading(false);
      
      try {
        const covRes = await fetch(\`\${ENV.API_URL}/materials/\${materialId}/coverage-tree\`);
        if (covRes.ok) setCoverageTree(await covRes.json());
      } catch (e) { console.error(e); }
      
      if (m?.status === 'extracting'`
);

// Add Generate Button and coverage text to renderConceptNode
code = code.replace(
  /<Button variant="outline" size="sm" onClick=\{\(e\) => \{ e.stopPropagation\(\); handleStudyConcept\(node.concept.id\); \}\}>Estudar<\/Button>/g,
  `<Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleStudyConcept(node.concept.id); }}>Estudar</Button>
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={(e) => { e.stopPropagation(); setBatchScope({id: node.concept.id, name: node.concept.name, type: node.concept.level || 'concept'}); setIsBatchModalOpen(true); }}>Gerar</Button>`
);

code = code.replace(
  /<span className="text-sm font-bold text-slate-700 w-10 text-right">\{score\}%<\/span>/g,
  `<span className="text-sm font-bold text-slate-700 w-10 text-right">{score}%</span>`
);

// Let's replace the whole renderConceptNode stats part to add coverage info
const statsRegex = /<div className="hidden sm:flex items-center gap-1\.5 text-sm text-slate-500 w-24">\s*<FileQuestion className="w-4 h-4" \/>\s*<span>\{node\.questionCount\} qts<\/span>\s*<\/div>/;

code = code.replace(
  statsRegex,
  `<div className="hidden sm:flex flex-col text-xs text-slate-500 w-28 text-right">
              <span className="font-semibold text-slate-700">{coverageTree?.nodes?.[node.concept.id]?.validatedQuestionCount || 0} questões</span>
              <span>{coverageTree?.nodes?.[node.concept.id]?.coverage || 0}% explorado</span>
            </div>`
);

// Overall material coverage
const overallCoverageRegex = /<span className="text-lg font-bold text-blue-600">\{material\.studyCoverage\}%<\/span>/;
code = code.replace(
  overallCoverageRegex,
  `<span className="text-lg font-bold text-blue-600">{coverageTree?.material?.coverage || 0}%</span>`
);

// Add the modal component at the end of return
const returnEndRegex = /<\/Card>\s*<\/div>\s*\);\s*\}/;
code = code.replace(
  returnEndRegex,
  `</Card>

      {isBatchModalOpen && batchScope && (
        <BatchGenerationModal 
          materialId={material.id}
          scope={batchScope}
          onClose={() => {
            setIsBatchModalOpen(false);
            // Reload questions and coverage
            const reload = async () => {
              const qts = await materialService.getQuestionsByMaterial(material.id);
              setQuestions(qts);
              const covRes = await fetch(\`\${ENV.API_URL}/materials/\${material.id}/coverage-tree\`);
              if (covRes.ok) setCoverageTree(await covRes.json());
            };
            reload();
          }}
        />
      )}
    </div>
  );
}`
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
