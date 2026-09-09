const pdfParseLib = require('pdf-parse');
const fs = require('fs');

async function test() {
  const buffer = fs.readFileSync('dummy.pdf');
  const PDFParse = pdfParseLib.PDFParse || pdfParseLib;
  const parser = new PDFParse(buffer);
  
  // Is it a promise? Or has methods?
  for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(parser))) {
    console.log(key);
  }
}
test();
