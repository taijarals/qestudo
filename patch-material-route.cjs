const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');
code = code.replace("apiRouter.get('/materials/:id', materialController.getById);", "apiRouter.get('/materials/:id', materialController.getById);\napiRouter.delete('/materials/:id', materialController.delete);");
fs.writeFileSync('server/routes/api.ts', code);
