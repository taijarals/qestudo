const { PDFParse } = require('pdf-parse');
const fs = require('fs');
async function run() {
  const buf = fs.readFileSync('dummy.pdf');
  const parser = new PDFParse(new Uint8Array(buf));
  const text = await parser.getText();
  console.log(text);
}
run();
