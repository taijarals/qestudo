const fs = require('fs');
let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

code = code.replace(
  "const pdfParse = require('pdf-parse');",
  "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst pdfParse = require('pdf-parse');"
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
