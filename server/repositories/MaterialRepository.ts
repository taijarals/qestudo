import { prisma } from '../database/prisma';

export const MaterialRepository = {
  findAll: () => prisma.material.findMany(),
  findById: (id: string) => prisma.material.findUnique({ where: { id } }),
  findConcepts: (id: string) => prisma.concept.findMany({ where: { materialId: id } }),
  findQuestions: (id: string) => prisma.question.findMany({ 
    where: { materialId: id, validationStatus: 'validated' },
    include: { options: true, sourceReferences: true }
  }),
  create: (data: any) => prisma.material.create({ data }),
  delete: (id: string) => prisma.material.delete({ where: { id } })
};
