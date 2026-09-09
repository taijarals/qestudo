const pdfParseLib = require('pdf-parse');
const fs = require('fs');

async function test() {
  const buffer = fs.readFileSync('dummy.pdf');
  const parser = new pdfParseLib.PDFParse(buffer);
  const text = await parser.getText();
  console.log(text);
}
test();
