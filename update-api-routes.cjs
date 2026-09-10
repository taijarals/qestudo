const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const batchEndpoints = `
apiRouter.post('/question-batches', async (req, res) => {
  try {
    const { prisma } = require('../database/prisma');
    const params = req.body;
    
    // Validar se o escopo possui conceitos disponíveis
    let conceptCount = 0;
    if (params.scopeType === 'material') {
      conceptCount = await prisma.concept.count({
        where: { materialId: params.materialId, level: 'concept' }
      });
    } else if (params.scopeType === 'concept') {
       conceptCount = await prisma.concept.count({
         where: { id: params.scopeId, materialId: params.materialId, level: 'concept' }
       });
    } else if (['discipline', 'topic', 'subtopic'].includes(params.scopeType)) {
       // Check if there are any leaf concepts down the tree? Or at least the node exists
       const node = await prisma.concept.findUnique({ where: { id: params.scopeId } });
       if (node && node.materialId === params.materialId) {
          // We assume there are concepts if the node exists, or we could leave to the service to fail
          // But to be safe, we just check existence
          conceptCount = 1; 
       }
    }
    
    if (conceptCount === 0 && params.scopeType === 'material') {
      return res.status(400).json({
        error: "no_concepts_available",
        message: "Este material ainda não possui conceitos disponíveis para geração."
      });
    }

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
`;

if (!code.includes('/question-batches')) {
    code = code.replace('export const apiRouter = Router();', 'export const apiRouter = Router();\n' + batchEndpoints);
}

fs.writeFileSync('server/routes/api.ts', code);
