const fs = require('fs');

let code = fs.readFileSync('server/services/QuestionBatchValidatorService.ts', 'utf-8');

// remove duplicate
code = code.replace(/validatorPromptVersion: 'DETERMINISTIC',\n\s*validatorPromptVersion: 'DETERMINISTIC',/, "validatorPromptVersion: 'DETERMINISTIC',");

// replace feedback with reasoningSummary
code = code.replace(/feedback: 'Falha na validação estrutural\/determinística\.',/g, "reasoningSummary: 'Falha na validação estrutural/determinística.',");
code = code.replace(/feedback: vData\.feedback,/g, "reasoningSummary: vData.feedback,");
code = code.replace(/improvementSuggestion: vData\.improvementSuggestion,/g, "");
code = code.replace(/validatedAt: new Date\(\)/g, "");

fs.writeFileSync('server/services/QuestionBatchValidatorService.ts', code);
