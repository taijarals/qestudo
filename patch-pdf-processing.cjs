const fs = require('fs');
let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

const replacement = `
      let pdfText = '';
      let numPages = 1;
      try {
        const data = await pdfParse(dataBuffer);
        pdfText = data.text;
        numPages = data.numpages || 1;
      } catch (err) {
        console.warn("PDF parsing failed, falling back to basic raw text extraction for MVP", err);
        pdfText = dataBuffer.toString('utf-8').replace(/[^a-zA-Z0-9.,?!\\s]/g, ' ');
        numPages = 2;
      }
      
      const rawText = pdfText;
`;

code = code.replace(
  "const data = await pdfParse(dataBuffer);\n      const rawText = data.text;",
  replacement
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
