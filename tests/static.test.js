const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../public/style.css'), 'utf8');

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

test('code practice surface includes editor affordances and non-wrapping input', () => {
  assert.match(html, /id="referenceLineNumbers"/);
  assert.match(html, /id="typingLineNumbers"/);
  assert.match(html, /id="caretStatus"/);
  assert.match(html, /id="editorMatchStatus"/);
  assert.match(html, /id="typingBox"[^>]*wrap="off"/s);
  assert.match(app, /addEventListener\("keydown", applyEditorTab\)/);
  assert.match(app, /core\.applyTabEdit/);
  assert.match(html, /id="typingOverlay"/);
  assert.match(html, /class="code-workspace single-workspace"/);
  assert.equal(/class="code-editor reference-editor"/.test(html), false);
  assert.match(css, /\.ghost-pending/);
  assert.match(css, /\.ghost-correct/);
  assert.match(css, /\.ghost-error/);
});


test('single editor supports a wide workspace and focus mode', () => {
  assert.match(html, /class="code-workspace single-workspace"/);
  assert.match(html, /id="typingOverlay"/);
  assert.match(html, /id="focusEditorBtn"/);
  assert.match(css, /\.single-workspace/);
  assert.match(css, /\.monkey-editor-body/);
  assert.match(css, /editor-focus-active/);
  assert.match(app, /toggleEditorFocus/);
});

test('mistake heatmap uses accessible severity colors and high-contrast text', () => {
  assert.match(app, /heat-\$\{severity\}/);
  assert.match(app, /ratio >= 0\.75 \? "critical"/);
  assert.match(css, /\.heat-key\.heat-high[^}]*color:\s*#ffffff/s);
  assert.match(css, /\.heat-key\.heat-critical[^}]*color:\s*#ffffff/s);
  assert.match(css, /\.heat-key\.heat-low[^}]*background:\s*#fff7ed/s);
});

test('app updates preserve the established browser progress storage namespace', () => {
  assert.match(app, /const PROGRESS_KEY = "aswinTypingProgressV3"/);
  assert.match(app, /const OLD_PROGRESS_KEY = "aswinTypingProgressV2"/);
  assert.equal(/localStorage\.clear\s*\(/.test(app), false);
});


test('single editor height adapts to laptop and mobile viewports', () => {
  assert.match(css, /height:\s*clamp\(330px, calc\(100vh - 430px\), 560px\)/);
  assert.match(css, /body\.editor-focus-active \.monkey-editor-body/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /height:\s*clamp\(300px, 52vh, 480px\)/);
});

test('Test Mode is visibly available and isolated in the client', () => {
  assert.match(html, /id="testMode"/);
  assert.match(html, /id="testModeBanner"/);
  assert.match(app, /TEST MODE · no data will be saved/);
  assert.match(app, /if \(session\.testMode\)/);
  assert.match(app, /if \(!testRun\)/);
  assert.match(css, /\.test-mode-banner/);
});

test('main dashboard exposes ranked and color-coded mistake analysis', () => {
  assert.match(html, /id="mistakeBarChart"/);
  assert.match(html, /id="mistakeHeatmapMain"/);
  assert.match(html, /id="mistakeHighlight"/);
  assert.match(html, /Mistake analysis/);
  assert.match(app, /renderMistakeBarChart/);
  assert.match(app, /renderHeatmapInto\("mistakeHeatmapMain"/);
  assert.match(css, /\.mistake-bar-fill\.severity-critical/);
  assert.match(css, /\.mistake-insight-grid/);
});

test('PostgreSQL persistence is configured for hosted deployments', () => {
  const storage = fs.readFileSync(path.join(__dirname, '../storage.js'), 'utf8');
  const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const envExample = fs.readFileSync(path.join(__dirname, '../.env.example'), 'utf8');
  assert.equal(pkg.dependencies.pg.startsWith('^8.'), true);
  assert.match(storage, /process\.env\.DATABASE_URL/);
  assert.match(storage, /CREATE TABLE IF NOT EXISTS typing_sessions/);
  assert.match(schema, /data JSONB NOT NULL/);
  assert.match(envExample, /DATABASE_URL=/);
  assert.match(serverForDatabaseTest(), /persistentStorage/);
});

function serverForDatabaseTest() {
  return fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
}
