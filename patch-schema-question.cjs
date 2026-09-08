const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(
  /model Question \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  `model Question {
  id                   String  @id @default(uuid())
  statement            String
  type                 String
  board                String
  difficulty           String
  cognitiveObjective   String?
  explanation          String?
  trapType             String?
  confidenceScore      Float?
  validationStatus     String  @default("validated")
  materialId           String
  conceptId            String
  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  concept  Concept  @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  options          QuestionOption[]
  sourceReferences QuestionSourceReference[]
  answers          Answer[]
  @@schema("qestudo")
}`
);

fs.writeFileSync('prisma/schema.prisma', schema);
