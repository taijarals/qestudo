const fs = require('fs');
let code = fs.readFileSync('server/services/AdaptiveStudyEngine.ts', 'utf-8');

code = code.replace(
  "export interface AdaptiveTarget {",
  "export interface AdaptiveTarget {\n  materialId: string;"
);

code = code.replace(
  "return {\n      category: selectedCategory.name,\n      conceptId: selectedConcept.id,",
  "return {\n      category: selectedCategory.name,\n      conceptId: selectedConcept.id,\n      materialId: selectedConcept.materialId,"
);

fs.writeFileSync('server/services/AdaptiveStudyEngine.ts', code);
