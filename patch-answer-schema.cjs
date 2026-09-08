const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Update QuestionOption to include answers relation
if (!schema.includes("answers Answer[]")) {
  schema = schema.replace(
    /model QuestionOption \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
    (match) => {
      return match.replace(/@@schema\("qestudo"\)/, 
"  answers           Answer[]\n  @@schema(\"qestudo\")");
    }
  );
}

// Update Answer model
const oldAnswer = `model Answer {
  id           String   @id @default(uuid())
  sessionId    String
  questionId   String
  responseType String // 'correct', 'incorrect', 'dont_know'
  isCorrect    Boolean
  timeSpent    Int
  timestamp    DateTime @default(now())

  session  StudySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@schema("qestudo")
}`;

const newAnswer = `model Answer {
  id               String   @id @default(uuid())
  sessionId        String
  questionId       String
  selectedOptionId String?
  responseType     String   @default("answered") // 'answered', 'dont_know'
  isCorrect        Boolean
  timeSpent        Int      @default(0)
  timestamp        DateTime @default(now())

  session        StudySession    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  question       Question        @relation(fields: [questionId], references: [id], onDelete: Cascade)
  selectedOption QuestionOption? @relation(fields: [selectedOptionId], references: [id], onDelete: SetNull)

  @@unique([sessionId, questionId])
  @@schema("qestudo")
}`;

schema = schema.replace(oldAnswer, newAnswer);

fs.writeFileSync('prisma/schema.prisma', schema);
