import { prisma } from '../database/prisma';

export interface CoverageStats {
  estimatedQuestionCapacity: number;
  validatedQuestionCount: number;
  coverage: number; // 0-100
  remainingPotential: 'high' | 'medium' | 'low' | 'exhausted';
  coverageTypesExplored: string[];
}

export class QuestionCoverageService {
  async getCoverageForScope(materialId: string, scopeId: string | null, scopeType: 'material' | 'discipline' | 'topic' | 'subtopic' | 'concept'): Promise<CoverageStats> {
    // 1. Resolve leaf concepts
    let conceptIds: string[] = [];
    
    if (scopeType === 'material') {
      const concepts = await prisma.concept.findMany({ where: { materialId, level: 'concept' } });
      conceptIds = concepts.map(c => c.id);
    } else if (scopeType === 'concept') {
      conceptIds = [scopeId!];
    } else {
      // Find all descendants that are concepts
      const descendants = await this.getLeafConcepts(scopeId!);
      conceptIds = descendants.map(c => c.id);
    }

    if (conceptIds.length === 0) {
      return {
        estimatedQuestionCapacity: 0,
        validatedQuestionCount: 0,
        coverage: 0,
        remainingPotential: 'exhausted',
        coverageTypesExplored: []
      };
    }

    // 2. Calculate capacity
    // Heuristic: Base 3 per concept. Add 1 if it has sources, add 1 if it has relations.
    let capacity = 0;
    const leafConcepts = await prisma.concept.findMany({
      where: { id: { in: conceptIds } },
      include: {
        sources: true,
        relationsSource: true,
        relationsTarget: true
      }
    });

    for (const c of leafConcepts) {
      let cCap = 2; // base
      if (c.sources.length > 0) cCap += 2;
      if (c.relationsSource.length > 0 || c.relationsTarget.length > 0) cCap += 2;
      capacity += cCap;
    }

    // 3. Count validated questions and types
    const questions = await prisma.question.findMany({
      where: {
        materialId,
        conceptId: { in: conceptIds },
        validationStatus: 'validated'
      },
      select: { id: true, coverageType: true }
    });

    const validatedCount = questions.length;
    const typesExplored = new Set<string>();
    questions.forEach(q => {
      if (q.coverageType) typesExplored.add(q.coverageType);
    });

    // 4. Determine coverage and remaining potential
    let coverage = capacity > 0 ? (validatedCount / capacity) * 100 : 0;
    if (coverage > 95 && validatedCount < capacity) coverage = 95; // cap until really exhausted
    if (coverage > 100) coverage = 100;
    
    // We could consider recent batch failures for exhaustion, but for MVP keep it simple
    let remainingPotential: 'high' | 'medium' | 'low' | 'exhausted' = 'high';
    if (coverage >= 95) remainingPotential = 'exhausted';
    else if (coverage >= 70) remainingPotential = 'low';
    else if (coverage >= 40) remainingPotential = 'medium';

    return {
      estimatedQuestionCapacity: capacity,
      validatedQuestionCount: validatedCount,
      coverage: Math.round(coverage),
      remainingPotential,
      coverageTypesExplored: Array.from(typesExplored)
    };
  }

  private async getLeafConcepts(parentId: string): Promise<any[]> {
    const directChildren = await prisma.concept.findMany({ where: { parentId } });
    let leaves: any[] = [];
    for (const child of directChildren) {
      if (child.level === 'concept') {
        leaves.push(child);
      } else {
        leaves = leaves.concat(await this.getLeafConcepts(child.id));
      }
    }
    return leaves;
  }

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

}