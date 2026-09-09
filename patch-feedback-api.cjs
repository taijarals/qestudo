const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

const importStatement = `import { comprehensionFeedbackController } from '../controllers/comprehensionFeedback';`;

if (!code.includes('comprehensionFeedbackController')) {
  code = code.replace("import { answersController } from '../controllers/answers';", 
  `import { answersController } from '../controllers/answers';\n${importStatement}`);
}

const newRoute = `
apiRouter.post('/answers/:answerId/comprehension', comprehensionFeedbackController.submit);
`;

if (!code.includes("apiRouter.post('/answers/:answerId/comprehension'")) {
  code = code.replace(
    "apiRouter.post('/answers', answersController.submit);",
    `apiRouter.post('/answers', answersController.submit);${newRoute}`
  );
}

fs.writeFileSync('server/routes/api.ts', code);

// Also patch answer controller to include answerId in the resultDto
let answersCode = fs.readFileSync('server/controllers/answers.ts', 'utf-8');

if (!answersCode.includes('answerId: newAnswer.id,')) {
  answersCode = answersCode.replace(
    /const updatedSession = await tx\.studySession\.update/g,
    `const newAnswer = await tx.answer.findUnique({ where: { sessionId_questionId: { sessionId, questionId } } });\n        const updatedSession = await tx.studySession.update`
  );
  
  answersCode = answersCode.replace(
    /const resultDto = {/g,
    `const resultDto = {
        answerId: newAnswer?.id,`
  );
}

fs.writeFileSync('server/controllers/answers.ts', answersCode);

