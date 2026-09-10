const fs = require('fs');

let code = fs.readFileSync('server/controllers/materials.ts', 'utf-8');

code = code.replace(
  /getById: async \(req: Request, res: Response\) => \{[\s\S]*?res\.json\(data\);\s*\} catch \(e: any\) \{/,
  `getById: async (req: Request, res: Response) => {
    try {
      const data = await MaterialService.getById(req.params.id as string);
      if (!data) return res.status(404).json({ error: 'Not found' });
      
      const pageCount = await prisma.materialPage.count({ where: { materialId: data.id } });
      const chunkCount = await prisma.materialChunk.count({ where: { materialId: data.id } });
      const disciplineCount = await prisma.concept.count({ where: { materialId: data.id, level: 'discipline' } });
      const topicCount = await prisma.concept.count({ where: { materialId: data.id, level: 'topic' } });
      const subtopicCount = await prisma.concept.count({ where: { materialId: data.id, level: 'subtopic' } });
      const conceptCount = await prisma.concept.count({ where: { materialId: data.id, level: 'concept' } });
      
      // DIAGNOSTIC LOG (as requested in step 13)
      console.log(\`[Material Diagnostic \${data.id}]\`);
      console.log(\`- status: \${data.status}\`);
      console.log(\`- pages: \${pageCount}\`);
      console.log(\`- chunks: \${chunkCount}\`);
      console.log(\`- disciplineCount: \${disciplineCount}\`);
      console.log(\`- topicCount: \${topicCount}\`);
      console.log(\`- subtopicCount: \${subtopicCount}\`);
      console.log(\`- conceptCount: \${conceptCount}\`);
      
      // AUTO-FIX INCONSISTENCY (as requested in step 14)
      let finalStatus = data.status;
      if (data.status === 'ready' && conceptCount === 0) {
         finalStatus = data.processingError ? 'mapping_error' : 'ready_for_mapping';
         await prisma.material.update({ where: { id: data.id }, data: { status: finalStatus } });
         data.status = finalStatus;
         console.log(\`[Material Auto-Fix] Changed status from ready to \${finalStatus}\`);
      }
      
      const payload = {
        ...data,
        stats: { pageCount, chunkCount, disciplineCount, topicCount, subtopicCount, conceptCount }
      };
      
      res.json(payload);
    } catch (e: any) {`
);

fs.writeFileSync('server/controllers/materials.ts', code);
