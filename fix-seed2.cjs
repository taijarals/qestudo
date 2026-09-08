const fs = require('fs');
let code = fs.readFileSync('prisma/seed.ts', 'utf-8');

code = code.replace(/text: q.text \|\| "",/g, 'statement: q.statement || "",\n        explanation: q.explanation,\n        cognitiveObjective: q.cognitiveObjective,\n        trapType: q.trapType,\n        confidenceScore: q.confidenceScore,\n        validationStatus: q.validationStatus || "validated",');
code = code.replace(/year: q.year \|\| 2023,/g, '');
code = code.replace(/conceptualDifficulty: 'Medium', \/\/ fallback/g, '');

fs.writeFileSync('prisma/seed.ts', code);
