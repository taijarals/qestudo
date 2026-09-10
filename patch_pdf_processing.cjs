const fs = require('fs');

let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

code = code.replace(
  /\/\/ Automatically start concept mapping for seamless MVP experience\s*const mapper = new ConceptMappingService\(\);\s*mapper\.mapConcepts\(materialId\)\.catch\(console\.error\);/,
  ""
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
