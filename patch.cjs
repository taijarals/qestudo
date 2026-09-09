const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');
code = code.replace(
  "questionCountByConcept[c.id] = count > 0 ? count : (c.name.length * 2);",
  "questionCountByConcept[c.id] = questions.filter(q => q.conceptId === c.id && q.validationStatus === 'validated').length;"
);
fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
