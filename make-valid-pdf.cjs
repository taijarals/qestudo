const { PDFDocument, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
  const page1 = pdfDoc.addPage();
  page1.drawText('This is the first page of a valid PDF!', { x: 50, y: 700, size: 24, font: timesRomanFont });

  const page2 = pdfDoc.addPage();
  page2.drawText('This is the second page, it has more concepts like React and TypeScript.', { x: 50, y: 700, size: 20, font: timesRomanFont });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('dummy.pdf', pdfBytes);
  console.log('Valid dummy.pdf created!');
}

createPdf().catch(console.error);
