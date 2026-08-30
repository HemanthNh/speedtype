const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');

test('HTML ids are unique', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('every literal DOM id referenced by app.js exists in index.html', () => {
  const referenced = [...app.matchAll(/\$\("([A-Za-z0-9_-]+)"\)/g)].map(m => m[1]);
  const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
  const missing = [...new Set(referenced)].filter(id => !htmlIds.has(id));
  assert.deepEqual(missing, []);
});

test('Render-critical scripts are loaded in correct order', () => {
  const bankIndex = html.indexOf('exercise-bank.js');
  const coreIndex = html.indexOf('core.js');
  const appIndex = html.indexOf('app.js');
  assert.ok(bankIndex > 0 && coreIndex > bankIndex && appIndex > coreIndex);
});


test('deployment files contain no hardcoded Telegram credentials and use Render-safe commands', () => {
  const server = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const envExample = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  assert.match(server, /process\.env\.TELEGRAM_BOT_TOKEN/);
  assert.match(server, /process\.env\.TELEGRAM_CHAT_ID/);
  assert.equal(/bot\d{6,}:[A-Za-z0-9_-]{20,}/.test(server), false);
  assert.equal(pkg.scripts.start, 'node server.js');
  assert.equal(pkg.main, 'server.js');
  assert.match(pkg.engines.node, />=18/);
  assert.match(envExample, /TELEGRAM_BOT_TOKEN=/);
  assert.match(envExample, /TELEGRAM_CHAT_ID=/);
});
