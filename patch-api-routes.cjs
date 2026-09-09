const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = `
import { QuestionBatchGenerationService } from '../services/QuestionBatchGenerationService';
import { QuestionCoverageService } from '../services/QuestionCoverageService';
` + code;

const batchEndpoints = `
apiRouter.post('/question-batches', async (req, res) => {
  try {
    const service = new QuestionBatchGenerationService();
    const batch = await service.startBatch(req.body);
    res.json(batch);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

apiRouter.get('/question-batches/:id', async (req, res) => {
  try {
    const { prisma } = require('../database/prisma');
    const batch = await prisma.questionBatch.findUnique({ where: { id: req.params.id } });
    if (!batch) return res.status(404).json({error: 'Not found'});
    res.json(batch);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

apiRouter.get('/materials/:id/coverage', async (req, res) => {
  try {
    const service = new QuestionCoverageService();
    const scopeId = req.query.scopeId as string | undefined;
    const scopeType = (req.query.scopeType || 'material') as any;
    const coverage = await service.getCoverageForScope(req.params.id, scopeId || null, scopeType);
    res.json(coverage);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});
`;

code = code.replace("export { apiRouter };", batchEndpoints + "\nexport { apiRouter };");

fs.writeFileSync('server/routes/api.ts', code);
