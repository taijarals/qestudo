const fs = require('fs');
const files = [
  'server/services/QuestionGeneratorService.ts',
  'server/services/QuestionValidatorService.ts',
  'server/services/ConceptMappingService.ts'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(
    /constructor\(\) \{\s*if \(\!process\.env\.GEMINI_API_KEY\) \{\s*throw new Error\('GEMINI_API_KEY não configurada no servidor\.'\);\s*\}\s*\}/g,
    ''
  );
  fs.writeFileSync(file, code);
}
