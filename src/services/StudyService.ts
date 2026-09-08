import { questionRepo } from '../repositories/mock';
import { StudySessionConfig, Question } from '../domain';

export class StudyService {
  async generateQuestionsForSession(config: StudySessionConfig): Promise<Question[]> {
    let pool: Question[] = [];
    
    if (config.mode === 'specific' && config.conceptIds && config.conceptIds.length > 0) {
      for (const cid of config.conceptIds) {
        const questions = await questionRepo.getByConceptId(cid);
        pool.push(...questions);
      }
    } else if (config.materialIds && config.materialIds.length > 0) {
      for (const mid of config.materialIds) {
        const questions = await questionRepo.getByMaterialId(mid);
        pool.push(...questions);
      }
    } else {
      // Return all we have if nothing is specified (mock behavior fallback)
      const allMaterials = ['1', '2', '3']; // just for mock fallback
      for (const mid of allMaterials) {
        const questions = await questionRepo.getByMaterialId(mid);
        pool.push(...questions);
      }
    }

    // Filter by board
    if (config.boards && config.boards.length > 0) {
      pool = pool.filter(q => config.boards.includes(q.board as any));
    }

    // Since mock doesn't have hundreds of questions, we just return the pool sliced to the quantity
    return pool.slice(0, config.quantity);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    return questionRepo.getById(id);
  }
}

export const studyService = new StudyService();
