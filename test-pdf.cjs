const pdfParseLib = require('pdf-parse');
const fs = require('fs');

async function test() {
  const buffer = fs.readFileSync('dummy.pdf');
  try {
    const fn = pdfParseLib.PDFParse || pdfParseLib;
    console.log("fn type", typeof fn);
    const result = await fn(buffer);
    console.log(result.text);
  } catch (e) {
    console.log(e);
  }
}
test();
