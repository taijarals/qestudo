const fs = require('fs');
let code = fs.readFileSync('server/controllers/aiUsage.ts', 'utf-8');

code = code.replace(
  /operations: {[\s\S]*?},/,
  `operations: {
          concept_mapping: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_generation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_validation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_batch_generation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_batch_validation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null },
          question_escalation_validation: { calls: 0, successfulCalls: 0, failedCalls: 0, totalTokens: null as number | null }
        },`
);

code = code.replace(
  /summary.tokensPerValidatedQuestion = 0/g,
  "summary.tokensPerValidatedQuestion = 0;\n      (summary as any).aiCallsPerValidatedQuestion = 0;"
);

code = code.replace(
  /if \(summary.validatedQuestions > 0 && summary.totalTokens !== null\) {/,
  `if (summary.validatedQuestions > 0) {
        if (summary.totalTokens !== null) summary.tokensPerValidatedQuestion = Math.round(summary.totalTokens / summary.validatedQuestions);
        (summary as any).aiCallsPerValidatedQuestion = +(summary.calls / summary.validatedQuestions).toFixed(2);
      }`
);

// We also need to fix `validationStatus` count, because now it uses 'approved' inside batch logic.
// wait, existing QuestionBatchGenerationService checked for 'validated' status. 
// Ah, earlier QuestionBatchGenerationService used `validated`. I changed it to `approved` in my update.
// Actually, `approved` is the status I set. Let's make sure `validated` is supported for backwards compatibility or fix it to `approved`.
// QEstudo typically uses 'validated' or 'approved'? Let's check `Question` model.
fs.writeFileSync('server/controllers/aiUsage.ts', code);
