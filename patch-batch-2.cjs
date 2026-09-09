const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionBatchGenerationService.ts', 'utf-8');
code = code.replace(
  /const questionId = await this\.generator\.generateQuestion\(plan\.id\);/,
  "const generatedQ = await this.generator.generateQuestion(plan.id);\n        if (!generatedQ) throw new Error('Generation failed');\n        const questionId = generatedQ.id;"
);
fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
