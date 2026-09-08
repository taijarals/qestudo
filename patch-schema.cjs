const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const newModels = `
model ConceptSource {
  id              String   @id @default(uuid())
  conceptId       String
  materialChunkId String
  pageStart       Int
  pageEnd         Int
  excerpt         String?
  concept         Concept       @relation(fields: [conceptId], references: [id], onDelete: Cascade)
  materialChunk   MaterialChunk @relation(fields: [materialChunkId], references: [id], onDelete: Cascade)
  @@schema("qestudo")
}

model ConceptRelation {
  id             String  @id @default(uuid())
  conceptId      String
  targetId       String
  relationType   String  // 'related', 'confusable'
  concept        Concept @relation("ConceptRelationSource", fields: [conceptId], references: [id], onDelete: Cascade)
  targetConcept  Concept @relation("ConceptRelationTarget", fields: [targetId], references: [id], onDelete: Cascade)
  @@unique([conceptId, targetId, relationType])
  @@schema("qestudo")
}
`;

schema = schema.replace(
  /model Concept \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
"  description String?\n  level       String?   @default(\"concept\")\n  sources     ConceptSource[]\n  relationsSource ConceptRelation[] @relation(\"ConceptRelationSource\")\n  relationsTarget ConceptRelation[] @relation(\"ConceptRelationTarget\")\n  @@schema(\"qestudo\")");
  }
);

schema = schema.replace(
  /model MaterialChunk \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
  (match) => {
    return match.replace(/@@schema\("qestudo"\)/, 
"  conceptSources ConceptSource[]\n  @@schema(\"qestudo\")");
  }
);

schema = schema + '\n' + newModels;

fs.writeFileSync('prisma/schema.prisma', schema);
