const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Add fields to Question
code = code.replace(
  "validationStatus   String                    @default(\"draft\")",
  "validationStatus   String                    @default(\"draft\")\n  coverageType       String?"
);

// Add fields to QuestionPlan
code = code.replace(
  "confusedConceptId     String?",
  "confusedConceptId     String?\n  coverageType          String?\n  batchId               String?"
);

// Add QuestionBatch model
code += `

model QuestionBatch {
  id                String   @id @default(uuid())
  materialId        String
  scopeType         String   // topic, subtopic, concept
  scopeId           String
  board             String
  questionType      String
  requestedQuantity Int
  generatedCount    Int      @default(0)
  validatedCount    Int      @default(0)
  rejectedCount     Int      @default(0)
  duplicateCount    Int      @default(0)
  status            String   @default("pending") // pending, processing, completed, partial, failed
  createdAt         DateTime @default(now())
  completedAt       DateTime?
  @@schema("qestudo")
}
`;

fs.writeFileSync('prisma/schema.prisma', code);
