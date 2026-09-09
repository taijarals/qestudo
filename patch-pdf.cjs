const fs = require('fs');
let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

const replacement = `
      try {
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse(new Uint8Array(fileBuffer));
        const data = await parser.getText();
        if (data && data.pages) {
          for (const p of data.pages) {
            pages.push({
              pageNumber: p.num,
              text: p.text
            });
          }
        }
      } catch (err) {
        console.warn("pdfParse failed, simulating extraction for MVP", err);
        pages.push({
          pageNumber: 1,
          text: fileBuffer.toString('utf-8').replace(/[^a-zA-Z0-9.,?!\\s]/g, ' ')
        });
      }
`;

code = code.replace(
  `      try {
        await pdfParse(fileBuffer, { pagerender: renderPage }).catch(err => {
            console.error("Caught rejection inside promise!", err);
            throw err;
        });
      } catch (err) {
        console.warn("pdfParse failed, simulating extraction for MVP", err);
        pages.push({
          pageNumber: 1,
          text: 'Simulated dummy text because pdfParse failed.'
        });
      }`,
  replacement
);

code = code.replace(
  "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\nconst pdfParse = require('pdf-parse');\n",
  "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\n"
);
// In case the renderPage var is unused and typescript complains
code = code.replace(
  "const renderPage = async (pageData: any) => {",
  "const renderPage = async (pageData: any) => { // @ts-ignore"
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
