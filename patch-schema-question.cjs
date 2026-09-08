const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(
  /model Question \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
`  questionPlanId          String?   @unique
  questionPlan            QuestionPlan? @relation(fields: [questionPlanId], references: [id])
  generationPromptVersion String?
  generationModel         String?
  generatedAt             DateTime? @default(now())
  @@schema("qestudo")`);
  }
);

schema = schema.replace(
  /model QuestionOption \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
`  position          Int       @default(0)
  errorType         String?
  confusedConceptId String?
  explanation       String?
  @@schema("qestudo")`);
  }
);

schema = schema.replace(
  /model QuestionPlan \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
`  question              Question?
  @@schema("qestudo")`);
  }
);

fs.writeFileSync('prisma/schema.prisma', schema);
