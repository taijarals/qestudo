const fs = require('fs');
let code = fs.readFileSync('prisma/seed.ts', 'utf-8');

code = code.replace(/description: m.description,\n\s*progress: m.progress,/, "description: '',\n        progress: m.studyCoverage || 0,\n        fileName: m.fileName,\n        status: m.status,\n        processingProgress: m.processingProgress,");
code = code.replace(/text: q.text,/g, 'text: q.text || "",');
code = code.replace(/year: q.year,/g, 'year: q.year || 2023,');
code = code.replace(/id: sr.id,/g, '');
code = code.replace(/id: m.id,\n\s*conceptId/g, 'conceptId');

fs.writeFileSync('prisma/seed.ts', code);
