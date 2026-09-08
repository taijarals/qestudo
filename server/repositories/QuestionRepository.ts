import { prisma } from '../database/prisma';

export const QuestionRepository = {
  findById: (id: string) => prisma.question.findUnique({ 
    where: { id },
    include: { options: true, sourceReferences: true }
  })
};
