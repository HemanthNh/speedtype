const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../public/core.js');

test('WPM uses the standard five-character formula', () => {
  const typed = 'a'.repeat(300);
  const stats = core.calculateTypingStats(typed, typed, 60_000, 97, 0);
  assert.equal(stats.wpm, 60);
  assert.equal(stats.accuracy, 100);
  assert.equal(stats.errors, 0);
});

test('mistake classification records keys, hand errors and symbol accuracy', () => {
  const stats = core.calculateTypingStats('assert x == 10;', 'assert x =- 10;', 60_000, 97, 0);
  assert.ok(stats.errors >= 1);
  assert.ok(Object.keys(stats.mistakeBreakdown.keyErrors).length >= 1);
  assert.ok(stats.mistakeBreakdown.symbolExpected > 0);
  assert.ok(stats.mistakeBreakdown.symbolAccuracy < 100);
});

test('best WPM ignores accuracy-invalid runs', () => {
  const sessions = [
    { completedAt: '2026-08-30T00:00:00Z', accuracy: 80, targetAccuracy: 97, exerciseBlocksCompleted: 1, wpm: 90 },
    { completedAt: '2026-08-30T00:10:00Z', accuracy: 98, targetAccuracy: 97, exerciseBlocksCompleted: 1, wpm: 42 },
    { completedAt: '2026-08-30T00:20:00Z', accuracy: 100, targetAccuracy: 97, exerciseBlocksCompleted: 0, wpm: 70 }
  ];
  assert.equal(core.validBestWpm(sessions, 97), 42);
});

test('progress summary separates core progress from overall progress', () => {
  const drills = {
    'Python Automation': { 1: [{ id: 'P1' }], 2: [], 3: [], 4: [] },
    Selenium: { 1: [{ id: 'S1' }], 2: [], 3: [], 4: [] },
    JMeter: { 1: [{ id: 'J1' }], 2: [], 3: [], 4: [] },
    Postman: { 1: [{ id: 'PM1' }], 2: [], 3: [], 4: [] },
    'Mixed Testing': { 1: [{ id: 'M1' }], 2: [], 3: [], 4: [] },
    'Right-Hand QA Focus': { 1: [{ id: 'R1' }], 2: [], 3: [], 4: [] }
  };
  const state = { P1: { status: 'mastered' }, M1: { status: 'mastered' }, R1: { status: 'repeat' } };
  const summary = core.progressSummary(drills, state);
  assert.equal(summary.overallMastered, 2);
  assert.equal(summary.overallTotal, 6);
  assert.equal(summary.coreMastered, 1);
  assert.equal(summary.coreTotal, 4);
  assert.equal(summary.repeatQueue.length, 1);
});
