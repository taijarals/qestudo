const fs = require('fs');
let code = fs.readFileSync('src/pages/StudyConfig.tsx', 'utf-8');

code = code.replace(
  `Questões validadas disponíveis no escopo: {availableQuestions}
               </div>
               {availableQuestions < quantity && (
                 <div className="mt-3">
                   <p className="text-red-600 font-semibold mb-2 text-sm">
                     Quantidade insuficiente para uma sessão de {quantity} questões.
                   </p>
                   <Link to={\`/materiais/\${selectedMaterial}\`} className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-semibold hover:bg-blue-200 transition-colors">
                     Gerar mais questões
                   </Link>
               </div>
            )}`,
  `Questões validadas disponíveis no escopo: {availableQuestions}
               </div>
            )}
            {availableQuestions !== null && availableQuestions < quantity && (
                 <div className="mt-3">
                   <p className="text-red-600 font-semibold mb-2 text-sm">
                     Quantidade insuficiente para uma sessão de {quantity} questões.
                   </p>
                   <Link to={\`/materiais/\${selectedMaterial}\`} className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-semibold hover:bg-blue-200 transition-colors">
                     Gerar mais questões
                   </Link>
                 </div>
            )}`
);

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
