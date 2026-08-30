const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const core = require('../public/core.js');

class FakeClassList {
  constructor(el) { this.el = el; this.set = new Set(); }
  add(...names) { names.forEach(n => this.set.add(n)); this.el.className = [...this.set].join(' '); }
  remove(...names) { names.forEach(n => this.set.delete(n)); this.el.className = [...this.set].join(' '); }
  contains(name) { return this.set.has(name); }
  toggle(name, force) {
    const shouldAdd = typeof force === 'boolean' ? force : !this.set.has(name);
    if (shouldAdd) this.set.add(name); else this.set.delete(name);
    this.el.className = [...this.set].join(' ');
    return shouldAdd;
  }
}

class FakeElement {
  constructor(tagName = 'div', id = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.textContent = '';
    this._innerHTML = '';
    this.children = [];
    this._value = '';
    this.disabled = false;
    this.checked = false;
    this.className = '';
    this.classList = new FakeClassList(this);
    this.style = {};
    this.dataset = {};
    this.listeners = {};
  }
  set innerHTML(value) { this._innerHTML = String(value); if (value === '') this.children = []; }
  get innerHTML() { return this._innerHTML; }
  set value(value) { this._value = String(value); }
  get value() { return this._value || this.children[0]?.value || ''; }
  get options() { return this.children; }
  appendChild(child) { this.children.push(child); if (!this._value) this._value = child.value; return child; }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatchEvent(event) {
    event ||= {};
    event.type ||= '';
    event.preventDefault ||= () => { event.defaultPrevented = true; };
    for (const fn of this.listeners[event.type] || []) fn.call(this, event);
    return !event.defaultPrevented;
  }
  click() { return this.dispatchEvent({ type: 'click' }); }
  focus() {}
}

function makeLocalStorage(shared) {
  return {
    getItem: key => shared.has(key) ? shared.get(key) : null,
    setItem: (key, value) => shared.set(key, String(value)),
    removeItem: key => shared.delete(key),
    clear: () => shared.clear()
  };
}

function makeAppContext(sharedStorage = new Map(), options = {}) {
  const html = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
  const bankJs = fs.readFileSync(path.join(__dirname, '../public/exercise-bank.js'), 'utf8');
  const elements = new Map();
  for (const match of html.matchAll(/<([a-zA-Z0-9]+)[^>]*\sid="([^"]+)"/g)) elements.set(match[2], new FakeElement(match[1], match[2]));

  const document = {
    body: new FakeElement('body', 'body'),
    getElementById(id) { return elements.get(id) || null; },
    createElement(tag) { return new FakeElement(tag); }
  };

  const serverSessions = [];
  let startResolver = null;
  const fetchImpl = async (url, opts = {}) => {
    const route = String(url);
    const body = opts.body ? JSON.parse(opts.body) : {};
    const response = data => ({ ok: true, status: 200, async json() { return data; } });
    if (route === '/api/config') return response({ notificationConfigured: false, accuracyGate: 97, dailyTargetMinutes: 20 });
    if (route === '/api/sessions') return response(serverSessions);
    if (route === '/api/test-notification') return { ok: false, status: 503, async json() { return { ok: false }; } };
    if (route === '/api/sessions/sync') {
      for (const item of body.sessions || []) {
        if (!serverSessions.some(s => s.id === item.id)) serverSessions.push({ ...item, syncStatus: 'server' });
      }
      return response({ imported: (body.sessions || []).length, sessions: serverSessions });
    }
    if (route === '/api/session/start') {
      if (options.delayStart) {
        return new Promise(resolve => { startResolver = () => resolve(response({ session: { ...body, syncStatus: 'server' } })); });
      }
      serverSessions.push({ ...body });
      return response({ session: { ...body, syncStatus: 'server' } });
    }
    if (route === '/api/session/complete') {
      const session = {
        ...body,
        passed: Number(body.accuracy) >= Number(body.targetAccuracy || 97) && Number(body.exerciseBlocksCompleted || 0) > 0,
        completionStatus: Number(body.accuracy) >= Number(body.targetAccuracy || 97) && Number(body.exerciseBlocksCompleted || 0) > 0 ? 'PASS' : Number(body.exerciseBlocksCompleted || 0) > 0 ? 'REPEAT' : 'INCOMPLETE',
        syncStatus: 'server'
      };
      const i = serverSessions.findIndex(s => s.id === session.id);
      if (i >= 0) serverSessions[i] = session; else serverSessions.push(session);
      return response({ session });
    }
    if (route === '/api/session/interrupt') {
      const session = { ...body, passed: false, completionStatus: 'INTERRUPTED', syncStatus: 'server' };
      const i = serverSessions.findIndex(s => s.id === session.id);
      if (i >= 0) serverSessions[i] = session; else serverSessions.push(session);
      return response({ session });
    }
    throw new Error(`Unexpected fetch ${route}`);
  };

  const windowListeners = {};
  const window = {
    TESTING_DRILLS: undefined,
    TESTING_TIPS: undefined,
    TYPING_CORE: core,
    crypto: { randomUUID: () => crypto.randomUUID() },
    addEventListener(type, fn) { (windowListeners[type] ||= []).push(fn); }
  };
  const navigator = { sendBeacon: () => true };

  const context = vm.createContext({
    window,
    document,
    localStorage: makeLocalStorage(sharedStorage),
    navigator,
    Blob,
    AbortController,
    crypto: window.crypto,
    fetch: fetchImpl,
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    Set,
    Map,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  });
  window.window = window;
  window.document = document;
  window.localStorage = context.localStorage;
  window.navigator = navigator;

  vm.runInContext(bankJs, context, { filename: 'exercise-bank.js' });
  vm.runInContext(appJs, context, { filename: 'app.js' });
  return { context, elements, sharedStorage, serverSessions, resolveStart: () => startResolver?.() };
}

