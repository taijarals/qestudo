const fs = require('fs');
let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');

const newImports = `import { PdfProcessingService } from '../services/PdfProcessingService';
import { prisma } from '../database/prisma';
`;

code = code.replace("import { storageService } from '../services/storage';", "import { storageService } from '../services/storage';\n" + newImports);

const newMethods = `
  process: async (req: Request, res: Response) => {
    try {
      const processor = new PdfProcessingService();
      // Start processing asynchronously in background to not block the request
      processor.processMaterial(req.params.id as string).catch(console.error);
      res.json({ message: 'Processing started' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getProcessingStatus: async (req: Request, res: Response) => {
    try {
      const data = await prisma.material.findUnique({
        where: { id: req.params.id as string },
        select: { status: true, processingProgress: true, processingError: true, pageCount: true }
      });
      if (!data) return res.status(404).json({ error: 'Not found' });
      
      const chunkCount = await prisma.materialChunk.count({ where: { materialId: req.params.id as string } });
      res.json({ ...data, chunkCount });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getPages: async (req: Request, res: Response) => {
    try {
      const data = await prisma.materialPage.findMany({
        where: { materialId: req.params.id as string },
        orderBy: { pageNumber: 'asc' }
      });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
  getChunks: async (req: Request, res: Response) => {
    try {
      const data = await prisma.materialChunk.findMany({
        where: { materialId: req.params.id as string },
        orderBy: { order: 'asc' }
      });
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
`;

code = code.replace("getById: async (req: Request, res: Response) => {", newMethods + "\n  getById: async (req: Request, res: Response) => {");

fs.writeFileSync('server/controllers/materials.ts', code);
