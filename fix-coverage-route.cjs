const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const coverageRoute = `
apiRouter.get('/materials/:id/coverage-tree', async (req, res) => {
  try {
    const service = new QuestionCoverageService();
    const coverage = await service.getCoverageTree(req.params.id);
    res.json(coverage);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});
`;

if (!code.includes('/materials/:id/coverage-tree')) {
  code = code.replace("apiRouter.get('/materials/:id/questions', materialController.getQuestions);", "apiRouter.get('/materials/:id/questions', materialController.getQuestions);\n" + coverageRoute);
  fs.writeFileSync('server/routes/api.ts', code);
  console.log("Added coverage-tree route");
}
