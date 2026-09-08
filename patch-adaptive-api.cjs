const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const importStatement = `import { StudyNextQuestionService } from '../services/StudyNextQuestionService';\nconst studyNextQuestionService = new StudyNextQuestionService();`;

if (!code.includes('StudyNextQuestionService')) {
    code = code.replace("import { questionProviderController }", 
    `${importStatement}\nimport { questionProviderController }`);
}

const newRoutes = `
apiRouter.post('/study-sessions/:id/next-question', async (req, res) => {
  try {
    const result = await studyNextQuestionService.getNextQuestion(req.params.id);
    res.json(result);
  } catch(e: any) {
    if (e.message === 'question_generation_failed') {
      return res.status(503).json({ error: 'Failed to generate a valid question' });
    }
    if (e.message === 'Session is already complete' || e.message === 'Session is not active') {
      return res.status(400).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({error: e.message});
  }
});
`;

if (!code.includes("apiRouter.post('/study-sessions/:id/next-question'")) {
    code = code.replace(
      "apiRouter.post('/answers', answersController.submit);",
      "apiRouter.post('/answers', answersController.submit);\n" + newRoutes
    );
}

fs.writeFileSync('server/routes/api.ts', code);
