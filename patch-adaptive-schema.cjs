const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const oldMastery = `model ConceptMastery {
  id             String  @id @default(uuid())
  conceptId      String  @unique
  masteryScore   Float
  status         String
  correctAnswers Int     @default(0)
  wrongAnswers   Int     @default(0)

  concept        Concept @relation(fields: [conceptId], references: [id], onDelete: Cascade)

  @@schema("qestudo")
}`;

const newMastery = `model ConceptMastery {
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
}`;

if (schema.includes("wrongAnswers   Int     @default(0)")) {
    schema = schema.replace(oldMastery, newMastery);
}

const confusionStat = `
model ConceptConfusionStat {
  id                    String   @id @default(uuid())
  conceptId             String
  confusedWithConceptId String
  count                 Int      @default(0)
  lastOccurredAt        DateTime @default(now())

  concept               Concept  @relation("ConceptConfusions", fields: [conceptId], references: [id], onDelete: Cascade)
  confusedWith          Concept  @relation("ConfusedWith", fields: [confusedWithConceptId], references: [id], onDelete: Cascade)

  @@unique([conceptId, confusedWithConceptId])
  @@schema("qestudo")
}
`;

if (!schema.includes("model ConceptConfusionStat")) {
    schema = schema + confusionStat;
}

// Ensure Concept has relations for confusions
if (!schema.includes('confusionsAsSource')) {
    schema = schema.replace(
      /model Concept \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
      (match) => {
        return match.replace(/@@schema\("qestudo"\)/, 
  "  confusionsAsSource    ConceptConfusionStat[] @relation(\"ConceptConfusions\")\n  confusionsAsTarget    ConceptConfusionStat[] @relation(\"ConfusedWith\")\n  @@schema(\"qestudo\")");
      }
    );
}

fs.writeFileSync('prisma/schema.prisma', schema);
