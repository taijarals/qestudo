const fs = require('fs');
let code = fs.readFileSync('server/controllers/questions.ts', 'utf-8');

code = code.replace(
  "const planId = req.params.planId;",
  "const planId = req.params.planId as string;"
);

code = code.replace(
  "where: { id: req.params.id },",
  "where: { id: req.params.id as string },"
);

fs.writeFileSync('server/controllers/questions.ts', code);

let apiCode = fs.readFileSync('server/routes/api.ts', 'utf-8');
const searchString = `import { questionController } from '../controllers/questions';
import { questionPlanController } from '../controllers/questionPlans';
import { questionController } from '../controllers/questions';`;

apiCode = apiCode.replace(searchString, `import { questionController } from '../controllers/questions';
import { questionPlanController } from '../controllers/questionPlans';`);
fs.writeFileSync('server/routes/api.ts', apiCode);
