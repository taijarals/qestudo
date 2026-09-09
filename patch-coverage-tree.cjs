const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionCoverageService.ts', 'utf-8');

code += `
  async getCoverageTree(materialId: string) {
    const materialCoverage = await this.getCoverageForScope(materialId, null, 'material');
    
    const concepts = await prisma.concept.findMany({ where: { materialId } });
    const nodeCoverages: Record<string, CoverageStats> = {};
    
    // Simple approach: calculate for each concept. For MVP, this is acceptable for < 100 concepts
    for (const c of concepts) {
      nodeCoverages[c.id] = await this.getCoverageForScope(materialId, c.id, c.level as any);
    }
    
    return {
      material: materialCoverage,
      nodes: nodeCoverages
    };
  }
`;

fs.writeFileSync('server/services/QuestionCoverageService.ts', code);
