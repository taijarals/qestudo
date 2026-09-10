const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');
code = code.replace(/const { prisma } = require\('\.\.\/database\/prisma'\);/g, '');
fs.writeFileSync('server/routes/api.ts', code);
