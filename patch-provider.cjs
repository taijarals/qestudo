const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionProviderService.ts', 'utf-8');

const regex = /else \{\s*\/\/ 2\. Generate on demand[\s\S]*?if \(!selectedQuestion\) \{\s*throw new Error\('question_generation_failed'\);\s*\}\s*\}/;

code = code.replace(regex, `else {
      throw new Error('insufficient_question_bank');
    }`);

fs.writeFileSync('server/services/QuestionProviderService.ts', code);
