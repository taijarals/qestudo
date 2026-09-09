const fs = require('fs');
let code = fs.readFileSync('src/pages/StudyConfig.tsx', 'utf-8');

// Add state for available questions
code = code.replace(
  "const [errorMsg, setErrorMsg] = useState('');",
  "const [errorMsg, setErrorMsg] = useState('');\n  const [availableQuestions, setAvailableQuestions] = useState<number | null>(null);"
);

// Update logic when changing scope or material to fetch available questions
const leafCountRegex = /const leafCount = studyScope === 'all' \? getTotalLeafCount\(concepts\) : getLeafConceptIds\(concepts\)\.length;/;
code = code.replace(
  leafCountRegex,
  `const leafCount = studyScope === 'all' ? getTotalLeafCount(concepts) : getLeafConceptIds(concepts).length;

  useEffect(() => {
    if (!selectedMaterial) {
      setAvailableQuestions(null);
      return;
    }
    
    let scopeType = studyScope === 'all' ? 'material' : 'concept';
    let scopeId = studyScope === 'all' ? selectedMaterial : getLeafConceptIds(concepts).join(',');

    // A simpler way for the frontend is to just fetch questions and filter
    const fetchAvailable = async () => {
       try {
         const res = await fetch(\`/api/materials/\${selectedMaterial}/questions\`);
         const qts = await res.json();
         let count = 0;
         if (studyScope === 'all') {
           count = qts.length;
         } else {
           const selectedLeaves = getLeafConceptIds(concepts);
           count = qts.filter((q: any) => selectedLeaves.includes(q.conceptId)).length;
         }
         setAvailableQuestions(count);
       } catch (e) { console.error(e); }
    };
    fetchAvailable();

  }, [selectedMaterial, studyScope, selectedConceptIds, board, questionType]);
  `
);

// Modify submit handler to show error if trying to ask for more questions than available
const submitRegex = /const res = await fetch\('\/api\/study-sessions'/;
code = code.replace(
  submitRegex,
  `
    if (availableQuestions !== null && quantity > availableQuestions) {
      setErrorMsg(\`Há apenas \${availableQuestions} questões disponíveis neste escopo. Reduza a quantidade ou gere mais questões antes de iniciar.\`);
      setIsLoading(false);
      return;
    }

    const res = await fetch('/api/study-sessions'`
);

// Show available questions
const infoBoxRegex = /\{studyScope === 'all' \? \([\s\S]*?\) : \([\s\S]*?\)\}/;
code = code.replace(
  infoBoxRegex,
  `{studyScope === 'all' ? (
               <span className="font-medium">Material completo — você estudará {leafCount} conceitos.</span>
            ) : (
               <span className="font-medium">Você estudará {leafCount} conceitos selecionados.</span>
            )}
            {availableQuestions !== null && (
               <div className="mt-2 font-bold text-blue-800">
                  Questões validadas disponíveis no escopo: {availableQuestions}
               </div>
            )}`
);

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
