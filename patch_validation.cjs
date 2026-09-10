const fs = require('fs');

let code = fs.readFileSync('server/services/QuestionBatchValidatorService.ts', 'utf-8');

code = code.replace(/isValid: false,\n/g, '');
code = code.replace(/isValid: isApproved,\n/g, '');

fs.writeFileSync('server/services/QuestionBatchValidatorService.ts', code);
