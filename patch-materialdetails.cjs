const fs = require('fs');

let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

if (!code.includes("Estudar este material")) {
  code = code.replace(
    "{material.status === 'ready_for_mapping' && (",
    `{material.status === 'ready' && (
              <div className="pt-2">
                <Button onClick={() => navigate(\`/estudar?materialId=\${material.id}\`)} className="flex items-center gap-2">
                   <GraduationCap className="w-4 h-4" />
                   Estudar este material
                </Button>
              </div>
            )}
            {material.status === 'ready_for_mapping' && (`
  );
}

fs.writeFileSync('src/pages/MaterialDetails.tsx', code);
