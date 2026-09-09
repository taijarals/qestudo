const fs = require('fs');
let code = fs.readFileSync('src/domain/Question.ts', 'utf-8');
code = code.replace("validationStatus: ValidationStatus;", "validationStatus: ValidationStatus;\n  coverageType?: string;");
fs.writeFileSync('src/domain/Question.ts', code);
