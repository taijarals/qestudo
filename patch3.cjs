const fs = require('fs');
let code = fs.readFileSync('src/pages/Performance.tsx', 'utf-8');

code = code.replace(/import \{ mockPerformance \} from '\.\.\/mocks\/data';/, "import { performanceService } from '../services';\nimport { ConceptPerformance } from '../types';");
code = code.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");

const match = `export function Performance() {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ 'c2': true });

  const toggleExpand = (id: string) => {`;

const replace = `export function Performance() {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ 'c2': true });
  const [performanceData, setPerformanceData] = useState<ConceptPerformance[]>([]);

  useEffect(() => {
    performanceService.getPerformanceData().then(setPerformanceData);
  }, []);

  const toggleExpand = (id: string) => {`;

code = code.replace(match, replace);
code = code.replace(/mockPerformance/g, "performanceData");

fs.writeFileSync('src/pages/Performance.tsx', code);
