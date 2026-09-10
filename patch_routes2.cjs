const fs = require('fs');
let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  /studyNextQuestionService\.getNextQuestion\(req\.params\.id\)/,
  "new StudyNextQuestionService().getNextQuestion(req.params.id)"
);

code = code.replace(
  /validatorService\.validateQuestion\(req\.params\.id\)/,
  "new QuestionValidatorService().validateQuestion(req.params.id)"
);

fs.writeFileSync('server/routes/api.ts', code);
