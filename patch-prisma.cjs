const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

schema = schema.replace(
  /generator client\s*\{[\s\S]*?\}/,
  `generator client {\n  provider = "prisma-client-js"\n  previewFeatures = ["multiSchema"]\n}`
);

schema = schema.replace(
  /datasource db\s*\{[\s\S]*?\}/,
  `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n  schemas  = ["qestudo"]\n}`
);

schema = schema.replace(/model \w+ \{[^}]+\}/g, (match) => {
  if (match.includes('@@schema')) return match;
  return match.replace(/\n\}$/, '\n  @@schema("qestudo")\n}');
});

fs.writeFileSync('prisma/schema.prisma', schema);
