const fs = require('fs');

// Fix PdfProcessingService.ts
let pdfService = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');
pdfService = pdfService.replace("import pdfParse from 'pdf-parse';", "const pdfParse = require('pdf-parse');");
pdfService = pdfService.replace(
  "interface PageData {",
  "interface PageData {\n  hasUsableText?: boolean;"
);

// We need to set hasUsableText in the first loop so the second loop can read it.
pdfService = pdfService.replace(
  /const hasUsableText = p\.text\.length > 50; \/\/ simple heuristic\n\s*if \(hasUsableText\) usablePagesCount\+\+;/g,
  "const hasUsableText = p.text.length > 50; // simple heuristic\n        p.hasUsableText = hasUsableText;\n        if (hasUsableText) usablePagesCount++;"
);
fs.writeFileSync('server/services/PdfProcessingService.ts', pdfService);

// Fix src/domain/Material.ts
let domainMaterial = fs.readFileSync('src/domain/Material.ts', 'utf-8');
domainMaterial = domainMaterial.replace(
  "export type MaterialStatus = 'uploaded' | 'extracting' | 'mapping_concepts' | 'ready' | 'error';",
  "export type MaterialStatus = 'uploaded' | 'extracting' | 'chunking' | 'ready_for_mapping' | 'mapping_concepts' | 'ready' | 'error';"
);
fs.writeFileSync('src/domain/Material.ts', domainMaterial);

// Fix src/pages/MaterialDetails.tsx
let materialDetails = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');
materialDetails = materialDetails.replace('<Badge variant="secondary">', '<Badge variant="outline">');
materialDetails = materialDetails.replace('<Badge variant="destructive">', '<Badge variant="danger">');
fs.writeFileSync('src/pages/MaterialDetails.tsx', materialDetails);

