import { AnswerKeyPlanner } from '../services/AnswerKeyPlanner';

function runTests() {
  const planner = new AnswerKeyPlanner();
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      passed++;
      console.log(`✅ PASS: ${msg}`);
    } else {
      failed++;
      console.error(`❌ FAIL: ${msg}`);
    }
  }

  console.log('--- Testing AnswerKeyPlanner ---');

  // Test Multiple Choice Distribution
  const mcHistory: number[] = [];
  const mcCounts = [0, 0, 0, 0, 0];
  let mcImmediateRepeats = 0;

  for (let i = 0; i < 100; i++) {
    const next = planner.computeNextMultipleChoice(mcHistory.slice(0, 20));
    mcHistory.unshift(next);
    mcCounts[next]++;
  }

  for (let i = 0; i < mcHistory.length - 1; i++) {
    if (mcHistory[i] === mcHistory[i + 1]) mcImmediateRepeats++;
  }

  const mcMin = Math.min(...mcCounts);
  const mcMax = Math.max(...mcCounts);

  assert(mcMax - mcMin <= 25, 'Multiple Choice distribution is reasonably balanced (max diff <= 25)');
  assert(mcImmediateRepeats <= 25, 'Not too many immediate repeats (<= 25%)');
  
  // Test True/False Distribution
  const tfHistory: boolean[] = [];
  let trueCount = 0;
  let falseCount = 0;
  let tfLongSequences = 0;

  for (let i = 0; i < 100; i++) {
    const next = planner.computeNextTrueFalse(tfHistory.slice(0, 20));
    tfHistory.unshift(next);
    if (next) trueCount++;
    else falseCount++;
  }

  for (let i = 0; i < tfHistory.length - 4; i++) {
    if (
      tfHistory[i] === tfHistory[i+1] &&
      tfHistory[i+1] === tfHistory[i+2] &&
      tfHistory[i+2] === tfHistory[i+3] &&
      tfHistory[i+3] === tfHistory[i+4]
    ) {
      tfLongSequences++;
    }
  }

  assert(Math.abs(trueCount - falseCount) <= 30, 'True/False distribution is reasonably balanced (diff <= 30)');
  assert(tfLongSequences === 0, 'No sequences of 5 identical True/False answers');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
