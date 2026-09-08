const fs = require('fs');

let conceptRepo = fs.readFileSync('server/repositories/ConceptRepository.ts', 'utf-8');
conceptRepo = conceptRepo.replace(
  "where: { conceptId: id },",
  "where: { conceptId: id, validationStatus: 'validated' },"
);
fs.writeFileSync('server/repositories/ConceptRepository.ts', conceptRepo);

let materialRepo = fs.readFileSync('server/repositories/MaterialRepository.ts', 'utf-8');
materialRepo = materialRepo.replace(
  "where: { materialId: id },",
  "where: { materialId: id, validationStatus: 'validated' },"
);
fs.writeFileSync('server/repositories/MaterialRepository.ts', materialRepo);

