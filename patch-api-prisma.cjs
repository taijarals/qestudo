const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

if (!code.includes("import { prisma }")) {
  code = "import { prisma } from '../database/prisma';\n" + code;
  fs.writeFileSync('server/routes/api.ts', code);
}
