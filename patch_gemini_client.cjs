const fs = require('fs');

let code = fs.readFileSync('server/services/ai/GeminiClient.ts', 'utf-8');

const timezoneCode = `    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bahia', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(now);
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const todayStart = new Date(\`\${year}-\${month}-\${day}T00:00:00.000-03:00\`);`;

code = code.replace(
  /    const todayStart = new Date\(\);\s*todayStart\.setHours\(0, 0, 0, 0\);/,
  timezoneCode
);

fs.writeFileSync('server/services/ai/GeminiClient.ts', code);
