const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  "apiRouter.get('/materials/:id', materialController.getById);",
  "apiRouter.get('/materials/:id', materialController.getById);\napiRouter.post('/materials/:id/process', materialController.process);\napiRouter.get('/materials/:id/processing-status', materialController.getProcessingStatus);\napiRouter.get('/materials/:id/pages', materialController.getPages);\napiRouter.get('/materials/:id/chunks', materialController.getChunks);"
);

fs.writeFileSync('server/routes/api.ts', code);
