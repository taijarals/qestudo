const fs = require('fs');
let code = fs.readFileSync('src/pages/SessionResult.tsx', 'utf-8');

code = code.replace(
  "const total = activeSession.quantity || answers.length;",
  `const total = activeSession.quantity || answers.length;
  
  // Calculate basic stats for composition (not complete questions, but based on session setup or answers)
  const boardStats: Record<string, number> = {};
  const typeStats: Record<string, number> = {};
  
  if (activeSession.boards) {
    activeSession.boards.forEach(b => boardStats[b] = total);
  }
  
  if (activeSession.questionTypes) {
    activeSession.questionTypes.forEach(t => typeStats[t] = total);
  }
  
  const formatQuestionType = (t: string) => {
    if (t === 'certo-errado') return 'Certo / Errado';
    if (t === 'multipla-escolha') return 'Múltipla Escolha';
    return t;
  };
`
);

if (!code.includes("boardStats")) {
   console.log("Failed to patch boardStats");
}

fs.writeFileSync('src/pages/SessionResult.tsx', code);
