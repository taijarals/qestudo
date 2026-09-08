const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const newModels = `
model MaterialPage {
  id             String   @id @default(uuid())
  materialId     String
  pageNumber     Int
  text           String
  characterCount Int
  hasUsableText  Boolean
  createdAt      DateTime @default(now())
  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  @@unique([materialId, pageNumber])
  @@schema("qestudo")
}

model MaterialChunk {
  id             String   @id @default(uuid())
  materialId     String
  order          Int
  pageStart      Int
  pageEnd        Int
  text           String
  characterCount Int
  createdAt      DateTime @default(now())
  material Material @relation(fields: [materialId], references: [id], onDelete: Cascade)
  @@unique([materialId, order])
  @@schema("qestudo")
}
`;

schema = schema.replace(
  /model Material \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 'pages     MaterialPage[]\n  chunks    MaterialChunk[]\n  @@schema("qestudo")');
  }
);

schema = schema + '\n' + newModels;

fs.writeFileSync('prisma/schema.prisma', schema);
