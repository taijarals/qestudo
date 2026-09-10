const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionGeneratorService.ts', 'utf-8');

code = code.replace("async generateQuestion(planId: string) {", "async generateQuestion(planId: string, batchId?: string) {");

fs.writeFileSync('server/services/QuestionGeneratorService.ts', code);
