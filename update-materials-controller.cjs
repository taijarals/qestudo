const fs = require('fs');
let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');

const oldGetConcepts = `
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
                      children: true
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

const newGetConcepts = `
  getConcepts: async (req: Request, res: Response) => {
    try {
      const concepts = await prisma.concept.findMany({
        where: { materialId: req.params.id as string }
      });
      res.json(concepts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },
`;

// It seems there are newlines and spaces, so regex replacement is better.
const startIndex = code.indexOf("getConcepts: async (req: Request, res: Response) => {");
const endIndex = code.indexOf("  getQuestions:", startIndex);
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newGetConcepts.trim() + ",\n\n" + code.substring(endIndex);
  fs.writeFileSync('server/controllers/materials.ts', code);
  console.log("Replaced successfully");
} else {
  console.log("Not found");
}
