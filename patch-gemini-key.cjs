const fs = require('fs');

function patchFile(path) {
  let code = fs.readFileSync(path, 'utf-8');
  if (!code.includes("if (!process.env.GEMINI_API_KEY)")) {
    code = code.replace(
      "this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });",
      `if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`
    );
    fs.writeFileSync(path, code);
  }
}

patchFile('server/services/QuestionGeneratorService.ts');
patchFile('server/services/ConceptMappingService.ts');
patchFile('server/services/QuestionValidatorService.ts');

