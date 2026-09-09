const fs = require('fs');

// Fix 1: comprehensionFeedback.ts string types
let compCode = fs.readFileSync('server/controllers/comprehensionFeedback.ts', 'utf-8');
compCode = compCode.replace(
  "answerId,",
  "answerId: answerId as string,"
);
fs.writeFileSync('server/controllers/comprehensionFeedback.ts', compCode);

// Fix 2: answers.ts newAnswer out of scope
let answersCode = fs.readFileSync('server/controllers/answers.ts', 'utf-8');
answersCode = answersCode.replace(
  /const newAnswer = await tx\.answer\.findUnique/g,
  `let localAnswerId = '';\n        const newAnswer = await tx.answer.findUnique`
);
answersCode = answersCode.replace(
  /const updatedSession = await tx\.studySession\.update/g,
  `if (newAnswer) localAnswerId = newAnswer.id;\n        const updatedSession = await tx.studySession.update`
);
answersCode = answersCode.replace(
  /answerId: newAnswer\?\.id,/g,
  `answerId: localAnswerId || null,`
);

// We need to declare localAnswerId outside the transaction
answersCode = answersCode.replace(
  "const now = new Date();",
  "const now = new Date();\n      let finalAnswerId = '';"
);
answersCode = answersCode.replace(
  /if \(newAnswer\) localAnswerId = newAnswer\.id;/g,
  `if (newAnswer) finalAnswerId = newAnswer.id;`
);
answersCode = answersCode.replace(
  /answerId: localAnswerId \|\| null,/g,
  `answerId: finalAnswerId || null,`
);
fs.writeFileSync('server/controllers/answers.ts', answersCode);

