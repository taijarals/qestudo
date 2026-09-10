const fs = require('fs');
let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');
code = code.replace("await deletionService.deleteMaterial(req.params.id);", "await deletionService.deleteMaterial(req.params.id as string);");
fs.writeFileSync('server/controllers/materials.ts', code);

code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');
code = code.replace("const pdfParse = (await import('pdf-parse')).default;\n        const PDFParse = pdfParse || (await import('pdf-parse'));", "const pdfParseModule = await import('pdf-parse');\n        const PDFParse = (pdfParseModule as any).default || pdfParseModule;");
fs.writeFileSync('server/services/PdfProcessingService.ts', code);
