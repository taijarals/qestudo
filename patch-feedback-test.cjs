const fs = require('fs');
let code = fs.readFileSync('server/tests/ComprehensionFeedback.test.ts', 'utf-8');

code = code.replace(
  "data: { name: 'Test Material', type: 'PDF' }",
  "data: { title: 'Test Material', description: 'desc' }"
);

fs.writeFileSync('server/tests/ComprehensionFeedback.test.ts', code);
