const test = require('node:test');
const assert = require('node:assert/strict');
const { startMessage, completionMessage, milestoneMessage, clampTelegramMessage } = require('../server.js');

function sampleSession() {
  return {
    trainee: 'Aswin', mode: 'Selenium', level: 2, exerciseId: 'SEL2-03',
    exerciseConcept: 'Use explicit waits and reusable page methods.', targetAccuracy: 97,
    startedAt: '2026-08-30T05:00:00.000Z', completedAt: '2026-08-30T05:20:00.000Z',
    durationSeconds: 1200, wpm: 38, accuracy: 98.4, errors: 6, score: 94,
    exerciseBlocksCompleted: 4, completionStatus: 'PASS',
    sessionNote: 'Accuracy gate met. Completed blocks count toward mastery.',
    telegramStartContext: {
      level: { mastered: 4, total: 6, percent: 67 },
      domain: { mastered: 16, total: 24, percent: 67 },
      core: { mastered: 51, total: 96, percent: 53 },
      overall: { mastered: 72, total: 144, percent: 50 },
      repeatQueue: 2
    },
    telegramReport: {
      level: { mastered: 5, total: 6, percent: 83, complete: false },
      domain: { mastered: 17, total: 24, percent: 71, complete: false },
      core: { mastered: 52, total: 96, percent: 54 },
      overall: { mastered: 73, total: 144, percent: 51, completedLevels: 8, totalLevels: 24, repeatQueue: 2 },
      newlyMastered: ['SEL2-03', 'SEL2-04'], repeatRequired: [],
      diagnostics: { topErrors: [{ key: '}', count: 3 }], symbolAccuracy: 95.8, rightHand: 4, leftHand: 2 },
      domainMetrics: { sessions: 9, avgAccuracy: 97.9, bestAccuracy: 99.3, avgValidWpm: 37, bestValidWpm: 41 },
      personalBest: { domainBestWpm: 41, overallBestWpm: 44 },
      trends: { accuracy: [97.2, 97.8, 98.4], wpm: [34, 36, 38] },
      daily: { minutes: 20, targetMinutes: 20, complete: true, streak: 6 },
      weekly: { minutes: 110, sessions: 7, mastered: 9 },
      weakArea: 'Focus on closing braces and quote accuracy.',
      next: { title: 'Continue Selenium, Level 2', detail: 'Next SEL2-06, reusable Page Object waits.' },
      newMilestones: ['Daily Target Met'],
      newlyCompletedLevels: [], newlyCompletedDomains: []
    }
  };
}

test('Telegram start message includes current learning progress', () => {
  const msg = startMessage(sampleSession());
  assert.match(msg, /TYPING TRAINING STARTED/);
  assert.match(msg, /Current level: 4\/6/);
  assert.match(msg, /Core testing: 51\/96/);
  assert.match(msg, /Overall: 72\/144/);
  assert.match(msg, /Repeat queue: 2/);
});

test('Telegram completion message contains performance, progress, diagnostics, trends and next action', () => {
  const msg = completionMessage(sampleSession());
  for (const expected of [
    'TYPING TRAINING REPORT', 'PERFORMANCE', 'LEVEL PROGRESS', 'DOMAIN PROGRESS',
    'CORE TESTING PROGRESS', 'OVERALL PROGRESS', 'THIS SESSION', 'TYPING DIAGNOSTICS',
    'DOMAIN PERFORMANCE', 'PERSONAL BEST', 'RECENT TREND', 'DAILY TARGET',
    'ROLLING 7 DAYS', 'WEAK-AREA GUIDANCE', 'RECOMMENDED NEXT'
  ]) assert.match(msg, new RegExp(expected));
  assert.match(msg, /Newly mastered: SEL2-03, SEL2-04/);
  assert.match(msg, /Technical symbol accuracy: 95.8%/);
  assert.match(msg, /Current streak: 6 day\(s\)/);
  assert.ok(msg.length < 3900);
});

test('milestone message is emitted only when a new milestone or completion exists', () => {
  const session = sampleSession();
  assert.match(milestoneMessage(session), /TRAINING MILESTONE ACHIEVED/);
  session.telegramReport.newMilestones = [];
  assert.equal(milestoneMessage(session), '');
});

test('Telegram messages are clamped below Telegram sendMessage limit', () => {
  const msg = clampTelegramMessage('x'.repeat(5000));
  assert.ok(msg.length <= 3900);
  assert.match(msg, /Report shortened/);
});
