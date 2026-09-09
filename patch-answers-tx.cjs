const fs = require('fs');
let code = fs.readFileSync('server/controllers/answers.ts', 'utf-8');

const oldPersist = `      // Persist answer
      await prisma.answer.create({
        data: {
          sessionId,
          questionId,
          selectedOptionId: responseType === 'dont_know' ? null : selectedOptionId,
          responseType,
          isCorrect,
          timeSpent: req.body.timeSpent || 0
        }
      });`;

const newPersist = `      // Persist answer and update session atomically
      const now = new Date();
      await prisma.$transaction(async (tx) => {
        await tx.answer.create({
          data: {
            sessionId,
            questionId,
            selectedOptionId: responseType === 'dont_know' ? null : selectedOptionId,
            responseType,
            isCorrect,
            timeSpent: req.body.timeSpent || 0
          }
        });

        // Increment currentQuestionIndex
        const updatedSession = await tx.studySession.update({
          where: { id: sessionId },
          data: {
            currentQuestionIndex: { increment: 1 }
          }
        });

        // If threshold reached, auto-finish the session
        if (updatedSession.currentQuestionIndex >= updatedSession.quantity && updatedSession.status !== 'finished') {
           await tx.studySession.update({
             where: { id: sessionId },
             data: {
               status: 'finished',
               finishedAt: now
             }
           });
        }
      });`;

code = code.replace(oldPersist, newPersist);
fs.writeFileSync('server/controllers/answers.ts', code);
