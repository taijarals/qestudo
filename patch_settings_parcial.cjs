const fs = require('fs');
let code = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');
code = code.replace(
  /\{summary\?\.hasMissingTokenData && \(/,
  "{summary?.hasMissingTokenData && summary?.totalTokens != null && ("
);
fs.writeFileSync('src/pages/Settings.tsx', code);
