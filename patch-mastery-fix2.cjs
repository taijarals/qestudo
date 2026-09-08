const fs = require('fs');
let code = fs.readFileSync('server/services/ConceptMasteryService.ts', 'utf-8');

code = code.replace(
  "if (confusedConceptId && confusedConceptId !== conceptId) {",
  "if (confusedWithConceptId && confusedWithConceptId !== conceptId) {"
);

fs.writeFileSync('server/services/ConceptMasteryService.ts', code);
