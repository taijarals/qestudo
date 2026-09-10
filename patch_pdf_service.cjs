const fs = require('fs');

let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

code = code.replace(
  /const PDFParse = \(pdfParseModule as any\)\.default \|\| pdfParseModule;\n\s*const parser = new PDFParse\(new Uint8Array\(fileBuffer\)\);/,
  `const PDFParse = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default?.PDFParse;\n        const parser = new PDFParse(new Uint8Array(fileBuffer));`
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
