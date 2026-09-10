const fs = require('fs');
let code = fs.readFileSync('server/controllers/aiUsage.ts', 'utf-8');

code = code.replace("const { batchId } = req.params;", "const batchId = req.params.batchId as string;");

fs.writeFileSync('server/controllers/aiUsage.ts', code);
