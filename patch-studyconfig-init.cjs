const fs = require('fs');
let code = fs.readFileSync('src/pages/StudyConfig.tsx', 'utf-8');

code = code.replace(
  "const initialMaterialId = state?.materialId || '';",
  "const initialMaterialId = state?.materialId || searchParams.get('materialId') || '';"
);

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
