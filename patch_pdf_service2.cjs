const fs = require('fs');

let code = fs.readFileSync('server/services/PdfProcessingService.ts', 'utf-8');

code = code.replace(
  /import \{ storageService \} from '\.\/storage';/,
  "import { storageService } from './storage';\nimport { ConceptMappingService } from './ConceptMappingService';"
);

code = code.replace(
  /\/\/ 9\. Update Material to ready_for_mapping\n\s*await prisma\.material\.update\(\{\n\s*where: \{ id: materialId \},\n\s*data: \{ \n\s*status: 'ready_for_mapping', \n\s*processingProgress: 100 \n\s*\}\n\s*\}\);/,
  `// 9. Update Material to ready_for_mapping
      await prisma.material.update({
        where: { id: materialId },
        data: { 
          status: 'ready_for_mapping', 
          processingProgress: 100 
        }
      });
      
      // Automatically start concept mapping for seamless MVP experience
      const mapper = new ConceptMappingService();
      mapper.mapConcepts(materialId).catch(console.error);`
);

fs.writeFileSync('server/services/PdfProcessingService.ts', code);
