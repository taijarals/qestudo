const fs = require('fs');
let code = fs.readFileSync('src/domain/Material.ts', 'utf-8');

code = code.replace(
  "export type MaterialStatus = 'uploaded' | 'extracting' | 'chunking' | 'ready_for_mapping' | 'mapping_concepts' | 'ready' | 'error';",
  "export type MaterialStatus = 'uploaded' | 'extracting' | 'chunking' | 'ready_for_mapping' | 'mapping_concepts' | 'ready' | 'error' | 'mapping_error';"
);

fs.writeFileSync('src/domain/Material.ts', code);
