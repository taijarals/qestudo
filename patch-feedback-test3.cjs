const fs = require('fs');
let code = fs.readFileSync('server/tests/ComprehensionFeedback.test.ts', 'utf-8');

code = code.replace(
  "const answer2 = await prisma.answer.create({",
  `const question2 = await prisma.question.create({
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
    const answer2 = await prisma.answer.create({`
);

code = code.replace(
  "data: { sessionId, questionId, isCorrect: false, responseType: 'answered' }",
  "data: { sessionId, questionId: question2.id, isCorrect: false, responseType: 'answered' }"
);

fs.writeFileSync('server/tests/ComprehensionFeedback.test.ts', code);
