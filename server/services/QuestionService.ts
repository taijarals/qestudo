import { QuestionRepository } from '../repositories/QuestionRepository';

export const QuestionService = {
  getById: (id: string) => QuestionRepository.findById(id),
};
