import { Material, Concept, Question, StudySession, Answer, ConceptMastery } from '../domain';

export interface MaterialRepository {
  getAll(): Promise<Material[]>;
  getById(id: string): Promise<Material | undefined>;
  create(material: Material): Promise<Material>;
  update(id: string, data: Partial<Material>): Promise<Material>;
}

export interface ConceptRepository {
  getByMaterialId(materialId: string): Promise<Concept[]>;
  getById(id: string): Promise<Concept | undefined>;
}

export interface QuestionRepository {
  getById(id: string): Promise<Question | undefined>;
  getByConceptId(conceptId: string): Promise<Question[]>;
  getByMaterialId(materialId: string): Promise<Question[]>;
  save(question: Question): Promise<Question>;
}

export interface StudySessionRepository {
  create(session: StudySession): Promise<StudySession>;
  getById(id: string): Promise<StudySession | undefined>;
  update(id: string, data: Partial<StudySession>): Promise<StudySession>;
}

export interface AnswerRepository {
  save(answer: Answer): Promise<Answer>;
  getBySessionId(sessionId: string): Promise<Answer[]>;
}

export interface ConceptMasteryRepository {
  getByConceptId(conceptId: string): Promise<ConceptMastery | undefined>;
  saveOrUpdate(mastery: ConceptMastery): Promise<ConceptMastery>;
  getAll(): Promise<ConceptMastery[]>;
}
