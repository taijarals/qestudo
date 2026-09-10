const fs = require('fs');

// Fix QuestionBatchValidatorService
let code = fs.readFileSync('server/services/QuestionBatchValidatorService.ts', 'utf-8');

code = code.replace(
  /sourceReferences: \{ include: \{ chunk: true \} \}/g,
  "sourceReferences: true"
);

code = code.replace(
  /qualityScore: 0,/g,
  "confidenceScore: 0,\n            isAnswerCorrect: false,\n            isSupportedBySource: false,\n            hasSecondDefensibleAnswer: false,\n            isAmbiguous: true,\n            isExplanationCorrect: false,\n            isDifficultyAppropriate: false,\n            respectsBoardStyle: false,\n            respectsQuestionPlan: false,\n            distractorsPlausible: false,\n            usesExternalKnowledge: false,"
);

code = code.replace(
  /validationModel: 'local',/g,
  "validatorPromptVersion: 'DETERMINISTIC',\n            validatorModel: 'SYSTEM',"
);

code = code.replace(/materialId: q\.materialId,/g, '');

code = code.replace(
  /qualityScore: { type: Type.NUMBER }/g,
  `qualityScore: { type: Type.NUMBER },
              isSupportedBySource: { type: Type.BOOLEAN },
              hasSecondDefensibleAnswer: { type: Type.BOOLEAN },
              isAmbiguous: { type: Type.BOOLEAN },
              isExplanationCorrect: { type: Type.BOOLEAN },
              isDifficultyAppropriate: { type: Type.BOOLEAN },
              respectsBoardStyle: { type: Type.BOOLEAN },
              respectsQuestionPlan: { type: Type.BOOLEAN },
              distractorsPlausible: { type: Type.BOOLEAN },
              usesExternalKnowledge: { type: Type.BOOLEAN }`
);

code = code.replace(
  /required: \['questionId', 'isAnswerCorrect', 'qualityScore', 'feedback'\]/g,
  "required: ['questionId', 'isAnswerCorrect', 'qualityScore', 'isSupportedBySource', 'hasSecondDefensibleAnswer', 'isAmbiguous', 'isExplanationCorrect', 'isDifficultyAppropriate', 'respectsBoardStyle', 'respectsQuestionPlan', 'distractorsPlausible', 'usesExternalKnowledge', 'feedback']"
);

code = code.replace(
  /validationModel: model,\n\s*qualityScore: finalScore,\n\s*isAnswerCorrect: vData\.isAnswerCorrect,/g,
  `validatorModel: model,
          confidenceScore: finalScore,
          isAnswerCorrect: vData.isAnswerCorrect,
          isSupportedBySource: vData.isSupportedBySource,
          hasSecondDefensibleAnswer: vData.hasSecondDefensibleAnswer,
          isAmbiguous: vData.isAmbiguous,
          isExplanationCorrect: vData.isExplanationCorrect,
          isDifficultyAppropriate: vData.isDifficultyAppropriate,
          respectsBoardStyle: vData.respectsBoardStyle,
          respectsQuestionPlan: vData.respectsQuestionPlan,
          distractorsPlausible: vData.distractorsPlausible,
          usesExternalKnowledge: vData.usesExternalKnowledge,`
);

fs.writeFileSync('server/services/QuestionBatchValidatorService.ts', code);

// Fix GeminiClient.ts
let gClient = fs.readFileSync('server/services/ai/GeminiClient.ts', 'utf-8');
gClient = gClient.replace(
  /operation: 'concept_mapping' \| 'question_generation' \| 'question_validation';/,
  "operation: 'concept_mapping' | 'question_generation' | 'question_validation' | 'question_batch_generation' | 'question_batch_validation' | 'question_escalation_validation';"
);
fs.writeFileSync('server/services/ai/GeminiClient.ts', gClient);

