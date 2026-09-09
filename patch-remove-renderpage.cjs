const fs = require('fs');
let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');
const start = code.indexOf("const renderPage = async");
const end = code.indexOf("try {", start);
if (start > -1 && end > -1) {
  code = code.substring(0, start) + code.substring(end);
}
fs.writeFileSync('server/services/PdfProcessingService.ts', code);
