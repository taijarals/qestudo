const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = "import { aiUsageController } from '../controllers/aiUsage';\n" + code;

const newRoutes = `
// AI Usage routes
apiRouter.get('/ai-usage/summary', aiUsageController.getSummary);
apiRouter.get('/ai-usage/history', aiUsageController.getHistory);
apiRouter.get('/question-batches/:batchId/stats', aiUsageController.getBatchStats);
`;

code = code.replace("export const apiRouter = Router();", "export const apiRouter = Router();\n" + newRoutes);

fs.writeFileSync('server/routes/api.ts', code);
