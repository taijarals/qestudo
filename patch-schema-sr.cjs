const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(
  /model QuestionSourceReference \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  `model QuestionSourceReference {
  id         String @id @default(uuid())
  questionId String
  materialId String?
  page       Int?
  excerpt    String
  chunkId    String?
  question Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@schema("qestudo")
}`
);

fs.writeFileSync('prisma/schema.prisma', schema);
