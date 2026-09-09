const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  "data.status === 'ready_for_mapping' || data.status === 'error' || data.status === 'ready' || data.status === 'mapping_error'",
  "['ready_for_mapping', 'error', 'processing_error', 'ready', 'mapping_error', 'pdf_requires_ocr'].includes(data.status)"
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
