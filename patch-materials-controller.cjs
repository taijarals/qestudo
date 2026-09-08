const fs = require('fs');
let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');

const importStatement = "import { ConceptMappingService } from '../services/ConceptMappingService';\n";
code = importStatement + code;

const newMethods = `
  mapConcepts: async (req: Request, res: Response) => {
    try {
      const mapper = new ConceptMappingService();
      mapper.mapConcepts(req.params.id as string).catch(console.error);
      res.json({ message: 'Mapping started' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
`;

code = code.replace("process: async (req: Request, res: Response) => {", newMethods + "\n  process: async (req: Request, res: Response) => {");

fs.writeFileSync('server/controllers/materials.ts', code);
