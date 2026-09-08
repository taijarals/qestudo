const fs = require('fs');
let code = fs.readFileSync('server/services/ConceptMasteryService.ts', 'utf-8');

code = code.replace(
  "const { conceptId, isCorrect, responseType, difficulty, confusedConceptId } = params;",
  "const { conceptId, isCorrect, responseType, difficulty, confusedConceptId: confusedWithConceptId } = params;"
);

fs.writeFileSync('server/services/ConceptMasteryService.ts', code);
