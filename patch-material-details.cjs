const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  `            <h4 className={cn("truncate", depth === 0 ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
              {node.concept.name}
            </h4>`,
  `            <h4 className={cn("truncate", depth === 0 ? "font-bold text-slate-900" : "font-medium text-slate-700")}>
              <span className="text-slate-500 font-normal mr-2">
                {node.concept.level === 'discipline' ? 'Matéria:' : node.concept.level === 'topic' ? 'Assunto:' : node.concept.level === 'subtopic' ? 'Subassunto:' : 'Conceito:'}
              </span>
              {node.concept.name}
            </h4>`
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
