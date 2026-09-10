const fs = require('fs');
let code = fs.readFileSync('src/mocks/data.ts', 'utf-8');
code = code.replace(/confidenceScore: 0\.9/g, 'confidenceScore: 0.9'); 
code = code.replace(/confidenceScore: '0\.9'/g, 'confidenceScore: 0.9'); 
code = code.replace(/confidenceScore: "0\.9"/g, 'confidenceScore: 0.9'); 
// wait, the error is number is not assignable to string? 
// Or string is not assignable to number? 
// "Type 'number' is not assignable to type 'string'" means confidenceScore is defined as string in the type?
