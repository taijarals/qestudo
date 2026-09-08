const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Change default validationStatus to draft
schema = schema.replace(
  'validationStatus   String                    @default("validated")',
  'validationStatus   String                    @default("draft")'
);

const newModels = `
model QuestionValidation {
  id                        String   @id @default(uuid())
  questionId                String
  validatorPromptVersion    String?
  validatorModel            String?
  confidenceScore           Float
  isAnswerCorrect           Boolean
  isSupportedBySource       Boolean
  hasSecondDefensibleAnswer Boolean
  isAmbiguous               Boolean
  isExplanationCorrect      Boolean
  isDifficultyAppropriate   Boolean
  respectsBoardStyle        Boolean
  respectsQuestionPlan      Boolean
  distractorsPlausible      Boolean
  usesExternalKnowledge     Boolean
  sourceCoverageScore       Float
  clarityScore              Float
  qualityScore              Float
  issues                    Json?
  reasoningSummary          String?
  createdAt                 DateTime @default(now())

  question                  Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@schema("qestudo")
}
`;

schema = schema.replace(
  /model Question \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    if (!match.includes("validations")) {
        return match.replace(/@@schema\("qestudo"\)/, 
"  validations             QuestionValidation[]\n  @@schema(\"qestudo\")");
    }
    return match;
  }
);

if (!schema.includes("model QuestionValidation")) {
  schema = schema + '\n' + newModels;
}

fs.writeFileSync('prisma/schema.prisma', schema);
