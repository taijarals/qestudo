import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../database/prisma';
import { ComprehensionFeedbackService } from '../services/ComprehensionFeedbackService';
import { randomUUID } from 'crypto';

// Mocking prisma is complex if not set up, let's just write an integration test
// that runs against the real DB, since the app provides a test runner pattern.

const service = new ComprehensionFeedbackService();

describe('ComprehensionFeedbackService Integration', () => {
  let materialId: string;
  let conceptId: string;
  let questionId: string;
  let sessionId: string;
  let answerId: string;

  beforeEach(async () => {
    // Setup test data
    const material = await prisma.material.create({
      data: { title: 'Test Material', description: 'desc' }
    });
    materialId = material.id;

    const concept = await prisma.concept.create({
      data: { materialId, name: 'Test Concept' }
    });
    conceptId = concept.id;

    const question = await prisma.question.create({
      data: {
        materialId,
        conceptId,
        statement: 'Test?',
        type: 'multipla-escolha',
        board: 'FCC',
        difficulty: 'media',
        validationStatus: 'validated',
        options: {
          create: [
            { text: 'A', isCorrect: true, position: 0 },
            { text: 'B', isCorrect: false, position: 1 }
          ]
        }
      }
    });
    questionId = question.id;

    const session = await prisma.studySession.create({
      data: {
        materialIds: [materialId],
        boards: ['FCC'],
        questionTypes: ['multipla-escolha'],
        mode: 'standard',
        quantity: 1,
        questionIds: [questionId],
        status: 'active'
      }
    });
    sessionId = session.id;

    const answer = await prisma.answer.create({
      data: {
        sessionId,
        questionId,
        isCorrect: false,
        responseType: 'answered'
      }
    });
    answerId = answer.id;
  });

  it('✅ PASS: understood aumenta levemente mastery', async () => {
    // initial mastery
    await prisma.conceptMastery.create({
      data: { conceptId, masteryScore: 0.5, status: 'learning' }
    });

    await service.registerFeedback({ answerId, feedback: 'understood' });

    const mastery = await prisma.conceptMastery.findUnique({ where: { conceptId } });
    expect(mastery?.masteryScore).toBe(0.53);
    expect(mastery?.understoodCount).toBe(1);
    expect(mastery?.lastComprehensionFeedback).toBe('understood');
  });

  it('✅ PASS: not_understood reduz mastery e antecipa revisao', async () => {
    await prisma.conceptMastery.create({
      data: { conceptId, masteryScore: 0.5, status: 'consolidating', currentReviewIntervalDays: 7 }
    });

    await service.registerFeedback({ answerId, feedback: 'not_understood' });

    const mastery = await prisma.conceptMastery.findUnique({ where: { conceptId } });
    expect(mastery?.masteryScore).toBe(0.42);
    expect(mastery?.status).toBe('learning');
    expect(mastery?.currentReviewIntervalDays).toBe(0);
    expect(mastery?.notUnderstoodCount).toBe(1);
    expect(mastery?.lastComprehensionFeedback).toBe('not_understood');
  });

  it('✅ PASS: partial válido -> persiste', async () => {
    await service.registerFeedback({ answerId, feedback: 'partial' });
    
    const mastery = await prisma.conceptMastery.findUnique({ where: { conceptId } });
    expect(mastery?.partialUnderstandingCount).toBe(1);
    expect(mastery?.lastComprehensionFeedback).toBe('partial');
  });

  it('✅ PASS: valor inválido -> rejeita', async () => {
    await expect(service.registerFeedback({ answerId, feedback: 'invalid' }))
      .rejects.toThrow('Invalid feedback value');
  });

  it('✅ PASS: feedback duplicado -> rejeita', async () => {
    await service.registerFeedback({ answerId, feedback: 'understood' });
    
    await expect(service.registerFeedback({ answerId, feedback: 'not_understood' }))
      .rejects.toThrow('Feedback already exists for this answer');
  });

  it('✅ PASS: Answer inexistente -> rejeita', async () => {
    await expect(service.registerFeedback({ answerId: randomUUID(), feedback: 'understood' }))
      .rejects.toThrow('Answer not found');
  });
  
  it('✅ PASS: score nunca passa de 1 ou fica abaixo de 0', async () => {
    await prisma.conceptMastery.create({
      data: { conceptId, masteryScore: 0.99, status: 'mastered' }
    });
    await service.registerFeedback({ answerId, feedback: 'understood' });
    let mastery = await prisma.conceptMastery.findUnique({ where: { conceptId } });
    expect(mastery?.masteryScore).toBe(1.0);

    const question2 = await prisma.question.create({
      data: {
        materialId,
        conceptId,
        statement: 'Test2?',
        type: 'multipla-escolha',
        board: 'FCC',
        difficulty: 'media',
        validationStatus: 'validated',
      }
    });
    const answer2 = await prisma.answer.create({
      data: { sessionId, questionId: question2.id, isCorrect: false, responseType: 'answered' }
    });
    
    await prisma.conceptMastery.update({
      where: { conceptId },
      data: { masteryScore: 0.05 }
    });

    await service.registerFeedback({ answerId: answer2.id, feedback: 'not_understood' });
    mastery = await prisma.conceptMastery.findUnique({ where: { conceptId } });
    expect(mastery?.masteryScore).toBe(0.0);
  });
});
