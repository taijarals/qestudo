const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  "// apiRouter.get('/materials/:id/concepts', materialController.getConcepts);",
  "apiRouter.get('/materials/:id/concepts', materialController.getConcepts);"
);

fs.writeFileSync('server/routes/api.ts', code);
