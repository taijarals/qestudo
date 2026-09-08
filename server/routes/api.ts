import { Router } from 'express';
import { materialController } from '../controllers/materials';
import { questionController } from '../controllers/questions';
import { studySessionController } from '../controllers/studySessions';
import { conceptController } from '../controllers/concepts';

export const apiRouter = Router();

// Materials
apiRouter.get('/materials', materialController.getAll);
apiRouter.get('/materials/:id', materialController.getById);
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
