const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');
code = code.replace(/processing-stats/g, 'processing-status');
fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
