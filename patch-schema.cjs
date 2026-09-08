const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const newModels = `
model QuestionPlan {
  id                    String   @id @default(uuid())
  materialId            String
  conceptId             String
  board                 String
  questionType          String
  difficulty            String
  cognitiveObjective    String
  targetCorrectPosition Int?
  targetTrueFalse       Boolean?
  trapStrategy          String?
  confusedConceptId     String?
  sourceChunkIds        String[]
  status                String   @default("planned")
  createdAt             DateTime @default(now())

  material              Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  concept               Concept  @relation("ConceptQuestionPlans", fields: [conceptId], references: [id], onDelete: Cascade)
  confusedConcept       Concept? @relation("ConfusedConceptPlans", fields: [confusedConceptId], references: [id], onDelete: SetNull)

  @@schema("qestudo")
}
`;

schema = schema.replace(
  /model Material \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
"  questionPlans QuestionPlan[]\n  @@schema(\"qestudo\")");
  }
);

schema = schema.replace(
  /model Concept \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
"  questionPlans         QuestionPlan[] @relation(\"ConceptQuestionPlans\")\n  confusedQuestionPlans QuestionPlan[] @relation(\"ConfusedConceptPlans\")\n  @@schema(\"qestudo\")");
  }
);

schema = schema + '\n' + newModels;

fs.writeFileSync('prisma/schema.prisma', schema);
