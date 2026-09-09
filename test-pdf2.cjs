const pdfParseLib = require('pdf-parse');
const fs = require('fs');

async function test() {
  const buffer = fs.readFileSync('dummy.pdf');
  try {
    const PDFParse = pdfParseLib.PDFParse || pdfParseLib;
    // Try to instantiate it
    const parser = new PDFParse(buffer);
    console.log(Object.keys(parser));
  } catch (e) {
    console.log(e);
  }
}
test();
