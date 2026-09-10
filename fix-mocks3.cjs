const fs = require('fs');
let code = fs.readFileSync('src/mocks/data.ts', 'utf-8');
code = code.replace(/level: 1/g, "level: 'topic'"); 
code = code.replace(/level: 2/g, "level: 'concept'"); 
fs.writeFileSync('src/mocks/data.ts', code);
