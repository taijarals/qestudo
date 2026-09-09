const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionCoverageService.ts', 'utf-8');

code = code.replace(
  /    return leaves;\n  }\n}\n  async getCoverageTree\(materialId: string\) \{/,
  '    return leaves;\n  }\n\n  async getCoverageTree(materialId: string) {'
);

code += '\n}';

fs.writeFileSync('server/services/QuestionCoverageService.ts', code);