async function settle() { await new Promise(r => setTimeout(r, 20)); }

test('browser workflow masters a block, updates dropdown progress, and survives reload from localStorage', async () => {
  const shared = new Map();
  const first = makeAppContext(shared);
  await settle();
  assert.equal(String(first.elements.get('overallMastered').textContent), '0');
  assert.match(first.elements.get('mode').options[0].textContent, /NOT STARTED/);

  await vm.runInContext('startSession()', first.context);
  const exerciseId = vm.runInContext('activeExercise.id', first.context);
  vm.runInContext('box.value = promptEl.textContent; box.dispatchEvent({type:"input"});', first.context);
  assert.equal(vm.runInContext('completedExerciseBlocks', first.context), 1);
  await vm.runInContext('finishSession("manual")', first.context);
  await settle();

  assert.equal(String(first.elements.get('overallMastered').textContent), '1');
  assert.match(first.elements.get('mode').options[0].textContent, /IN PROGRESS 1\/24/);
  assert.match(first.elements.get('level').options[0].textContent, /1\/6/);
  assert.equal(vm.runInContext(`progressState.exercises[${JSON.stringify(exerciseId)}].status`, first.context), 'mastered');
  assert.match(first.elements.get('history').innerHTML, /PASS/);

  const completedRow = first.serverSessions.find(s => s.id && s.completedAt);
  assert.ok(completedRow?.telegramStartContext, 'session start should carry Telegram progress context');
  assert.equal(completedRow.telegramStartContext.overall.total, 144);
  assert.equal(completedRow.telegramStartContext.core.total, 96);
  assert.ok(completedRow?.telegramReport, 'completion should carry a detailed Telegram report');
  assert.equal(completedRow.telegramReport.overall.mastered, 1);
  assert.equal(completedRow.telegramReport.core.mastered, 1);
  assert.deepEqual(Array.from(completedRow.telegramReport.newlyMastered), [exerciseId]);
  assert.ok(Array.from(completedRow.telegramReport.newMilestones).includes('First Mastery'));
  assert.ok(completedRow.telegramReport.next?.title);
  assert.equal(typeof completedRow.telegramReport.diagnostics.symbolAccuracy, 'number');

  const second = makeAppContext(shared);
  await settle();
  assert.equal(String(second.elements.get('overallMastered').textContent), '1');
  assert.match(second.elements.get('mode').options[0].textContent, /IN PROGRESS 1\/24/);
  assert.equal(second.serverSessions.length, 1, 'local history should rehydrate an empty server session file');
});

test('completed levels are excluded from normal practice but available in Revision Mode', async () => {
  const app = makeAppContext(new Map());
  await settle();
  const ids = vm.runInContext('allDrillsFor("Python Automation", 1).map(d => d.id)', app.context);
  vm.runInContext(`for (const id of ${JSON.stringify(ids)}) { const d=getDrillById(id); progressState.exercises[id]={id,mode:d.mode,level:d.level,concept:d.concept,status:"mastered",attempts:1,bestScore:100,bestAccuracy:100,bestWpm:40,history:[]}; } saveProgressState(); renderProgressUI();`, app.context);
  assert.match(app.elements.get('level').options[0].textContent, /COMPLETE/);
  await vm.runInContext('startSession()', app.context);
  assert.equal(vm.runInContext('active', app.context), null);
  assert.match(app.elements.get('ruleBox').textContent, /already complete/);
  vm.runInContext('revisionMode.checked = true', app.context);
  await vm.runInContext('startSession()', app.context);
  assert.equal(vm.runInContext('Boolean(active)', app.context), true);
  vm.runInContext('reset()', app.context);
});

