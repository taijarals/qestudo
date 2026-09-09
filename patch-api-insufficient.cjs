const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  "if (e.message === 'question_generation_failed') {",
  "if (e.message === 'insufficient_question_bank' || e.message === 'question_generation_failed') {"
);

code = code.replace(
  "return res.status(503).json({ error: 'Failed to generate a valid question' });",
  "return res.status(503).json({ error: e.message === 'insufficient_question_bank' ? 'Banco de questões insuficiente para este escopo. Gere mais questões antes de continuar.' : 'Failed to generate a valid question' });"
);

fs.writeFileSync('server/routes/api.ts', code);
