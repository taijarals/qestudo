import { MaterialRepository, ConceptRepository, QuestionRepository, StudySessionRepository, AnswerRepository, ConceptMasteryRepository } from './interfaces';
import { Material, Concept, Question, StudySession, Answer, ConceptMastery } from '../domain';
import { mockMaterials, mockDomainConcepts, mockQuestions, mockDomainMasteries } from '../mocks/data';

class MockMaterialRepository implements MaterialRepository {
  private materials: Material[] = [...mockMaterials];

  async getAll(): Promise<Material[]> {
    return [...this.materials];
  }

  async getById(id: string): Promise<Material | undefined> {
    return this.materials.find(m => m.id === id);
  }

  async create(material: Material): Promise<Material> {
    this.materials.push(material);
    return material;
  }

  async update(id: string, data: Partial<Material>): Promise<Material> {
    const index = this.materials.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Material not found');
    this.materials[index] = { ...this.materials[index], ...data };
    return this.materials[index];
  }
}

class MockConceptRepository implements ConceptRepository {
  private concepts: Concept[] = [...mockDomainConcepts];

  async getByMaterialId(materialId: string): Promise<Concept[]> {
    return this.concepts.filter(c => c.materialId === materialId);
  }

  async getById(id: string): Promise<Concept | undefined> {
    return this.concepts.find(c => c.id === id);
  }
}

class MockQuestionRepository implements QuestionRepository {
  private questions: Question[] = [...mockQuestions];

  async getById(id: string): Promise<Question | undefined> {
    return this.questions.find(q => q.id === id);
  }

  async getByConceptId(conceptId: string): Promise<Question[]> {
    return this.questions.filter(q => q.conceptId === conceptId);
  }

  async getByMaterialId(materialId: string): Promise<Question[]> {
    return this.questions.filter(q => q.materialId === materialId);
  }

  async save(question: Question): Promise<Question> {
    const index = this.questions.findIndex(q => q.id === question.id);
    if (index >= 0) {
      this.questions[index] = question;
    } else {
      this.questions.push(question);
    }
    return question;
  }
}

class MockStudySessionRepository implements StudySessionRepository {
  private sessions: StudySession[] = [];

  async create(session: StudySession): Promise<StudySession> {
    this.sessions.push(session);
    return session;
  }

  async getById(id: string): Promise<StudySession | undefined> {
    return this.sessions.find(s => s.id === id);
  }

  async update(id: string, data: Partial<StudySession>): Promise<StudySession> {
    const index = this.sessions.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Session not found');
    this.sessions[index] = { ...this.sessions[index], ...data };
    return this.sessions[index];
  }
}

class MockAnswerRepository implements AnswerRepository {
  private answers: Answer[] = [];

  async save(answer: Answer): Promise<Answer> {
    const index = this.answers.findIndex(a => a.id === answer.id);
    if (index >= 0) {
      this.answers[index] = answer;
    } else {
      this.answers.push(answer);
    }
    return answer;
  }

  async getBySessionId(sessionId: string): Promise<Answer[]> {
    return this.answers.filter(a => a.sessionId === sessionId);
  }
}

class MockConceptMasteryRepository implements ConceptMasteryRepository {
  private masteries: ConceptMastery[] = [...mockDomainMasteries];

  async getByConceptId(conceptId: string): Promise<ConceptMastery | undefined> {
    return this.masteries.find(m => m.conceptId === conceptId);
  }

  async saveOrUpdate(mastery: ConceptMastery): Promise<ConceptMastery> {
    const index = this.masteries.findIndex(m => m.conceptId === mastery.conceptId);
    if (index >= 0) {
      this.masteries[index] = mastery;
    } else {
      this.masteries.push(mastery);
    }
    return mastery;
  }

  async getAll(): Promise<ConceptMastery[]> {
    return [...this.masteries];
  }
}

export const materialRepo = new MockMaterialRepository();
export const conceptRepo = new MockConceptRepository();
export const questionRepo = new MockQuestionRepository();
export const studySessionRepo = new MockStudySessionRepository();
export const answerRepo = new MockAnswerRepository();
export const conceptMasteryRepo = new MockConceptMasteryRepository();
