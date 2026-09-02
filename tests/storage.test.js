const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createSessionStore } = require('../storage');

test('session storage fallback is idempotent and keeps complete session objects', async t => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'typing-store-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  const store = createSessionStore({ databaseUrl: '', dataFile: path.join(tmp, 'sessions.json') });
  assert.equal(store.mode, 'file');
  assert.equal(store.persistent, false);

  const session = {
    id: 'one', trainee: 'Aswin', mode: 'JMeter', level: 2,
    exerciseId: 'JM2-01', startedAt: '2026-08-30T10:00:00.000Z',
    completedAt: null, completionStatus: 'IN_PROGRESS'
  };
  const first = await store.createSession(session);
  const second = await store.createSession({ ...session, mode: 'Selenium' });
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(second.session.mode, 'JMeter');

  const complete = { ...session, completedAt: '2026-08-30T10:10:00.000Z', completionStatus: 'PASS', wpm: 40, accuracy: 98 };
  await store.upsertSession(complete);
  assert.equal((await store.getSession('one')).completionStatus, 'PASS');

  const imported = await store.importSessions([
    complete,
    { ...complete, id: 'two', mode: 'Postman' }
  ]);
  assert.equal(imported, 1);
  const rows = await store.listSessions();
  assert.equal(rows.length, 2);
  assert.ok(rows.some(row => row.id === 'two' && row.mode === 'Postman'));
});
