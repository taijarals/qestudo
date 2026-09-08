import { prisma } from '../database/prisma';

export const StudySessionRepository = {
  create: (data: any) => prisma.studySession.create({ data }),
  update: (id: string, data: any) => prisma.studySession.update({ where: { id }, data }),
  getAnswers: (id: string) => prisma.answer.findMany({ where: { sessionId: id } }),
  createAnswer: (data: any) => prisma.answer.create({ data })
};
