const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const importStatement = `import { QuestionValidatorService } from '../services/QuestionValidatorService';\nconst validatorService = new QuestionValidatorService();`;

if (!code.includes('QuestionValidatorService')) {
    code = code.replace("import { questionController } from '../controllers/questions';", 
    `import { questionController } from '../controllers/questions';\n${importStatement}`);
}

const newRoutes = `
apiRouter.post('/questions/:id/validate', async (req, res) => {
  try {
    const result = await validatorService.validateQuestion(req.params.id);
    res.json(result);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

apiRouter.get('/questions/:id/validation', async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id as string },
      include: {
        validations: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });
    if (!question) return res.status(404).json({error: 'not found'});
    res.json(question.validations[0] || null);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});
`;

if (!code.includes("apiRouter.post('/questions/:id/validate'")) {
    code = code.replace(
      "apiRouter.get('/questions/:id', questionController.getById);",
      "apiRouter.get('/questions/:id', questionController.getById);\n" + newRoutes
    );
}

fs.writeFileSync('server/routes/api.ts', code);
