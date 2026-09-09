const fs = require('fs');
let code = fs.readFileSync('server/tests/ComprehensionFeedback.test.ts', 'utf-8');

code = code.replace(
  "questionIds: [questionId]",
  "questionIds: [questionId],\n        status: 'active'"
);

fs.writeFileSync('server/tests/ComprehensionFeedback.test.ts', code);
