const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(
  /model ConceptMastery \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
`model ConceptMastery {
  id                        String    @id @default(uuid())
  conceptId                 String    @unique
  masteryScore              Float     @default(0.0)
  status                    String    @default("not_seen") // not_seen, learning, consolidating, mastered, review_needed
  correctAnswers            Int       @default(0)
  wrongAnswers              Int       @default(0)
  dontKnowAnswers           Int       @default(0)
  totalAnswers              Int       @default(0)
  consecutiveCorrect        Int       @default(0)
  consecutiveWrong          Int       @default(0)
  lastAnsweredAt            DateTime?
  lastCorrectAt             DateTime?
  lastWrongAt               DateTime?
  nextReviewAt              DateTime?
  currentReviewIntervalDays Int       @default(0)
  updatedAt                 DateTime  @default(now()) @updatedAt

  concept                   Concept   @relation(fields: [conceptId], references: [id], onDelete: Cascade)

  @@schema("qestudo")
}`
);

fs.writeFileSync('prisma/schema.prisma', schema);
