import { Router } from 'express';
import multer from 'multer';
import { materialController } from '../controllers/materials';
import { questionController } from '../controllers/questions';
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
apiRouter.get('/materials/:id/questions', materialController.getQuestions);

// Questions
apiRouter.get('/questions/:id', questionController.getById);

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
