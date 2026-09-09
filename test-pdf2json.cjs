const PDFParser = require("pdf2json");
const fs = require('fs');

async function extract(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(this, 1);
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    pdfParser.parseBuffer(buffer);
  });
}

async function test() {
  const buf = fs.readFileSync('dummy.pdf');
  const text = await extract(buf);
  console.log(text);
}
test();
