const fs = require('fs');
let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');
code = code.replace("import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\n", "");
code = code.replace("const { PDFParse } = require('pdf-parse');", "const pdfParse = (await import('pdf-parse')).default;\n        const PDFParse = pdfParse || (await import('pdf-parse'));");
fs.writeFileSync('server/services/PdfProcessingService.ts', code);
