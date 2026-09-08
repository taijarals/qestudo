import { prisma } from '../database/prisma';
import { Router } from 'express';
import multer from 'multer';
import { questionController } from '../controllers/questions';
import { QuestionValidatorService } from '../services/QuestionValidatorService';
const validatorService = new QuestionValidatorService();
import { questionPlanController } from '../controllers/questionPlans';
import { materialController } from '../controllers/materials';
import { studySessionController } from '../controllers/studySessions';
import { conceptController } from '../controllers/concepts';

export const apiRouter = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Materials
apiRouter.post('/materials/upload', upload.single('file'), materialController.upload);
apiRouter.get('/materials', materialController.getAll);
apiRouter.get('/materials/:id', materialController.getById);
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

apiRouter.post('/questions/:id/validate', async (req, res) => {
  try {
    const result = await validatorService.validateQuestion(req.params.id);
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
apiRouter.post('/answers', studySessionController.submitAnswer);
