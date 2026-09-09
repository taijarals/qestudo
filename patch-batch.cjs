const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionBatchGenerationService.ts', 'utf-8');
code = code.replace(/createPlan/g, 'planQuestion');
code = code.replace(/generateFromPlan/g, 'generateQuestion');
code = code.replace(/valResult\.status/g, 'valResult.validationStatus');
code = code.replace(/question\?\.id \|\| questionId/g, 'questionId'); // if needed
fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
