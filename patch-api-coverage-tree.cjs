const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  "apiRouter.get('/materials/:id/coverage', async (req, res) => {",
  `apiRouter.get('/materials/:id/coverage-tree', async (req, res) => {
  try {
    const service = new QuestionCoverageService();
    const tree = await service.getCoverageTree(req.params.id);
    res.json(tree);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

apiRouter.get('/materials/:id/coverage', async (req, res) => {`
);

fs.writeFileSync('server/routes/api.ts', code);
