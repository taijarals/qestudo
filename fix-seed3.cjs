const fs = require('fs');
let code = fs.readFileSync('prisma/seed.ts', 'utf-8');

code = code.replace(/text: sr.text/g, 'materialId: sr.materialId, page: sr.page || 0, excerpt: sr.excerpt || "", chunkId: sr.chunkId');
code = code.replace(/masteryLevel: m.masteryLevel,\n\s*questionsAnswered: m.questionsAnswered,\n\s*correctAnswers: m.correctAnswers,\n\s*lastReview: m.lastReview/g, 'masteryScore: m.masteryScore || 0, status: m.status, correctAnswers: m.correctAnswers, wrongAnswers: m.wrongAnswers');

fs.writeFileSync('prisma/seed.ts', code);
