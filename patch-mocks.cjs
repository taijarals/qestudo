const fs = require('fs');
let code = fs.readFileSync('src/mocks/data.ts', 'utf-8');
code = code.replace(/confidenceScore: '[^']*'/g, 'confidenceScore: 0.9');
fs.writeFileSync('src/mocks/data.ts', code);
