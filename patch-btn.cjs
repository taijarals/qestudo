const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

code = code.replace(
  `            <div className="flex items-center gap-3 w-32">
              <div className="flex-1 hidden sm:block">
                <ProgressBar value={score} colorClass={score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'} />
              </div>
              <span className="text-sm font-bold text-slate-700 w-10 text-right">{score}%</span>
            </div>`,
  `            <div className="flex items-center gap-3 w-32">
              <div className="flex-1 hidden sm:block">
                <ProgressBar value={score} colorClass={score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'} />
              </div>
              <span className="text-sm font-bold text-slate-700 w-10 text-right">{score}%</span>
            </div>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleStudyConcept(node.concept.id); }}>Estudar</Button>`
);

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
