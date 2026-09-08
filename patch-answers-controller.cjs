const fs = require('fs');
let code = fs.readFileSync('server/controllers/answers.ts', 'utf-8');

const importStatement = `import { ConceptMasteryService } from '../services/ConceptMasteryService';\nconst masteryService = new ConceptMasteryService();`;

if (!code.includes('ConceptMasteryService')) {
  code = code.replace("import { prisma } from '../database/prisma';", 
  `import { prisma } from '../database/prisma';\n${importStatement}`);
}

const updateCall = `
      // Update Concept Mastery
      await masteryService.updateMastery({
        conceptId: question.conceptId,
        isCorrect,
        responseType,
        difficulty: question.difficulty,
        timeSpent: req.body.timeSpent || 0,
        confusedConceptId
      });
`;

if (!code.includes("masteryService.updateMastery")) {
  code = code.replace(
    "// Prepare feedback DTO",
    `${updateCall}\n      // Prepare feedback DTO`
  );
}

fs.writeFileSync('server/controllers/answers.ts', code);
