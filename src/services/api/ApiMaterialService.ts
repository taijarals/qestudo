import { ENV } from '../../config/env';
import { Material, Concept, ConceptMastery, Question } from '../../domain';

export class ApiMaterialService {
  async getMaterials(): Promise<Material[]> {
    const res = await fetch(`${ENV.API_URL}/materials`);
    return res.json();
  }

  async getMaterialById(id: string): Promise<Material | undefined> {
    const res = await fetch(`${ENV.API_URL}/materials/${id}`);
    if (!res.ok) return undefined;
    return res.json();
  }

  async getMaterialConcepts(materialId: string): Promise<Concept[]> {
    const res = await fetch(`${ENV.API_URL}/materials/${materialId}/concepts`);
    return res.json();
  }

  async getMaterialMasteries(): Promise<ConceptMastery[]> {
    // In a real app with users, we might just get all masteries for the user.
    // Assuming for now it's just all concepts masteries
    // We didn't build an endpoint for ALL masteries, so let's mock or fetch from concepts
    // For now returning empty array as this is a placeholder behavior
    return [];
  }

  async getQuestionsByMaterial(materialId: string): Promise<Question[]> {
    const res = await fetch(`${ENV.API_URL}/materials/${materialId}/questions`);
    return res.json();
  }

  async getQuestionsByConcept(conceptId: string): Promise<Question[]> {
    const res = await fetch(`${ENV.API_URL}/concepts/${conceptId}/questions`);
    return res.json();
  }
}
