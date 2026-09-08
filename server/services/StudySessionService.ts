import { StudySessionRepository } from '../repositories/StudySessionRepository';
import { prisma } from '../database/prisma';

export const StudySessionService = {
  create: (data: any) => StudySessionRepository.create(data),
  update: (id: string, data: any) => StudySessionRepository.update(id, data),
  getAnswers: (id: string) => StudySessionRepository.getAnswers(id),
  submitAnswer: async (data: any) => {
    // We can put some logic here (e.g. updating mastery if necessary)
    // For now just create the answer
    return StudySessionRepository.createAnswer(data);
  }
};
