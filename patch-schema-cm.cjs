const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(
  /model ConceptMastery \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  `model ConceptMastery {
  id                String    @id @default(uuid())
  conceptId         String    @unique
  masteryScore      Float
  status            String
  correctAnswers    Int       @default(0)
  wrongAnswers      Int       @default(0)
  concept Concept @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  @@schema("qestudo")
}`
);

fs.writeFileSync('prisma/schema.prisma', schema);
