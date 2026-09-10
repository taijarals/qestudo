const fs = require('fs');

let code = fs.readFileSync('server/services/ConceptMappingService.ts', 'utf-8');

// 1. Allow mapping_error to retry mapping
code = code.replace(
  /if \(material\.status !== 'ready_for_mapping'\) \{/,
  "if (material.status !== 'ready_for_mapping' && material.status !== 'mapping_error') {"
);

// 2. Add concept count validation before setting to ready
code = code.replace(
  /await prisma\.material\.update\(\{\s*where: \{ id: materialId \},\s*data: \{ status: 'ready', processingProgress: 100 \}\s*\}\);/,
  `const finalConcepts = await prisma.concept.count({ where: { materialId, level: 'concept' } });
      if (finalConcepts === 0) {
        await prisma.material.update({
          where: { id: materialId },
          data: { status: 'mapping_error', processingError: 'mapping_invalid_output', processingProgress: 100 }
        });
      } else {
        await prisma.material.update({
          where: { id: materialId },
          data: { status: 'ready', processingProgress: 100 }
        });
      }`
);

// 3. Catch block sanitization
code = code.replace(
  /catch \(error: any\) \{\s*console\.error\('\[mapping_failed\]', error\);\s*await prisma\.material\.update\(\{\s*where: \{ id: materialId \},\s*data: \{ status: 'mapping_error', processingError: error\.message \|\| 'Unknown error during mapping' \}\s*\}\);\s*\}/,
  `catch (error: any) {
      console.error('[mapping_failed]', error);
      let errorMsg = 'mapping_failed';
      const rawMsg = error.message ? error.message.toLowerCase() : '';
      
      if (rawMsg.includes('quota') || rawMsg.includes('exhausted') || error.status === 429) {
        errorMsg = 'quota_exceeded';
      } else if (rawMsg.includes('rate limit')) {
        errorMsg = 'rate_limited';
      } else if (rawMsg.includes('model')) {
        errorMsg = 'invalid_model';
      } else if (rawMsg.includes('parse') || rawMsg.includes('json')) {
        errorMsg = 'mapping_invalid_output';
      } else {
        errorMsg = error.message || 'unknown_error';
      }

      await prisma.material.update({
        where: { id: materialId },
        data: { status: 'mapping_error', processingError: errorMsg }
      });
    }`
);

fs.writeFileSync('server/services/ConceptMappingService.ts', code);
