const fs = require('fs');

let code = fs.readFileSync('server/services/QuestionBatchValidatorService.ts', 'utf-8');

// Deterministic
code = code.replace(/usesExternalKnowledge: false,\n\s*reasoningSummary: 'Falha na validação estrutural\/determinística\.',/g, "usesExternalKnowledge: false,\n            sourceCoverageScore: 0,\n            clarityScore: 0,\n            qualityScore: 0,\n            reasoningSummary: 'Falha na validação estrutural/determinística.',");

// LLM
code = code.replace(/usesExternalKnowledge: vData\.usesExternalKnowledge,\n\s*reasoningSummary: vData\.feedback,/g, "usesExternalKnowledge: vData.usesExternalKnowledge,\n          sourceCoverageScore: 0,\n          clarityScore: 0,\n          qualityScore: vData.qualityScore,\n          reasoningSummary: vData.feedback,");

fs.writeFileSync('server/services/QuestionBatchValidatorService.ts', code);
