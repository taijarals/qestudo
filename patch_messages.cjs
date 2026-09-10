const fs = require('fs');
let code = fs.readFileSync('server/services/QuestionBatchGenerationService.ts', 'utf-8');

code = code.replace("'Quota do Gemini excedida'", "'Limite da IA atingido. A geração foi pausada para evitar novas tentativas.'");
code = code.replace("'Rate limit do Gemini atingido'", "'A IA está temporariamente limitando novas requisições. Tente novamente mais tarde.'");
code = code.replace("'Não foi possível gerar questões válidas (limite de tentativas excedido).'", "'Não foi possível gerar novas questões válidas dentro do limite de tentativas.'");

fs.writeFileSync('server/services/QuestionBatchGenerationService.ts', code);
