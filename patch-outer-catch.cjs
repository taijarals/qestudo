const fs = require('fs');
let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');
code = code.replace(
  "console.error('Error processing PDF:', error);",
  "console.error('OUTER CATCH REACHED:', error);"
);
fs.writeFileSync('server/services/PdfProcessingService.ts', code);
