const fs = require('fs');
let code = fs.readFileSync('src/components/ViewQuestionsModal.tsx', 'utf-8');
code = code.replace(/variant="secondary"/g, 'variant="blue"');
fs.writeFileSync('src/components/ViewQuestionsModal.tsx', code);
