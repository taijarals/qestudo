const fs = require('fs');
let code = fs.readFileSync('src/pages/StudyConfig.tsx', 'utf-8');

code = code.replace(
  "import { useNavigate, useLocation } from 'react-router-dom';",
  "import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';"
);

code = code.replace(
  "const location = useLocation();",
  "const location = useLocation();\n  const [searchParams] = useSearchParams();"
);

fs.writeFileSync('src/pages/StudyConfig.tsx', code);
