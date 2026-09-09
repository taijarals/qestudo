const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionBatchGenerationService.ts', 'utf-8');
code = code.replace(/board: batch\.board,/g, 'board: batch.board as any,');
code = code.replace(/questionType: batch\.questionType,/g, 'questionType: batch.questionType as any,');
code = code.replace(/difficulty: 'medium'/g, "difficulty: 'media'");
fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
