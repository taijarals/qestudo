const fs = require('fs');
let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');

const getConceptsCode = `
  getConcepts: async (req: Request, res: Response) => {
    try {
      const disciplines = await prisma.concept.findMany({
        where: { materialId: req.params.id as string, level: 'discipline' },
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: {
                    include: {
                      sources: { include: { materialChunk: true } }
                    }
                  }
                }
              }
            }
          }
        }
      });
      res.json(disciplines);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
`;

code = code.replace("getConcepts: async (req: Request, res: Response) => {\n    try {\n      const data = await MaterialService.getConcepts(req.params.id as string);\n      res.json(data);\n    } catch (e: any) {\n      res.status(500).json({ error: e.message });\n    }\n  },", getConceptsCode);

fs.writeFileSync('server/controllers/materials.ts', code);
