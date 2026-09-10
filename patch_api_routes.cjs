const fs = require('fs');

let code = fs.readFileSync('server/routes/api.ts', 'utf-8');

code = code.replace(
  /const studyNextQuestionService = new StudyNextQuestionService\(\);/,
  ""
);
code = code.replace(
  /const validatorService = new QuestionValidatorService\(\);/,
  ""
);

code = code.replace(
  /studyNextQuestionService\.getNextQuestion\(req\.params\.id, req\.body\)/,
  "new StudyNextQuestionService().getNextQuestion(req.params.id, req.body)"
);

code = code.replace(
  /validatorService\.validateQuestion\(req\.params\.id, req\.body\?\.escalation\)/,
  "new QuestionValidatorService().validateQuestion(req.params.id, req.body?.escalation)"
);

fs.writeFileSync('server/routes/api.ts', code);
