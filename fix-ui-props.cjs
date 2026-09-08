const fs = require('fs');

function addChildren(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/interface (\w+Props) (extends [^{]+)?\{/, "interface $1 $2{\n  children?: React.ReactNode;");
  fs.writeFileSync(file, content);
}

['Button', 'Badge', 'Card', 'ProgressBar'].forEach(c => {
  addChildren(`src/components/ui/${c}.tsx`);
});
