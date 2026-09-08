const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  "apiRouter.post('/materials/:id/process', materialController.process);",
  "apiRouter.post('/materials/:id/process', materialController.process);\napiRouter.post('/materials/:id/map-concepts', materialController.mapConcepts);"
);

// We should also update the concept fetching to include the hierarchy.
code = code.replace(
  "apiRouter.get('/materials/:id/concepts', materialController.getConcepts);",
  "// apiRouter.get('/materials/:id/concepts', materialController.getConcepts);"
);

fs.writeFileSync('server/routes/api.ts', code);
