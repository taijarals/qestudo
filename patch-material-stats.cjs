const fs = require('fs');

let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  "if (material) {",
  "// removed if (material)"
).replace(
  "setMaterial({ ...material, status: data.status, pageCount: data.pageCount });",
  "setMaterial(prev => prev ? { ...prev, status: data.status, pageCount: data.pageCount } : prev);"
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
