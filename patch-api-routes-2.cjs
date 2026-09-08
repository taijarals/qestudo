const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const importReplacement = `import { questionController } from '../controllers/questions';
import { questionPlanController } from '../controllers/questionPlans';`;
code = code.replace("import { questionPlanController } from '../controllers/questionPlans';", importReplacement);

const newRoutes = `
apiRouter.post('/question-plans/:planId/generate', questionController.generate);
apiRouter.get('/questions/:id', questionController.getById);
`;

code = code.replace(
  "apiRouter.get('/concepts/:id/question-plans', questionPlanController.getByConcept);",
  "apiRouter.get('/concepts/:id/question-plans', questionPlanController.getByConcept);\n" + newRoutes
);

fs.writeFileSync('server/routes/api.ts', code);
