const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

// The file has some duplicate lines
let lines = code.split('\n');
let newLines = [];
let seen = new Set();
for (let line of lines) {
  if (line.includes('import { questionController }') || line.includes("apiRouter.get('/questions/:id'")) {
    if (seen.has(line)) continue;
    seen.add(line);
  }
  newLines.push(line);
}
fs.writeFileSync('server/routes/api.ts', newLines.join('\n'));
