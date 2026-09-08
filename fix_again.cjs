const fs = require('fs');

const mappings = {
  'Button': 'React.ButtonHTMLAttributes<HTMLButtonElement>',
  'Badge': 'React.HTMLAttributes<HTMLDivElement>',
  'Card': 'React.HTMLAttributes<HTMLDivElement>',
  'ProgressBar': 'React.HTMLAttributes<HTMLDivElement>'
};

for (const [component, ext] of Object.entries(mappings)) {
  const file = `src/components/ui/${component}.tsx`;
  let code = fs.readFileSync(file, 'utf-8');
  // It currently has `interface ComponentProps {\n  children?: React.ReactNode;`
  code = code.replace(new RegExp(`interface ${component}Props \\{\\n  children\\?: React\\.ReactNode;`), `interface ${component}Props extends ${ext} {\n  children?: React.ReactNode;`);
  fs.writeFileSync(file, code);
}
