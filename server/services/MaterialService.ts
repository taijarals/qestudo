import { MaterialRepository } from '../repositories/MaterialRepository';

export const MaterialService = {
  getAll: () => MaterialRepository.findAll(),
  getById: (id: string) => MaterialRepository.findById(id),
  getConcepts: (id: string) => MaterialRepository.findConcepts(id),
  getQuestions: (id: string) => MaterialRepository.findQuestions(id),
  create: (data: any) => MaterialRepository.create(data),
  delete: (id: string) => MaterialRepository.delete(id)
};
