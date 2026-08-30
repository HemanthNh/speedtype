const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function waitForServer(baseUrl) {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${baseUrl}/api/config`);
      if (r.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error('server did not start');
}

async function post(baseUrl, route, body) {
  const r = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  return { r, data };
}

test('server supports idempotent start, durable completion API and interruption upsert', async t => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'typing-monitor-'));
  const dataFile = path.join(tmp, 'sessions.json');
  const port = 18000 + Math.floor(Math.random() * 1000);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', DATA_FILE: dataFile, TELEGRAM_BOT_TOKEN: '', TELEGRAM_CHAT_ID: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => {
    child.kill('SIGTERM');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  await waitForServer(baseUrl);

  const config = await fetch(`${baseUrl}/api/config`).then(r => r.json());
  assert.equal(config.notificationConfigured, false);
  assert.equal(config.accuracyGate, 97);

  const id = 'test-session-1';
  const startBody = {
    id,
    trainee: 'Aswin',
    mode: 'Selenium',
    level: 2,
    exerciseId: 'SEL2-01',
    exerciseConcept: 'Use explicit waits.',
    targetAccuracy: 97,
    startedAt: new Date().toISOString()
  };
  const first = await post(baseUrl, '/api/session/start', startBody);
  assert.equal(first.r.status, 201);
  assert.equal(first.data.session.id, id);

  const duplicate = await post(baseUrl, '/api/session/start', startBody);
  assert.equal(duplicate.r.status, 200);
  assert.equal(duplicate.data.session.id, id);

  const completion = await post(baseUrl, '/api/session/complete', {
    ...startBody,
    completedAt: new Date().toISOString(),
    wpm: 42,
    accuracy: 98,
    errors: 2,
    durationSeconds: 300,
    charactersTyped: 1050,
    exerciseBlocksCompleted: 1,
    exerciseIdsCompleted: ['SEL2-01'],
    currentExerciseId: 'SEL2-02',
    mistakeBreakdown: { rightHand: 1, leftHand: 1, symbolExpected: 100, symbolErrors: 2, symbolAccuracy: 98, keyErrors: { '}': 2 } },
    telegramReport: {
      level: { mastered: 5, total: 6, percent: 83, complete: false },
      domain: { mastered: 17, total: 24, percent: 71, complete: false },
      core: { mastered: 52, total: 96, percent: 54 },
      overall: { mastered: 73, total: 144, percent: 51, completedLevels: 8, totalLevels: 24, repeatQueue: 2 },
      newlyMastered: ['SEL2-01'],
      newMilestones: ['First Mastery'],
      newlyCompletedLevels: [],
      newlyCompletedDomains: [],
      diagnostics: { topErrors: [{ key: '}', count: 2 }], symbolAccuracy: 98, rightHand: 1, leftHand: 1 },
      personalBest: { domainBestWpm: 42, overallBestWpm: 44 },
      domainMetrics: { sessions: 5, avgAccuracy: 98.1, bestAccuracy: 99.2, avgValidWpm: 39, bestValidWpm: 42 },
      trends: { accuracy: [97.5, 98], wpm: [38, 42] },
      daily: { minutes: 20, targetMinutes: 20, complete: true, streak: 3 },
      weekly: { minutes: 90, sessions: 6, mastered: 8 },
      weakArea: 'Focus on closing braces.',
      next: { title: 'Continue Selenium, Level 2', detail: 'Next SEL2-02' }
    }
  });
  assert.equal(completion.r.status, 200);
  assert.equal(completion.data.session.completionStatus, 'PASS');
  assert.equal(completion.data.session.passed, true);
  assert.equal(completion.data.session.score, 94);
  assert.equal(completion.data.session.telegramReport.overall.mastered, 73);
  assert.equal(completion.data.session.telegramReport.daily.complete, true);
  assert.deepEqual(completion.data.session.telegramReport.newMilestones, ['First Mastery']);

  const duplicateCompletion = await post(baseUrl, '/api/session/complete', {
    ...startBody,
    completedAt: completion.data.session.completedAt,
    wpm: 1,
    accuracy: 1,
    exerciseBlocksCompleted: 0
  });
  assert.equal(duplicateCompletion.data.session.completionStatus, 'PASS');
  assert.equal(duplicateCompletion.data.session.wpm, 42);

  const interrupt = await post(baseUrl, '/api/session/interrupt', {
    id: 'offline-session',
    trainee: 'Aswin',
    mode: 'JMeter',
    level: 1,
    exerciseId: 'JM1-01',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    wpm: 25,
    accuracy: 96,
    exerciseBlocksCompleted: 0,
    charactersTyped: 50,
    mistakeBreakdown: {}
  });
  assert.equal(interrupt.r.status, 200);
  assert.equal(interrupt.data.session.completionStatus, 'INTERRUPTED');

  const sync = await post(baseUrl, '/api/sessions/sync', {
    sessions: [{
      id: 'restored-session', trainee: 'Aswin', mode: 'Postman', level: 1, exerciseId: 'PM1-01',
      startedAt: new Date().toISOString(), completedAt: new Date().toISOString(), wpm: 30, accuracy: 97,
      exerciseBlocksCompleted: 1, exerciseIdsCompleted: ['PM1-01'], currentExerciseId: 'PM1-02', mistakeBreakdown: {}
    }]
  });
  assert.equal(sync.r.status, 200);
  assert.equal(sync.data.imported, 1);
  const syncDuplicate = await post(baseUrl, '/api/sessions/sync', { sessions: sync.data.sessions.filter(s => s.id === 'restored-session') });
  assert.equal(syncDuplicate.data.imported, 0);

  const sessions = await fetch(`${baseUrl}/api/sessions`).then(r => r.json());
  assert.equal(sessions.length, 3);
  assert.ok(sessions.some(s => s.id === id && s.completionStatus === 'PASS'));
  assert.ok(sessions.some(s => s.id === 'offline-session' && s.completionStatus === 'INTERRUPTED'));
  assert.ok(sessions.some(s => s.id === 'restored-session' && s.completionStatus === 'PASS'));

  const home = await fetch(`${baseUrl}/`);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /Overall learning progress/);

  const head = await fetch(`${baseUrl}/`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.match(head.headers.get('content-type') || '', /text\/html/);
});
