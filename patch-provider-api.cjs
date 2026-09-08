const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const importStatement = `import { questionProviderController } from '../controllers/questionProvider';
import { answersController } from '../controllers/answers';`;

if (!code.includes('questionProviderController')) {
    code = code.replace("import { questionController } from '../controllers/questions';", 
    `import { questionController } from '../controllers/questions';\n${importStatement}`);
}

const newRoutes = `
apiRouter.post('/questions/provide', questionProviderController.provide);
apiRouter.post('/answers', answersController.submit);
`;

if (!code.includes("apiRouter.post('/questions/provide'")) {
    code = code.replace(
      "apiRouter.post('/questions/:id/validate', async (req, res) => {",
      newRoutes + "\napiRouter.post('/questions/:id/validate', async (req, res) => {"
    );
}

fs.writeFileSync('server/routes/api.ts', code);
