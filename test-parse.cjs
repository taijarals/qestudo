const pdfParse = require('pdf-parse');
const fs = require('fs');
async function run() {
  const buf = fs.readFileSync('dummy.pdf');
  try {
    const data = await pdfParse(buf);
    console.log("Pages:", data.numpages);
    console.log("Text:", data.text);
  } catch (e) {
    console.error(e);
  }
}
run();
