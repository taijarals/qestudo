import { prisma } from '../database/prisma';

export interface AdaptiveTarget {
  materialId: string;
  category: string;
  conceptId: string;
  difficulty: string;
  reason: string;
  masteryScore: number;
}

export class AdaptiveStudyEngine {
  private config = {
    weak: 0.40,
    review: 0.25,
    new: 0.20,
    maintenance: 0.10,
    challenge: 0.05
  };

  async selectTarget(params: {
    materialIds: string[];
    conceptIds?: string[];
    excludeConceptIds?: string[];
    recentConceptIds?: string[];
  }): Promise<AdaptiveTarget> {
    const { materialIds, conceptIds, excludeConceptIds, recentConceptIds } = params;
    
    // Determine the base concept universe
    const whereClause: any = { materialId: { in: materialIds } };
    if (conceptIds && conceptIds.length > 0) {
      whereClause.id = { in: conceptIds };
    }
    
    let toExclude = [...(excludeConceptIds || []), ...(recentConceptIds || [])];
    
    // We fetch all mastery records for the available concepts
    const concepts = await prisma.concept.findMany({
      where: whereClause,
      include: { mastery: true }
    });

    if (concepts.length === 0) {
      throw new Error('No concepts found in the specified scope');
    }

    const availableConcepts = concepts.filter(c => !toExclude.includes(c.id));
    
    // If all concepts are excluded (e.g. very small scope), just use all concepts
    const candidatePool = availableConcepts.length > 0 ? availableConcepts : concepts;

    const weak: any[] = [];
    const review: any[] = [];
    const newConcepts: any[] = [];
    const maintenance: any[] = [];
    const challenge: any[] = [];

    const now = new Date();

    for (const c of candidatePool) {
      if (!c.mastery || c.mastery.status === 'not_seen') {
        newConcepts.push(c);
        continue;
      }

      if (c.mastery.nextReviewAt && c.mastery.nextReviewAt <= now) {
        review.push(c);
      } else if (c.mastery.status === 'learning' || c.mastery.masteryScore < 0.5) {
        weak.push(c);
      } else if (c.mastery.status === 'mastered') {
        maintenance.push(c);
        challenge.push(c);
      } else if (c.mastery.status === 'consolidating') {
        maintenance.push(c);
        challenge.push(c);
      }
    }

    const categories = [
      { name: 'weak', pool: weak, prob: this.config.weak },
      { name: 'review', pool: review, prob: this.config.review },
      { name: 'new', pool: newConcepts, prob: this.config.new },
      { name: 'maintenance', pool: maintenance, prob: this.config.maintenance },
      { name: 'challenge', pool: challenge, prob: this.config.challenge }
    ];

    // Select category based on probability, with fallback
    let selectedCategory = null;
    let selectedConcept = null;

    // Shuffle categories and try picking based on random weight, but fallback if empty
    const roll = Math.random();
    let accum = 0;
    
    for (const cat of categories) {
      accum += cat.prob;
      if (roll <= accum && cat.pool.length > 0) {
        selectedCategory = cat;
        break;
      }
    }

    // Fallback if the rolled category is empty or roll missed
    if (!selectedCategory) {
      const availableCategories = categories.filter(c => c.pool.length > 0);
      if (availableCategories.length === 0) {
        throw new Error('No available concepts for any category');
      }
      // Pick randomly from available categories
      selectedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    }

    // Pick concept within category
    // For 'weak', sort by lowest score
    if (selectedCategory.name === 'weak') {
      selectedCategory.pool.sort((a, b) => (a.mastery?.masteryScore || 0) - (b.mastery?.masteryScore || 0));
      selectedConcept = selectedCategory.pool[0]; // pick the weakest
    } 
    // For 'review', sort by most overdue
    else if (selectedCategory.name === 'review') {
      selectedCategory.pool.sort((a, b) => (a.mastery?.nextReviewAt?.getTime() || 0) - (b.mastery?.nextReviewAt?.getTime() || 0));
      selectedConcept = selectedCategory.pool[0];
    } 
    // For others, pick random
    else {
      selectedConcept = selectedCategory.pool[Math.floor(Math.random() * selectedCategory.pool.length)];
    }

    // Determine difficulty
    let difficulty = 'media';
    let reason = 'selected';
    if (selectedCategory.name === 'new') {
      difficulty = 'facil'; // start easy
      reason = 'not_seen';
    } else if (selectedCategory.name === 'weak') {
      difficulty = selectedConcept.mastery.masteryScore < 0.3 ? 'facil' : 'media';
      reason = 'low_score';
    } else if (selectedCategory.name === 'review') {
      difficulty = 'media';
      reason = 'review_due';
    } else if (selectedCategory.name === 'maintenance') {
      difficulty = 'media';
      reason = 'mastered_maintenance';
    } else if (selectedCategory.name === 'challenge') {
      difficulty = 'dificil';
      reason = 'challenge_mastered';
    }

    return {
      category: selectedCategory.name,
      conceptId: selectedConcept.id,
      materialId: selectedConcept.materialId,
      difficulty,
      reason,
      masteryScore: selectedConcept.mastery?.masteryScore || 0
    };
  }
}
