const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Add ComprehensionFeedback model
const comprehensionFeedbackModel = `
model ComprehensionFeedback {
  id        String   @id @default(uuid())
  answerId  String   @unique
  conceptId String?
  feedback  String   // 'understood', 'partial', 'not_understood'
  createdAt DateTime @default(now())

  answer  Answer   @relation(fields: [answerId], references: [id], onDelete: Cascade)
  concept Concept? @relation(fields: [conceptId], references: [id], onDelete: Cascade)

  @@schema("qestudo")
}
`;

if (!schema.includes("model ComprehensionFeedback")) {
  schema = schema + comprehensionFeedbackModel;
}

// Add feedback relations to Concept and Answer
if (!schema.includes("comprehensionFeedbacks ComprehensionFeedback[]")) {
  schema = schema.replace(
    /model Concept \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
    (match) => {
      return match.replace(/@@schema\("qestudo"\)/, 
"  comprehensionFeedbacks ComprehensionFeedback[]\n  @@schema(\"qestudo\")");
    }
  );
}

if (!schema.includes("comprehension ComprehensionFeedback?")) {
  schema = schema.replace(
    /model Answer \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
    (match) => {
      return match.replace(/@@schema\("qestudo"\)/, 
"  comprehension  ComprehensionFeedback?\n  @@schema(\"qestudo\")");
    }
  );
}

// Add feedback fields to ConceptMastery
if (!schema.includes("understoodCount")) {
  schema = schema.replace(
    /model ConceptMastery \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
    (match) => {
      return match.replace(/updatedAt                 DateTime  @default\(now\(\)\) @updatedAt/, 
`updatedAt                 DateTime  @default(now()) @updatedAt
  understoodCount           Int       @default(0)
  partialUnderstandingCount Int       @default(0)
  notUnderstoodCount        Int       @default(0)
  lastComprehensionFeedback String?
  lastComprehensionAt       DateTime?`);
    }
  );
}

fs.writeFileSync('prisma/schema.prisma', schema);
