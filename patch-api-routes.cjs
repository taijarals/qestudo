const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const importReplacement = `import { questionPlanController } from '../controllers/questionPlans';
import { materialController } from '../controllers/materials';`;
code = code.replace("import { materialController } from '../controllers/materials';", importReplacement);

const newRoutes = `
apiRouter.post('/question-plans', questionPlanController.create);
apiRouter.get('/question-plans/:id', questionPlanController.getById);
apiRouter.get('/concepts/:id/question-plans', questionPlanController.getByConcept);
`;

code = code.replace(
  "apiRouter.get('/materials/:id/concepts', materialController.getConcepts);",
  "apiRouter.get('/materials/:id/concepts', materialController.getConcepts);\n" + newRoutes
);

fs.writeFileSync('server/routes/api.ts', code);
