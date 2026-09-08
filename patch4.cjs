const fs = require('fs');
let code = fs.readFileSync('src/pages/ErrorNotebook.tsx', 'utf-8');

code = code.replace(/import \{ mockErrors \} from '\.\.\/mocks\/data';/, "import { performanceService } from '../services';\nimport { ErrorRecord } from '../types';\nimport { useState, useEffect } from 'react';");

const match = `export function ErrorNotebook() {
  return (`;

const replace = `export function ErrorNotebook() {
  const [errorRecords, setErrorRecords] = useState<ErrorRecord[]>([]);

  useEffect(() => {
    performanceService.getErrorRecords().then(setErrorRecords);
  }, []);

  return (`;

code = code.replace(match, replace);
code = code.replace(/mockErrors/g, "errorRecords");

fs.writeFileSync('src/pages/ErrorNotebook.tsx', code);
