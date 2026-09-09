const fs = require('fs');
let code = fs.readFileSync('server/services/AdaptiveStudyEngine.ts', 'utf-8');

// Update weak point selection to prioritize not_understood
if (!code.includes("c.mastery.lastComprehensionFeedback === 'not_understood'")) {
  code = code.replace(
    "else if (c.mastery.status === 'learning' || c.mastery.masteryScore < 0.5) {",
    "else if (c.mastery.status === 'learning' || c.mastery.masteryScore < 0.5 || c.mastery.lastComprehensionFeedback === 'not_understood') {"
  );
}

fs.writeFileSync('server/services/AdaptiveStudyEngine.ts', code);
