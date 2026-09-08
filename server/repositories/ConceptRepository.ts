import { prisma } from '../database/prisma';

export const ConceptRepository = {
  findQuestions: (id: string) => prisma.question.findMany({ 
    where: { conceptId: id },
    include: { options: true, sourceReferences: true }
  }),
  getMastery: (id: string) => prisma.conceptMastery.findUnique({ where: { conceptId: id } }),
  updateMastery: (id: string, data: any) => prisma.conceptMastery.upsert({
    where: { conceptId: id },
    update: data,
    create: { ...data, conceptId: id }
  })
};
