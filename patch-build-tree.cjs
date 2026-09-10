const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace("const buildTree = (parentId?: string): ConceptNode[] => {", "const buildTree = (parentId: string | null = null): ConceptNode[] => {");
code = code.replace("const conceptTree = buildTree(undefined);", "const conceptTree = buildTree(null);");

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