test('corrupted progress storage falls back safely instead of crashing initialization', async () => {
  const shared = new Map([['aswinTypingProgressV3', '{not-valid-json']]);
  const app = makeAppContext(shared);
  await settle();
  assert.equal(String(app.elements.get('overallMastered').textContent), '0');
  assert.ok([...shared.keys()].some(k => k.startsWith('aswinTypingProgressV3_corrupt_')));
});

test('reset during delayed server start records interruption without reviving the old active session', async () => {
  const app = makeAppContext(new Map(), { delayStart: true });
  await settle();
  const startPromise = vm.runInContext('startSession()', app.context);
  await settle();
  assert.equal(vm.runInContext('Boolean(active)', app.context), true);
  vm.runInContext('reset()', app.context);
  assert.equal(vm.runInContext('active', app.context), null);
  assert.match(app.elements.get('ruleBox').textContent, /INTERRUPTED/);
  app.resolveStart();
  await startPromise;
  await settle();
  assert.equal(vm.runInContext('active', app.context), null);
});

test('Tab stays inside the typing editor and inserts coding indentation', async () => {
  const app = makeAppContext(new Map());
  await settle();
  await vm.runInContext('startSession()', app.context);
  const box = app.elements.get('typingBox');
  box.value = '';
  box.selectionStart = 0;
  box.selectionEnd = 0;
  const keptFocus = box.dispatchEvent({ type: 'keydown', key: 'Tab', shiftKey: false });
  assert.equal(keptFocus, false, 'Tab should be prevented from moving focus away');
  assert.equal(box.value, '    ');
  assert.equal(box.selectionStart, 4);
  assert.match(app.elements.get('caretStatus').textContent, /Ln 1, Col 5/);

  box.dispatchEvent({ type: 'keydown', key: 'Tab', shiftKey: true });
  assert.equal(box.value, '');
  assert.equal(box.selectionStart, 0);
  vm.runInContext('reset()', app.context);
});


test('editor layout preference cycles and focus mode can be entered and exited', async () => {
  const app = makeAppContext(new Map());
  await settle();
  const practice = app.elements.get('practiceCard');
  const layout = app.elements.get('layoutBtn');
  assert.equal(layout.textContent, 'Layout: Auto');

  layout.click();
  assert.equal(layout.textContent, 'Layout: Stacked');
  assert.equal(practice.classList.contains('layout-stacked'), true);

  layout.click();
  assert.equal(layout.textContent, 'Layout: Side by side');
  assert.equal(practice.classList.contains('layout-side'), true);

  layout.click();
  assert.equal(layout.textContent, 'Layout: Auto');
  assert.equal(practice.classList.contains('layout-stacked'), false);
  assert.equal(practice.classList.contains('layout-side'), false);

  app.elements.get('focusEditorBtn').click();
  assert.equal(app.context.document.body.classList.contains('editor-focus-active'), true);
  vm.runInContext('toggleEditorFocus(false)', app.context);
  assert.equal(app.context.document.body.classList.contains('editor-focus-active'), false);
});


test('typing does not pull a manually positioned reference pane back to the top', async () => {
  const app = makeAppContext(new Map());
  await settle();
  await vm.runInContext('startSession()', app.context);

  const box = app.elements.get('typingBox');
  const reference = app.elements.get('prompt');
  reference.scrollTop = 140;
  reference.scrollLeft = 32;
  box.scrollTop = 0;
  box.scrollLeft = 0;

  box.value = 'x';
  box.selectionStart = 1;
  box.selectionEnd = 1;
  box.dispatchEvent({ type: 'input' });

  assert.equal(reference.scrollTop, 140, 'ordinary typing must preserve reference vertical scroll');
  assert.equal(reference.scrollLeft, 32, 'ordinary typing must preserve reference horizontal scroll');

  box.scrollTop = 88;
  box.scrollLeft = 16;
  box.dispatchEvent({ type: 'scroll' });
  assert.equal(reference.scrollTop, 88, 'actual typing-pane scrolling should still synchronize vertically');
  assert.equal(reference.scrollLeft, 16, 'actual typing-pane scrolling should still synchronize horizontally');

  vm.runInContext('reset()', app.context);
});
