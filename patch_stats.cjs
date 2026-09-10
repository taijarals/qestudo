const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  /setProcessingStats\(await res\.json\(\)\);/,
  `const data = await res.json();\n        setProcessingStats({ progress: data.processingProgress || 0, error: data.processingError, chunks: data.chunkCount });`
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
