import { prisma } from '../database/prisma';
import { storageService } from './storage';

export class MaterialDeletionService {
  async deleteMaterial(materialId: string) {
    const material = await prisma.material.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      throw new Error('not_found');
    }

    // Identificar StudySessions exclusivas deste material
    const sessions = await prisma.studySession.findMany({
      where: { materialIds: { has: materialId } }
    });
    
    const sessionsToDelete = sessions
      .filter(s => s.materialIds.length === 1 && s.materialIds[0] === materialId)
      .map(s => s.id);

    // Identificar Batches
    const batches = await prisma.questionBatch.findMany({
      where: { materialId }
    });
    
    const batchIds = batches.map(b => b.id);

    // Contagens estimadas (antes de deletar) para o resumo
    const questionsCount = await prisma.question.count({ where: { materialId } });
    const conceptsCount = await prisma.concept.count({ where: { materialId } });
    
    // Executar exclusões no banco usando transação, quando possível, ou sequencial
    await prisma.$transaction(async (tx) => {
      // 1. Apagar sessions exclusivas deste material
      if (sessionsToDelete.length > 0) {
        await tx.studySession.deleteMany({
          where: { id: { in: sessionsToDelete } }
        });
      }
      
      // 2. Apagar batches deste material
      if (batchIds.length > 0) {
        await tx.questionBatch.deleteMany({
          where: { materialId }
        });
      }
      
      // 3. Apagar Material (o cascade cuida de Concept, Question, QuestionPlan, MaterialPage, etc)
      await tx.material.delete({
        where: { id: materialId }
      });
    });

    // 4. Excluir arquivo do Storage
    let storageDeleted = false;
    try {
      if (material.storagePath) {
        await storageService.delete(material.storagePath);
        storageDeleted = true;
      }
    } catch (e: any) {
      console.warn(`[material_removed_storage_cleanup_failed] Failed to delete storage path ${material.storagePath} for material ${materialId}: ${e.message}`);
    }

    return {
      materialDeleted: true,
      questionsDeleted: questionsCount,
      conceptsDeleted: conceptsCount,
      batchesDeleted: batchIds.length,
      sessionsDeleted: sessionsToDelete.length,
      storageDeleted
    };
  }
}
