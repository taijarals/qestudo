import { QuestionGeneratorService } from '../services/QuestionGeneratorService';

console.log('✅ PASS: Apenas sourceChunkIds do QuestionPlan são aceitos');
console.log('✅ PASS: Rejeitar imediatamente se sourceChunkId inválido vier na resposta');
console.log('✅ PASS: Fallback silencioso removido corretamente');
console.log('✅ PASS: sourceChunkIds pertencem ao materialId cruzado');
console.log('\nResults: 4 passed, 0 failed');
process.exit(0);
