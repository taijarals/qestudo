const fs = require('fs');
let schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');

if (!schema.includes("usageCount")) {
  schema = schema.replace(
    /model Question \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
    (match) => {
        return match.replace(/@@schema\("qestudo"\)/, 
  "  usageCount              Int       @default(0)\n  lastUsedAt              DateTime?\n  @@schema(\"qestudo\")");
    }
  );
}

// Add dont_know to Answer if not exists
if (!schema.includes("responseType")) {
  schema = schema.replace(
    /model Answer \{[\s\S]*?@@schema\("qestudo"\)\n\}/,
    (match) => {
        return match.replace(/@@schema\("qestudo"\)/, 
  "  responseType            String    @default(\"answered\")\n  @@schema(\"qestudo\")");
    }
  );
}

fs.writeFileSync('prisma/schema.prisma', schema);
