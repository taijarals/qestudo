const fs = require('fs');
let code = fs.readFileSync('src/pages/StudyConfig.tsx', 'utf-8');

// We will need to navigate to Material Details to generate more, or open the modal here.
// Opening the modal here is harder since it depends on the exact scope and board selected.
// Let's add a button that redirects to the MaterialDetails page where they can generate per topic.

code = code.replace(
  "import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';",
  "import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';"
);

code = code.replace(
  "Questões validadas disponíveis no escopo: {availableQuestions}",
  `Questões validadas disponíveis no escopo: {availableQuestions}
               </div>
               {availableQuestions < quantity && (
                 <div className="mt-3">
                   <p className="text-red-600 font-semibold mb-2 text-sm">
                     Quantidade insuficiente para uma sessão de {quantity} questões.
                   </p>
                   <Link to={\`/materiais/\${selectedMaterial}\`} className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-md font-semibold hover:bg-blue-200 transition-colors">
                     Gerar mais questões
                   </Link>`
);

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
