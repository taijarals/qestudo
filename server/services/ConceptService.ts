import { ConceptRepository } from '../repositories/ConceptRepository';

export const ConceptService = {
  getQuestions: (id: string) => ConceptRepository.findQuestions(id),
  getMastery: (id: string) => ConceptRepository.getMastery(id),
  updateMastery: (id: string, data: any) => ConceptRepository.updateMastery(id, data),
};
