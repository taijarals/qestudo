import { materialRepo, conceptRepo, conceptMasteryRepo, questionRepo } from '../repositories/mock';
import { Material, Concept, ConceptMastery, Question } from '../domain';

export class MaterialService {
  async getMaterials(): Promise<Material[]> {
    return materialRepo.getAll();
  }

  async getMaterialById(id: string): Promise<Material | undefined> {
    return materialRepo.getById(id);
  }

  async getMaterialConcepts(materialId: string): Promise<Concept[]> {
    return conceptRepo.getByMaterialId(materialId);
  }

  async getMaterialMasteries(): Promise<ConceptMastery[]> {
    return conceptMasteryRepo.getAll();
  }

  async getQuestionsByMaterial(materialId: string): Promise<Question[]> {
    return questionRepo.getByMaterialId(materialId);
  }

  async getQuestionsByConcept(conceptId: string): Promise<Question[]> {
    return questionRepo.getByConceptId(conceptId);
  }
}

