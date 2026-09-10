const fs = require('fs');

let code = fs.readFileSync('server/services/QuestionBatchGenerationService.ts', 'utf-8');

// Update maxAttempts
code = code.replace("const maxAttempts = batch.requestedQuantity * 3;", "const maxAttempts = Math.max(2, Math.ceil(batch.requestedQuantity * 1.5));");

// Inject consecutive rejection check and quota/rate_limit check
const loopRegex = /let attempts = 0;\s*\/\/ Fetch existing questions/;
code = code.replace(loopRegex, `let attempts = 0;\n      let consecutiveRejections = 0;\n      // Fetch existing questions`);

const catchRegex = /} catch \(e: any\) \{\n\s*console\.error\(\`\[Batch \$\{batchId\}\] Error on attempt \$\{attempts\}:\`, e\.message\);\n\s*rejected\+\+;\n\s*\}/;
const newCatch = `} catch (e: any) {
          console.error(\`[Batch \${batchId}] Error on attempt \${attempts}:\`, e.message);
          rejected++;
          consecutiveRejections++;
          if (e.type === 'local_ai_budget_exceeded' || e.message?.includes('local_ai_budget_exceeded')) {
            await prisma.questionBatch.update({
              where: { id: batchId },
              data: { status: 'paused_quota', errorMessage: 'Limite de tokens local excedido' }
            });
            return;
          }
          if (e.status === 429 || e.message?.toLowerCase().includes('quota') || e.message?.toLowerCase().includes('exhausted')) {
            await prisma.questionBatch.update({
              where: { id: batchId },
              data: { status: 'paused_quota', errorMessage: 'Quota do Gemini excedida' }
            });
            return;
          }
          if (e.message?.toLowerCase().includes('rate limit')) {
            await prisma.questionBatch.update({
              where: { id: batchId },
              data: { status: 'paused_quota', errorMessage: 'Rate limit do Gemini atingido' }
            });
            return;
          }
        }`;
code = code.replace(catchRegex, newCatch);

const valResultRegex = /if \(valResult\.validationStatus === 'validated'\) \{/;
const newValResult = `if (valResult.validationStatus === 'validated') {
            consecutiveRejections = 0;`;
code = code.replace(valResultRegex, newValResult);

const valElseRegex = /\} else \{\n\s*rejected\+\+;\n\s*\}/;
const newValElse = `} else {
            rejected++;
            consecutiveRejections++;
          }`;
code = code.replace(valElseRegex, newValElse);

const whileRegex = /while \(validated < batch.requestedQuantity && attempts < maxAttempts\) \{/;
const newWhile = `while (validated < batch.requestedQuantity && attempts < maxAttempts) {
        if (consecutiveRejections >= 3) {
          console.log(\`[Batch \${batchId}] Abortando lote por 3 falhas consecutivas.\`);
          break; // Stop after 3 consecutive failures
        }
`;
code = code.replace(whileRegex, newWhile);

const finalStatusRegex = /const finalStatus = validated >= batch.requestedQuantity \? 'completed' : \(validated > 0 \? 'partial' : 'failed'\);\n\s*const finalError = finalStatus === 'failed' \? 'Não foi possível gerar questões válidas \(limite de tentativas excedido\).' : null;/;
const newFinalStatus = `const finalStatus = validated >= batch.requestedQuantity ? 'completed' : (validated > 0 ? 'partial' : 'failed');
      let finalError = finalStatus === 'failed' ? 'Não foi possível gerar questões válidas (limite de tentativas excedido).' : null;
      if (consecutiveRejections >= 3) {
        finalError = 'Lote interrompido precocemente devido à alta taxa de rejeição ou erro.';
      }`;
code = code.replace(finalStatusRegex, newFinalStatus);

// In processBatch, pass batchId to generateQuestion
code = code.replace(/const generatedQ = await this\.generator\.generateQuestion\(plan\.id\);/, "const generatedQ = await this.generator.generateQuestion(plan.id, batch.id);");

fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
