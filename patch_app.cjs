const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import { Dashboard } from './pages/Dashboard';", "import { Dashboard } from './pages/Dashboard';\nimport { Settings } from './pages/Settings';");
code = code.replace("<Route path=\"/configuracoes\" element={<div className=\"p-8\">Configurações (Em breve)</div>} />", "<Route path=\"/configuracoes\" element={<Settings />} />");

fs.writeFileSync('src/App.tsx', code);
