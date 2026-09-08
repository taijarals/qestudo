import { ENV } from '../../config/env';
import { StudySessionConfig, Question } from '../../domain';

export class ApiStudyService {
  async generateQuestionsForSession(config: StudySessionConfig): Promise<Question[]> {
    // We should hit a backend endpoint for this.
    // For now we will fetch by material or concepts just like mock, 
    // or let's create a custom backend endpoint for generation if needed.
    // Since we didn't create a generation endpoint in the backend, let's simulate it by fetching questions.
    
    let pool: Question[] = [];
    if (config.mode === 'specific' && config.conceptIds && config.conceptIds.length > 0) {
      for (const cid of config.conceptIds) {
        const res = await fetch(`${ENV.API_URL}/concepts/${cid}/questions`);
        const q = await res.json();
        pool.push(...q);
      }
    } else if (config.materialIds && config.materialIds.length > 0) {
      for (const mid of config.materialIds) {
        const res = await fetch(`${ENV.API_URL}/materials/${mid}/questions`);
        const q = await res.json();
        pool.push(...q);
      }
    }

    if (config.boards && config.boards.length > 0) {
      pool = pool.filter(q => config.boards.includes(q.board as any));
    }

    return pool.slice(0, config.quantity);
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const res = await fetch(`${ENV.API_URL}/questions/${id}`);
    if (!res.ok) return undefined;
    return res.json();
  }
}
