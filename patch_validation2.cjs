const fs = require('fs');

let code = fs.readFileSync('server/services/QuestionBatchValidatorService.ts', 'utf-8');

code = code.replace(/validationPromptVersion: /g, 'validatorPromptVersion: ');

fs.writeFileSync('server/services/QuestionBatchValidatorService.ts', code);
