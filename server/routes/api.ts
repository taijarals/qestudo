import { aiUsageController } from '../controllers/aiUsage';

import { QuestionBatchGenerationService } from '../services/QuestionBatchGenerationService';
import { QuestionCoverageService } from '../services/QuestionCoverageService';
import { prisma } from '../database/prisma';
import { Router } from 'express';
import multer from 'multer';
import { questionController } from '../controllers/questions';
import { StudyNextQuestionService } from '../services/StudyNextQuestionService';

import { questionProviderController } from '../controllers/questionProvider';
import { answersController } from '../controllers/answers';
import { comprehensionFeedbackController } from '../controllers/comprehensionFeedback';
import { QuestionValidatorService } from '../services/QuestionValidatorService';

import { questionPlanController } from '../controllers/questionPlans';
import { materialController } from '../controllers/materials';
import { studySessionController } from '../controllers/studySessions';
import { conceptController } from '../controllers/concepts';

export const apiRouter = Router();

// AI Usage routes
apiRouter.get('/ai-usage/summary', aiUsageController.getSummary);
apiRouter.get('/ai-usage/history', aiUsageController.getHistory);
apiRouter.get('/question-batches/:batchId/stats', aiUsageController.getBatchStats);


apiRouter.post('/question-batches', async (req, res) => {
  try {
    
    const params = req.body;
    
    // Validar se o escopo possui conceitos disponíveis
    let conceptCount = 0;
    if (params.scopeType === 'material') {
      conceptCount = await prisma.concept.count({
        where: { materialId: params.materialId, level: 'concept' }
      });
    } else if (params.scopeType === 'concept') {
       conceptCount = await prisma.concept.count({
         where: { id: params.scopeId, materialId: params.materialId, level: 'concept' }
       });
    } else if (['discipline', 'topic', 'subtopic'].includes(params.scopeType)) {
       // Check if there are any leaf concepts down the tree? Or at least the node exists
       const node = await prisma.concept.findUnique({ where: { id: params.scopeId } });
       if (node && node.materialId === params.materialId) {
          // We assume there are concepts if the node exists, or we could leave to the service to fail
          // But to be safe, we just check existence
          conceptCount = 1; 
       }
    }
    
    if (conceptCount === 0 && params.scopeType === 'material') {
      return res.status(400).json({
        error: "no_concepts_available",
        message: "Este material ainda não possui conceitos disponíveis para geração."
      });
    }

    const service = new QuestionBatchGenerationService();
    const batch = await service.startBatch(req.body);
    res.json(batch);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

apiRouter.get('/question-batches/:id', async (req, res) => {
  try {
    
    const batch = await prisma.questionBatch.findUnique({ where: { id: req.params.id } });
    if (!batch) return res.status(404).json({error: 'Not found'});
    res.json(batch);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});


const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Materials
apiRouter.post('/materials/upload', upload.single('file'), materialController.upload);
apiRouter.get('/materials', materialController.getAll);
apiRouter.get('/materials/:id', materialController.getById);
apiRouter.delete('/materials/:id', materialController.delete);
apiRouter.post('/materials/:id/process', materialController.process);
apiRouter.post('/materials/:id/map-concepts', materialController.mapConcepts);
apiRouter.get('/materials/:id/processing-status', materialController.getProcessingStatus);
apiRouter.get('/materials/:id/pages', materialController.getPages);
apiRouter.get('/materials/:id/chunks', materialController.getChunks);
apiRouter.get('/materials/:id/concepts', materialController.getConcepts);

apiRouter.post('/question-plans', questionPlanController.create);
apiRouter.get('/question-plans/:id', questionPlanController.getById);
apiRouter.get('/concepts/:id/question-plans', questionPlanController.getByConcept);

apiRouter.post('/question-plans/:planId/generate', questionController.generate);
apiRouter.get('/questions/:id', questionController.getById);


apiRouter.post('/questions/provide', questionProviderController.provide);
apiRouter.post('/answers', answersController.submit);
apiRouter.post('/answers/:answerId/comprehension', comprehensionFeedbackController.submit);


apiRouter.post('/study-sessions/:id/next-question', async (req, res) => {
  try {
    const result = await new StudyNextQuestionService().getNextQuestion(req.params.id);
    res.json(result);
  } catch(e: any) {
    if (e.message === 'insufficient_question_bank' || e.message === 'question_generation_failed') {
      return res.status(503).json({ error: e.message === 'insufficient_question_bank' ? 'Banco de questões insuficiente para este escopo. Gere mais questões antes de continuar.' : 'Failed to generate a valid question' });
    }
    if (e.message === 'Session is already complete' || e.message === 'Session is not active') {
      return res.status(400).json({ error: e.message });
    }
    console.error(e);
    res.status(500).json({error: e.message});
  }
});


apiRouter.post('/questions/:id/validate', async (req, res) => {
  try {
    const result = await new QuestionValidatorService().validateQuestion(req.params.id);
    res.json(result);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});

apiRouter.get('/questions/:id/validation', async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id as string },
      include: {
        validations: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });
    if (!question) return res.status(404).json({error: 'not found'});
    res.json(question.validations[0] || null);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});



apiRouter.get('/materials/:id/questions', materialController.getQuestions);

apiRouter.get('/materials/:id/coverage-tree', async (req, res) => {
  try {
    const service = new QuestionCoverageService();
    const coverage = await service.getCoverageTree(req.params.id);
    res.json(coverage);
  } catch(e: any) {
    res.status(500).json({error: e.message});
  }
});


// Questions

// Concepts
apiRouter.get('/concepts/:id/questions', conceptController.getQuestions);
apiRouter.get('/concepts/:id/mastery', conceptController.getMastery);
apiRouter.put('/concepts/:id/mastery', conceptController.updateMastery);

// Study Sessions
apiRouter.post('/study-sessions', studySessionController.create);
apiRouter.patch('/study-sessions/:id', studySessionController.update);
apiRouter.get('/study-sessions/:id/answers', studySessionController.getAnswers);

// Answers

