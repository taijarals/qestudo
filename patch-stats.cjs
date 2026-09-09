const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  "{material.pageCount || 42}",
  "{material.pageCount ?? '--'}"
);

code = code.replace(
  "<span className=\"text-xl font-bold text-slate-900\">{material.conceptCount}</span>",
  "<span className=\"text-xl font-bold text-slate-900\">{concepts.filter(c => c.level === 'concept').length || '--'}</span>"
);

code = code.replace(
  "<span className=\"text-xl font-bold text-slate-900\">{material.questionCount}</span>",
  `<div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-900">{questions.filter(q => q.validationStatus === 'validated').length}</span>
                  <span className="text-[10px] text-slate-400 leading-tight mt-0.5">já armazenadas</span>
                </div>`
);

code = code.replace(
  "questionCountByConcept[c.id] = count > 0 ? count : (c.name.length * 2);",
  "questionCountByConcept[c.id] = questions.filter(q => q.conceptId === c.id && q.validationStatus === 'validated').length;"
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
