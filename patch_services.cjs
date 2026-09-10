const fs = require('fs');

function patchConceptMapping() {
  let code = fs.readFileSync('server/services/ConceptMappingService.ts', 'utf-8');
  code = code.replace("import { GoogleGenAI, Type, Schema } from '@google/genai';", "import { Type, Schema } from '@google/genai';\nimport { geminiClient } from './ai/GeminiClient';");
  code = code.replace("private ai: GoogleGenAI;\n", "");
  code = code.replace("this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\n", "");
  
  // Find ai.models.generateContent calls
  code = code.replace(/await this\.ai\.models\.generateContent\(\{([\s\S]*?)\}\);/g, "await geminiClient.generateContent({ operation: 'concept_mapping', $1, materialId });");
  fs.writeFileSync('server/services/ConceptMappingService.ts', code);
}

function patchQuestionGenerator() {
  let code = fs.readFileSync('server/services/QuestionGeneratorService.ts', 'utf-8');
  code = code.replace("import { GoogleGenAI, Type, Schema } from '@google/genai';", "import { Type, Schema } from '@google/genai';\nimport { geminiClient } from './ai/GeminiClient';");
  code = code.replace("private ai: GoogleGenAI;\n", "");
  code = code.replace("this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\n", "");
  
  // Here we need to inject materialId, batchId. Wait, QuestionGeneratorService might not have materialId in scope, let's check its parameters.
  // The generateQuestion method receives (plan: QuestionPlan, batchId?: string). So materialId = plan.materialId.
  code = code.replace(/await this\.ai\.models\.generateContent\(\{([\s\S]*?)\}\);/g, "await geminiClient.generateContent({ operation: 'question_generation', $1, materialId: plan.materialId, batchId });");
  fs.writeFileSync('server/services/QuestionGeneratorService.ts', code);
}

function patchQuestionValidator() {
  let code = fs.readFileSync('server/services/QuestionValidatorService.ts', 'utf-8');
  code = code.replace("import { GoogleGenAI, Type, Schema } from '@google/genai';", "import { Type, Schema } from '@google/genai';\nimport { geminiClient } from './ai/GeminiClient';");
  code = code.replace("private ai: GoogleGenAI;\n", "");
  code = code.replace("this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });\n", "");
  
  // Here validateQuestion(questionId: string) fetches question. 
  // We can just add operation: 'question_validation', materialId: question.materialId, questionId: question.id, batchId: question.questionPlan?.batchId
  code = code.replace(/await this\.ai\.models\.generateContent\(\{([\s\S]*?)\}\);/g, "await geminiClient.generateContent({ operation: 'question_validation', $1, materialId: question.materialId, questionId: question.id, batchId: question.questionPlan?.batchId ?? undefined });");
  fs.writeFileSync('server/services/QuestionValidatorService.ts', code);
}

patchConceptMapping();
patchQuestionGenerator();
patchQuestionValidator();
