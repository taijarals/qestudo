const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const newFields = `  fileName           String?
  storagePath        String?
  fileSize           Int?
  mimeType           String?
  status             String    @default("active")
  processingProgress Int       @default(0)
  uploadedAt         DateTime?
  pageCount          Int?
  processingError    String?`;

schema = schema.replace(
  /model Material \{[\s\S]*?progress\s+Int\s+@default\(0\)/,
  (match) => `${match}\n${newFields}`
);

fs.writeFileSync('prisma/schema.prisma', schema);
