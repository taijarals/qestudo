const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionCoverageService.ts', 'utf-8');

const regex = /\s*\}\s*\}\s*async getCoverageTree\(materialId: string\) \{/;
code = code.replace(regex, "\n  }\n\n  async getCoverageTree(materialId: string) {");

fs.writeFileSync('server/services/QuestionCoverageService.ts', code);
