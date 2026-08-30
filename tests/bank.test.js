const test = require('node:test');
const assert = require('node:assert/strict');

global.window = {};
require('../public/exercise-bank.js');
const drills = global.window.TESTING_DRILLS;

function flatten() {
  const rows = [];
  for (const [mode, levels] of Object.entries(drills)) {
    for (const [level, exercises] of Object.entries(levels)) {
      for (const exercise of exercises) rows.push({ ...exercise, mode, level: Number(level) });
    }
  }
  return rows;
}

test('exercise bank has six modes, four levels each and 144 unique exercises', () => {
  const expectedModes = ['Python Automation', 'Selenium', 'JMeter', 'Postman', 'Mixed Testing', 'Right-Hand QA Focus'];
  assert.deepEqual(Object.keys(drills), expectedModes);
  for (const mode of expectedModes) {
    assert.deepEqual(Object.keys(drills[mode]).map(Number), [1, 2, 3, 4]);
    for (let level = 1; level <= 4; level++) assert.equal(drills[mode][level].length, 6);
  }
  const rows = flatten();
  assert.equal(rows.length, 144);
  assert.equal(new Set(rows.map(d => d.id)).size, 144);
});

test('every exercise contains meaningful testing content and a learning concept', () => {
  for (const exercise of flatten()) {
    assert.ok(exercise.id);
    assert.ok(exercise.concept && exercise.concept.length >= 20, `${exercise.id} concept too short`);
    assert.ok(exercise.text && exercise.text.length >= 50, `${exercise.id} content too short`);
    assert.equal(exercise.text.includes('queue[7] = "HIGH";'), false, `${exercise.id} contains old generic drill`);
  }
});
