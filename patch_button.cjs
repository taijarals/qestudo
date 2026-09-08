const fs = require('fs');
let code = fs.readFileSync('src/components/ui/Button.tsx', 'utf-8');
code = code.replace(
  "'bg-green-500 text-white hover:bg-green-600': variant === 'success',",
  "'bg-green-500 text-white hover:bg-green-600': variant === 'success',\n          'bg-orange-500 text-white hover:bg-orange-600': variant === 'warning',"
);
fs.writeFileSync('src/components/ui/Button.tsx', code);
