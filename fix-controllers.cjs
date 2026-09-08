const fs = require('fs');

const files = [
  'server/controllers/materials.ts',
  'server/controllers/concepts.ts',
  'server/controllers/questions.ts',
  'server/controllers/studySessions.ts'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/req\.params\.id/g, 'req.params.id as string');
  fs.writeFileSync(file, code);
}
