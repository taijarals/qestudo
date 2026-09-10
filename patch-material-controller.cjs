const fs = require('fs');
let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');
code = code.replace("export const materialController = {", "import { MaterialDeletionService } from '../services/MaterialDeletionService';\n\nexport const materialController = {\n  delete: async (req: Request, res: Response) => {\n    try {\n      const deletionService = new MaterialDeletionService();\n      const result = await deletionService.deleteMaterial(req.params.id);\n      res.json(result);\n    } catch (e: any) {\n      if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });\n      res.status(500).json({ error: e.message });\n    }\n  },");
fs.writeFileSync('server/controllers/materials.ts', code);
