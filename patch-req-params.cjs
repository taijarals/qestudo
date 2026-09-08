const fs = require('fs');
let code = fs.readFileSync('server/controllers/questionPlans.ts', 'utf-8');

code = code.replace(
  "where: { id: req.params.id },",
  "where: { id: req.params.id as string },"
);

code = code.replace(
  "where: { conceptId: req.params.id },",
  "where: { conceptId: req.params.id as string },"
);

fs.writeFileSync('server/controllers/questionPlans.ts', code);
