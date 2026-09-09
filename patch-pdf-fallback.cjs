const fs = require('fs');

let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

code = code.replace(
  `      try {
        await pdfParse(fileBuffer, { pagerender: renderPage });
      } catch (err) {
        console.warn("pdfParse failed, simulating extraction for MVP", err);
        pages.push({
          pageNumber: 1,
          text: fileBuffer.toString('utf-8').replace(/[^a-zA-Z0-9.,?!\\s]/g, ' ')
        });
      }`,
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
      }`
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
