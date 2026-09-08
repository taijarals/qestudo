const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionGeneratorService.ts', 'utf-8');

// Patch chunk fetching
code = code.replace(
  "where: { id: { in: plan.sourceChunkIds } }",
  "where: { id: { in: plan.sourceChunkIds }, materialId: plan.materialId }"
);

// Patch source validation
const originalValidation = `        // Add source references (validating against allowed chunks)
        const validSources = data.sourceChunkIds.filter((id: string) => plan.sourceChunkIds.includes(id));
        if (validSources.length === 0 && plan.sourceChunkIds.length > 0) {
           // Fallback if model hallucinates chunks, just use the first authorized chunk
           validSources.push(plan.sourceChunkIds[0]);
        }
        
        for (const chunkId of validSources) {
           const c = chunks.find(ch => ch.id === chunkId);
           if (c) {
             await tx.questionSourceReference.create({
               data: {
                 questionId: question.id,
                 materialId: plan.materialId,
                 chunkId: c.id,
                 page: c.pageStart,
                 excerpt: c.text.substring(0, 200) + '...' // simplification for excerpt
               }
             });
           }
        }`;

const newValidation = `        // Add source references (validating against allowed chunks)
        const validSources = data.sourceChunkIds.filter((id: string) => plan.sourceChunkIds.includes(id));
        
        if (validSources.length === 0) {
           throw new Error('No valid sourceChunkIds returned by the model');
        }
        
        if (validSources.length !== data.sourceChunkIds.length) {
           throw new Error('Model returned unauthorized sourceChunkIds');
        }
        
        for (const chunkId of validSources) {
           const c = chunks.find(ch => ch.id === chunkId);
           if (!c) {
              throw new Error(\`Chunk \${chunkId} not found in loaded chunks\`);
           }
           await tx.questionSourceReference.create({
             data: {
               questionId: question.id,
               materialId: plan.materialId,
               chunkId: c.id,
               page: c.pageStart,
               excerpt: c.text.substring(0, 200) + '...' // simplification for excerpt
             }
           });
        }`;

code = code.replace(originalValidation, newValidation);

fs.writeFileSync('server/services/QuestionGeneratorService.ts', code);
