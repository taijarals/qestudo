const { PDFParse } = require('pdf-parse');
const fs = require('fs');
async function run() {
  const buf = fs.readFileSync('dummy.pdf');
  const parser = new PDFParse(buf);
  console.log("parser methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
  
  const text = await parser.getText();
  console.log("Text:", text);
}
run();
