
const RIGHT_HAND_KEYS = new Set("yuiophjklnmYUIOPHJKLNM[]{};:'\",./<>?7890-_=+");
const LEFT_HAND_KEYS = new Set("qwertasdfgzxcvbQWERTASDFGZXCVB123456!@#$%^");
const drills = {"Accuracy": {"1": ["Accuracy matters more than raw speed. Type every character carefully, maintain rhythm, and avoid unnecessary corrections.", "Keep a steady pace and let accuracy lead. Every clean keystroke saves correction time later.", "Precision first, speed second. Relax your hands, keep your eyes on the text, and avoid guessing the next key.", "Good typing feels controlled. Keep your shoulders relaxed, use light keystrokes, and return your fingers to the home position.", "Do not race the timer. A calm rhythm produces better accuracy and better long-term speed.", "Accuracy grows when each finger knows its job. Keep your hands balanced and avoid reaching with the wrong finger."], "2": ["Precise typing reduces rework. Slow down before difficult words, keep your eyes on the screen, and correct habits instead of chasing speed.", "Consistent typing requires control. Do not rush punctuation, capital letters, or words that use the right side of the keyboard.", "Accuracy under pressure is a trained skill. Keep your pace even and do not let the timer force careless keystrokes.", "Smooth typing comes from repetition. Focus on clean transitions between words rather than pushing for maximum speed.", "Pay attention to difficult letter combinations. Accuracy improves when you anticipate them instead of reacting after a mistake.", "Keep your hands relaxed during longer passages. Tension usually increases errors and reduces rhythm."], "3": ["Consistency under pressure is more valuable than occasional bursts of speed. Accuracy must remain stable even when the timer is running.", "Technical work rewards clean input. A single wrong letter, number, bracket, slash, or capital can break a command or invalidate test data.", "Typing faster is useful only when the error rate stays low. Smooth rhythm and correct finger movement matter more than bursts of speed.", "Professional typing is about reliability. Entering commands, filenames, variables, and defect notes correctly saves more time than raw speed.", "Use difficult punctuation as a checkpoint. Slow down slightly, strike the correct key, then resume your normal rhythm.", "Try to keep the same pace from the first sentence to the last. Stable speed with high accuracy is the objective."], "4": ["A disciplined typist makes fewer corrections, preserves concentration, and completes technical work faster because small mistakes do not interrupt the workflow.", "Reliable typing is part of technical execution. Commands, identifiers, selectors, variables, test data, and defect notes all depend on precise character entry.", "Strong accuracy means fewer context switches. The goal is to type complex technical text correctly on the first attempt while maintaining a stable pace.", "Competition work demands quick switching between prose, commands, numbers, symbols, and code without losing control or accuracy.", "High typing quality is invisible when everything works correctly. The real benefit is fewer broken commands, malformed payloads, and correction loops.", "Accuracy should remain high even when the content changes style. Adapt smoothly between sentences, technical notation, and structured data."]}, "Right Hand Focus": {"1": ["you join him in july", "look up my login", "jump high, move slowly", "yellow moon, pink hill", "join him, you know", "my login is unique", "keep moving, slowly", "only you know him", "jump, look, join, move", "yellow nylon pillow"], "2": ["minimum input, maximum output", "join login, open policy, update profile", "my login pin is unique", "keep moving, join only when ready", "you may join my policy group", "open your login profile now", "minimum delay, maximum output", "keep your input clean and simple", "join my queue only if needed", "you know my login policy"], "3": ["lookupPolicy(); updateLogin(); joinQueue();", "input_json = {\"priority\":\"HIGH\",\"owner\":\"employee02\"};", "https://localhost:8080/login?mode=quick", "minimumPool=10; maximumPool=90;", "policy[\"owner\"] = \"employee02\";", "loginQueue.push(input);", "output = input.join(\",\");", "updateProfile(loginId);", "joinQueue(policyId, loginId);", "lookupUser(loginId);"], "4": ["curl -X POST http://localhost:8080/api/login -H \"Content-Type: application/json\"", "pm.environment.set(\"loginId\", response.json().id);", "SELECT login_id, owner, priority FROM LoginQueue ORDER BY priority DESC;", "if (policy != null && loginId > 0) { updateProfile(loginId); }", "curl -H \"Authorization: Bearer ${token}\" http://localhost:8080/api/policy", "const policyId = response.json().policyId;", "for (let i = 0; i < input.length; i++) { output.push(input[i]); }", "SELECT owner_id, policy_id FROM UserPolicy WHERE login_id = 790;", "pm.expect(response.json().owner).to.eql(\"employee02\");", "if (loginId === null) { throw new Error('Missing loginId'); }"]}, "Right Hand Symbols": {"1": ["jkl; jkl; jkl;", "uiop[] uiop[]", "nm,./ nm,./", "7890 7890 7890", "jk[] jk[] jk[]", "op;/ op;/ op;/", "nm<> nm<> nm<>", "7890-= 7890-=", "jkl: jkl: jkl:", "uiop{} uiop{}"], "2": ["login[0] = \"john\";", "profile[\"priority\"] = \"HIGH\";", "http://localhost:8080/login", "input/output; join/poll;", "queue[7] = \"HIGH\";", "policy[\"id\"] = 790;", "loginId != null;", "output.push(input);", "url = \"http://localhost:8080\";", "status = \"OPEN\";"], "3": ["{\"login\":\"employee02\",\"pin\":\"7890\",\"priority\":\"HIGH\"}", "SELECT id, login, priority FROM LoginQueue;", "if (input != null) { output = input.join(\",\"); }", "https://localhost:8080/api/policy?id=790", "{\"owner\":\"employee02\",\"roles\":[\"USER\",\"AGENT\"]}", "for (let i = 0; i < 10; i++) { queue.push(i); }", "pm.expect(response.json().id).to.eql(790);", "headers[\"Content-Type\"] = \"application/json\";", "SELECT policy_id FROM UserPolicy WHERE login_id IN (7,8,9);", "console.log(\"loginId=\" + loginId);"], "4": ["pm.expect(response.json().priority).to.eql(\"HIGH\");", "curl -H \"Authorization: Bearer ${token}\" http://localhost:8080/api/policy", "for (int i = 0; i < 10; i++) { queue.push(input[i]); }", "SELECT login_id, policy_id FROM LoginPolicy WHERE owner_id IN (7,8,9,10);", "pm.expect(response.json().owner).to.eql(\"employee02\");", "curl -X GET \"http://localhost:8080/api/policy?id=790&mode=full\"", "if (input[i] != null) { output.push(input[i]); }", "const result = queue.filter(item => item.priority === \"HIGH\");", "headers[\"Authorization\"] = \"Bearer \" + token;", "SELECT id, owner FROM LoginQueue WHERE priority IN (\"HIGH\",\"MEDIUM\");"]}, "Technical Commands": {"1": ["jmeter -n -t test_plan.jmx -l results.jtl", "docker compose up -d", "node server.js", "git status", "git branch", "docker ps", "npm install", "python --version", "java -version", "git log --oneline"], "2": ["http://localhost:8080/api/tickets", "Authorization: Bearer ${access_token}", "Content-Type: application/json", "${ticketId}", "docker compose down", "git checkout main", "npm run test", "python -m pytest", "jmeter -v", "git diff --stat"], "3": ["SELECT id, title, status\nFROM Tickets\nWHERE assigned_to = 2\nORDER BY id DESC;", "git log --oneline --decorate -5", "docker stats --no-stream", "jmeter -n -t baseline.jmx -l baseline.jtl", "git checkout -b fix/login-policy", "npm run test -- --coverage", "python -m pytest tests/test_login.py -q", "docker compose logs --tail=50 api", "git show --stat HEAD", "curl http://localhost:8080/health"], "4": ["jmeter -n -t final_regression.jmx -l final_regression.jtl -e -o html_report", "docker compose down && docker compose up -d", "git checkout -b fix/login-policy && git status", "curl -X GET http://localhost:8080/api/tickets/1001 -H \"Authorization: Bearer ${token}\"", "python -m pytest tests/test_login.py::test_invalid_login -vv", "docker compose logs api --since=10m | findstr ERROR", "curl -X POST http://localhost:8080/api/login -H \"Content-Type: application/json\" -d \"{\\\"username\\\":\\\"employee02\\\"}\"", "git add . && git commit -m \"fix restricted assignment flow\"", "jmeter -n -t load_test.jmx -Jusers=40 -Jduration=120 -l final.jtl", "docker exec -it servicedesk-db psql -U postgres -d servicedesk"]}, "Code & JSON": {"1": ["{\"username\":\"employee02\",\"password\":\"Test@123\"}", "{\"status\":\"OPEN\",\"priority\":\"HIGH\"}", "{\"id\":101,\"owner\":\"employee02\"}", "{\"result\":true,\"message\":\"ok\"}", "{\"active\":false,\"count\":10}", "{\"role\":\"AGENT\",\"enabled\":true}", "{\"ticketId\":1001}", "{\"name\":\"Aswin\",\"score\":97}", "{\"type\":\"LOGIN\",\"status\":\"OK\"}", "{\"retry\":3,\"timeout\":5000}"], "2": ["{\n  \"title\": \"Unable to access payroll\",\n  \"priority\": \"HIGH\",\n  \"status\": \"OPEN\"\n}", "{\n  \"username\": \"employee02\",\n  \"roles\": [\"USER\", \"AGENT\"]\n}", "{\n  \"ticketId\": 1001,\n  \"ownerId\": 22,\n  \"active\": true\n}", "{\n  \"login\": \"employee02\",\n  \"locked\": false,\n  \"attempts\": 2\n}", "{\n  \"service\": \"api\",\n  \"port\": 8080,\n  \"healthy\": true\n}"], "3": ["const response = pm.response.json();\npm.expect(response.status).to.eql(\"OPEN\");\npm.environment.set(\"ticketId\", response.id);", "if (response.status === 403) {\n  console.log(\"Expected restricted access\");\n}", "const loginId = response.json().id;\npm.environment.set(\"loginId\", loginId);", "const body = pm.response.json();\npm.expect(body.owner).to.eql(\"employee02\");", "if (!response.id) {\n  throw new Error(\"Missing response id\");\n}"], "4": ["if (response.status === 403) {\n  console.log(\"Expected restricted access\");\n} else {\n  throw new Error(\"Unexpected status: \" + response.status);\n}", "const data = pm.response.json();\npm.expect(data.owner).to.eql(\"employee02\");\npm.expect(data.priority).to.eql(\"HIGH\");", "for (const item of response.json().items) {\n  console.log(item.id + \":\" + item.status);\n}", "const result = response.json();\nif (!result.ticketId) {\n  throw new Error(\"ticketId missing\");\n}", "pm.test(\"restricted assignment\", function () {\n  pm.expect(pm.response.code).to.eql(403);\n});"]}, "Mixed Technical": {"1": ["GET /api/login HTTP/1.1", "status=OPEN; priority=HIGH;", "owner_id=22; login_id=79;", "http://localhost:8080/health", "POST /api/tickets", "retry=3; timeout=5000;", "role=AGENT; enabled=true;", "ticket_id=1001;", "service=api; port=8080;", "GET /health"], "2": ["POST /api/tickets\nContent-Type: application/json", "SELECT id, owner FROM Tickets WHERE status='OPEN';", "pm.expect(pm.response.code).to.eql(200);", "docker compose ps", "git status --short", "SELECT id FROM Users WHERE active=1;", "Authorization: Bearer ${token}", "npm run test -- --runInBand", "python -m pytest -q", "docker logs servicedesk-api"], "3": ["Authorization: Bearer ${access_token}\nContent-Type: application/json\nX-Request-Id: 7901", "SELECT t.id, u.username\nFROM Tickets t\nJOIN Users u ON t.owner_id = u.id;", "git add . && git commit -m \"fix login policy\"", "curl -X GET http://localhost:8080/api/tickets/1001", "SELECT COUNT(*) FROM Tickets WHERE status='OPEN';", "pm.environment.set(\"ownerId\", response.id);", "docker compose exec api npm test", "git diff HEAD~1 HEAD -- server.js", "python -m pytest tests/test_api.py -vv", "jmeter -n -t smoke.jmx -l smoke.jtl"], "4": ["curl -X POST http://localhost:8080/api/tickets \\\n-H \"Content-Type: application/json\" \\\n-d \"{\\\"priority\\\":\\\"HIGH\\\",\\\"owner\\\":\\\"employee02\\\"}\"", "SELECT q.login_id, q.priority, p.policy_name\nFROM LoginQueue q\nJOIN Policy p ON q.policy_id = p.id\nORDER BY q.priority DESC;", "git checkout main && git pull && git checkout -b fix/queue-policy", "docker compose exec db psql -U postgres -d servicedesk -c \"SELECT COUNT(*) FROM Tickets;\"", "python -m pytest tests/test_tickets.py::test_restricted_assignment -vv", "jmeter -n -t final_regression.jmx -Jusers=25 -Jduration=180 -l results.jtl", "curl -s http://localhost:8080/api/health | python -m json.tool", "git log --oneline --graph --decorate --all -10"]}, "Speed": {"1": ["Build speed through rhythm, not force. Keep both hands relaxed and return to the home position after each difficult word.", "Fast typing should feel controlled. Keep the pace smooth and avoid sudden bursts followed by corrections.", "Maintain a comfortable rhythm. Speed should come from repetition, not from pressing harder.", "Keep your eyes on the screen and let your fingers find the keys without unnecessary hesitation."], "2": ["Fast typing is useful only when accuracy remains high. A clean forty words per minute can outperform sixty words per minute with frequent corrections.", "Increase speed gradually while keeping punctuation, capitalization, and right-hand letters accurate.", "Good typing speed is repeatable. The aim is to sustain the same clean pace for the entire exercise.", "Do not sacrifice accuracy to gain a few extra words per minute. Clean input is the better result."], "3": ["Maintain a steady pace across the entire exercise. Avoid rushing the first line and slowing down sharply at punctuation or numbers.", "Good speed comes from repeatable motion. Keep your rhythm stable when switching between letters, numbers, brackets, and punctuation.", "Practice transitions between ordinary words and technical notation without breaking your rhythm or changing hand position too much.", "Stable speed under varied content is more useful than a high score on easy text."], "4": ["Typing speed should support technical execution rather than compete with it. The objective is to enter commands, code, data, and reports correctly on the first attempt.", "A competition-ready typist can move between prose, commands, JSON, SQL, identifiers, URLs, and punctuation without losing accuracy.", "Fast and accurate typing reduces cognitive load because attention stays on the technical problem instead of on correcting input.", "The final goal is efficient technical execution, not a typing benchmark in isolation. Accuracy, rhythm, adaptability, and speed must work together."]}};
const typingTips = ["Reset your right hand to J K L ; whenever you feel it drifting.", "Use the right pinky deliberately for P, semicolon, slash, brackets, and Enter.", "Do not chase WPM when accuracy falls below 97%.", "Keep wrists relaxed and avoid pressing keys harder when the timer is running.", "Look at the screen, not the keyboard. Let your fingers learn the positions.", "Slow down slightly before punctuation and numbers, then return to normal rhythm.", "Use light keystrokes. Tension increases errors, especially on the weaker hand.", "Do not correct every mistake instantly if it breaks your rhythm. Focus on cleaner first input.", "Keep both hands involved. Avoid letting the right hand reach for keys assigned to the left.", "Practice difficult right-hand transitions such as U-I-O-P and J-K-L-; slowly before increasing speed.", "When typing code, treat brackets and punctuation as part of the word, not as an afterthought.", "Keep your elbows comfortable and shoulders relaxed during longer sessions.", "If a key repeatedly causes errors, deliberately slow down only around that key.", "Accuracy should stay stable from the first minute to the last, not only at the beginning.", "Use a steady rhythm for numbers and symbols instead of pausing before each one.", "Return to home row after reaching for numbers or punctuation.", "A clean 40 WPM session is better than 60 WPM with constant corrections.", "Read one or two words ahead so your fingers are not waiting for your eyes.", "Do not rush the first line. Establish a rhythm before increasing pace.", "Right-hand accuracy matters more than right-hand speed during corrective practice."];


const STORAGE_KEY = "aswinTypingMonitor.progress.v1";

function emptyProgress() {
  return {
    version: 1,
    sessions: [],
    wpmHistory: [],
    accuracyHistory: [],
    weakKeyStats: {},
    personalBests: { wpm: 0, accuracy: 0, score: 0 },
    streak: { current: 0, lastPracticeDate: null },
    totalPracticeSeconds: 0,
    updatedAt: null
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    const base = emptyProgress();
    return {
      ...base,
      ...parsed,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      wpmHistory: Array.isArray(parsed.wpmHistory) ? parsed.wpmHistory : [],
      accuracyHistory: Array.isArray(parsed.accuracyHistory) ? parsed.accuracyHistory : [],
      weakKeyStats: parsed.weakKeyStats && typeof parsed.weakKeyStats === "object" ? parsed.weakKeyStats : {},
      personalBests: { ...base.personalBests, ...(parsed.personalBests || {}) },
      streak: { ...base.streak, ...(parsed.streak || {}) }
    };
  } catch {
    return emptyProgress();
  }
}

function saveProgress(progress) {
  progress.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function localDayKey(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function previousLocalDayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDayKey(d);
}

function updateProgressWithSession(session) {
  const progress = loadProgress();
  progress.sessions.unshift(session);
  progress.sessions = progress.sessions.slice(0, 500);
  progress.wpmHistory.push({ at: session.completedAt, value: session.wpm });
  progress.accuracyHistory.push({ at: session.completedAt, value: session.accuracy });
  progress.wpmHistory = progress.wpmHistory.slice(-500);
  progress.accuracyHistory = progress.accuracyHistory.slice(-500);
  progress.totalPracticeSeconds += Number(session.durationSeconds) || 0;

  const keyErrors = session.mistakeBreakdown?.keyErrors || {};
  for (const [key, count] of Object.entries(keyErrors)) {
    progress.weakKeyStats[key] = (Number(progress.weakKeyStats[key]) || 0) + (Number(count) || 0);
  }

  progress.personalBests.wpm = Math.max(Number(progress.personalBests.wpm) || 0, Number(session.wpm) || 0);
  progress.personalBests.accuracy = Math.max(Number(progress.personalBests.accuracy) || 0, Number(session.accuracy) || 0);
  progress.personalBests.score = Math.max(Number(progress.personalBests.score) || 0, Number(session.score) || 0);

  const today = localDayKey(session.completedAt);
  const last = progress.streak.lastPracticeDate;
  if (last !== today) {
    if (last === previousLocalDayKey()) progress.streak.current = (Number(progress.streak.current) || 0) + 1;
    else progress.streak.current = 1;
    progress.streak.lastPracticeDate = today;
  }

  saveProgress(progress);
  return progress;
}

let active = null;
let timer = null;
let startedAt = null;
let duration = 600;
let targetAccuracy = 97;
let pasteAttempts = 0;
let lastDrillKey = null;

const $ = id => document.getElementById(id);
const mode = $("mode");
const level = $("level");
const durationSel = $("duration");
const startBtn = $("startBtn");
const finishBtn = $("finishBtn");
const resetBtn = $("resetBtn");
const box = $("typingBox");
const promptEl = $("prompt");
const timeEl = $("time");
const wpmEl = $("wpm");
const accEl = $("accuracy");
const errEl = $("errors");
const liveScoreEl = $("liveScore");

function chooseDrill() {
  const arr = drills[mode.value][Number(level.value)];
  let idx = Math.floor(Math.random() * arr.length);
  const key = `${mode.value}-${level.value}-${idx}`;
  if (arr.length > 1 && key === lastDrillKey) idx = (idx + 1) % arr.length;
  lastDrillKey = `${mode.value}-${level.value}-${idx}`;
  return arr[idx];
}

function showRandomTip() {
  const idx = Math.floor(Math.random() * typingTips.length);
  $("typingTip").textContent = typingTips[idx];
}

function handOfExpectedChar(ch) {
  if (RIGHT_HAND_KEYS.has(ch)) return "right";
  if (LEFT_HAND_KEYS.has(ch)) return "left";
  return "neutral";
}

function classifyMistakes(target, typed) {
  const breakdown = {
    letters:0, numbers:0, spaces:0, punctuation:0, case:0, extra:0,
    rightHand:0, leftHand:0, neutral:0, keyErrors:{}
  };
  let errors = 0;
  for (let i = 0; i < typed.length; i++) {
    const a = target[i];
    const b = typed[i];
    if (a === b) continue;
    errors++;
    const keyName = a === undefined ? "[extra]" : a === " " ? "[space]" : a === "\n" ? "[enter]" : a;
    breakdown.keyErrors[keyName] = (breakdown.keyErrors[keyName] || 0) + 1;
    if (a === undefined) {
      breakdown.extra++;
      breakdown.neutral++;
      continue;
    }
    const hand = handOfExpectedChar(a);
    if (hand === "right") breakdown.rightHand++;
    else if (hand === "left") breakdown.leftHand++;
    else breakdown.neutral++;

    if (a && b && a.toLowerCase() === b.toLowerCase() && a !== b) {
      breakdown.case++;
      continue;
    }
    if (/\d/.test(a)) breakdown.numbers++;
    else if (/\s/.test(a)) breakdown.spaces++;
    else if (/[A-Za-z]/.test(a)) breakdown.letters++;
    else breakdown.punctuation++;
  }
  return { errors, breakdown };
}

function compute() {
  const target = promptEl.textContent;
  const typed = box.value;
  const { errors, breakdown } = classifyMistakes(target, typed);
  const accuracy = typed.length ? Math.max(0, ((typed.length - errors) / typed.length) * 100) : 100;
  const mins = startedAt ? Math.max((Date.now() - startedAt) / 60000, 1/60) : 1;
  const words = typed.trim() ? typed.trim().split(/\s+/).length : 0;
  const wpm = Math.round(words / mins);
  const accuracyPoints = Math.min(70, accuracy * .70);
  const speedPoints = accuracy >= 95 ? Math.min(30, wpm * .60) : 0;
  const liveScore = Math.round(accuracyPoints + speedPoints);

  wpmEl.textContent = wpm;
  accEl.textContent = accuracy.toFixed(1) + "%";
  errEl.textContent = errors;
  liveScoreEl.textContent = liveScore;
  accEl.className = accuracy >= targetAccuracy ? "good" : (accuracy >= 95 ? "warn" : "bad");

  const regular = [
    ["letters", breakdown.letters],
    ["numbers", breakdown.numbers],
    ["punctuation", breakdown.punctuation],
    ["spaces", breakdown.spaces],
    ["case", breakdown.case]
  ].filter(([,v]) => v > 0).map(([k,v]) => `${k}: ${v}`);

  const handText = `Right-hand errors: ${breakdown.rightHand} | Left-hand errors: ${breakdown.leftHand}`;
  $("mistakeSummary").textContent = (regular.length ? regular.join(" | ") + " | " : "") + handText;
  $("charProgress").textContent = `${typed.length} / ${target.length} characters`;

  const totalHandErrors = breakdown.rightHand + breakdown.leftHand;
  if (totalHandErrors > 0) {
    const rightPct = Math.round((breakdown.rightHand / totalHandErrors) * 100);
    $("handFocus").textContent = `Right-hand share of hand-classified errors: ${rightPct}%`;
    $("handFocus").className = rightPct >= 60 ? "hand-focus bad" : "hand-focus";
  } else {
    $("handFocus").textContent = "No hand-classified errors yet.";
    $("handFocus").className = "hand-focus good";
  }

  return {
    wpm,
    accuracy: Number(accuracy.toFixed(1)),
    errors,
    mistakeBreakdown: { ...breakdown, pasteAttempts },
    liveScore
  };
}

function setTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  timeEl.textContent = `${m}:${String(s).padStart(2,"0")}`;
}

async function refreshConfig() {
  try {
    const r = await fetch("/api/config");
    const c = await r.json();
    targetAccuracy = c.accuracyGate || 97;
    $("ruleBox").textContent = `Pass condition: ${targetAccuracy}% accuracy or higher. Paste is blocked. Speed does not compensate for poor accuracy.`;
    $("notifyStatus").textContent = c.notificationConfigured ? "Telegram configured" : "Telegram not configured";
  } catch {
    $("notifyStatus").textContent = "Server unavailable";
  }
}

function computeAchievements(completed) {
  const earned = new Set();
  if (completed.some(s => Number(s.accuracy) >= 98)) earned.add("Clean Run");

  let consecutive = 0;
  for (const s of completed) {
    if (s.passed) consecutive++;
    else consecutive = 0;
    if (consecutive >= 3) earned.add("Precision 3");
  }

  if (completed.some(s => {
    const rh = Number(s.mistakeBreakdown?.rightHand || 0);
    const lh = Number(s.mistakeBreakdown?.leftHand || 0);
    const total = rh + lh;
    return total > 0 && (rh / total) <= 0.20;
  })) earned.add("Right Hand Recovery");

  if (completed.some(s => s.passed && Number(s.level) === 4 && ["Technical Commands","Mixed Technical","Code & JSON"].includes(s.mode))) earned.add("Technical Clean Run");
  if (completed.some(s => Number(s.wpm) >= 40 && Number(s.accuracy) >= 97)) earned.add("40 Club");
  if (completed.some(s => Number(s.mistakeBreakdown?.pasteAttempts || 0) === 0)) earned.add("Zero Paste");
  return [...earned];
}

function refreshSummary() {
  const progress = loadProgress();
  const completed = progress.sessions.filter(s => s.completedAt);
  const today = localDayKey();
  const todaySessions = completed.filter(s => localDayKey(s.completedAt || s.startedAt) === today);
  const todaySeconds = todaySessions.reduce((sum, s) => sum + (Number(s.durationSeconds) || 0), 0);
  const avgAccuracy = completed.length
    ? completed.reduce((sum, s) => sum + (Number(s.accuracy) || 0), 0) / completed.length
    : 0;

  $("todayMinutes").textContent = `${Math.round(todaySeconds / 60)} min`;
  $("avgAccuracy").textContent = `${avgAccuracy.toFixed(1)}%`;
  $("bestWpm").textContent = Number(progress.personalBests.wpm) || 0;
  $("streak").textContent = `${Number(progress.streak.current) || 0} day${Number(progress.streak.current) === 1 ? "" : "s"}`;
}

function refreshHistory() {
  const progress = loadProgress();
  const completed = progress.sessions.filter(s => s.completedAt);
  if (!completed.length) {
    $("history").textContent = "No completed sessions yet.";
    $("achievements").textContent = "Complete sessions to unlock achievements.";
    return;
  }

  const achievements = computeAchievements(completed.slice().reverse());
  $("achievements").innerHTML = achievements.length
    ? achievements.map(a => `<span class="achievement">${a}</span>`).join("")
    : "No achievements unlocked yet.";

  $("history").innerHTML = `<table>
    <thead><tr><th>Date</th><th>Mode</th><th>Level</th><th>Result</th><th>WPM</th><th>Accuracy</th><th>Errors</th><th>RH errors</th><th>Paste</th><th>Score</th></tr></thead>
    <tbody>${completed.slice(0,20).map(s => `<tr>
      <td>${new Date(s.startedAt).toLocaleString()}</td>
      <td>${s.mode}</td>
      <td>${s.level || "-"}</td>
      <td><span class="badge ${s.passed ? "pass" : "fail"}">${s.passed ? "PASS" : "REPEAT"}</span></td>
      <td>${s.wpm ?? "-"}</td>
      <td>${s.accuracy == null ? "-" : s.accuracy + "%"}</td>
      <td>${s.errors ?? "-"}</td>
      <td>${s.mistakeBreakdown?.rightHand ?? "-"}</td>
      <td>${s.mistakeBreakdown?.pasteAttempts ?? 0}</td>
      <td>${s.score ?? "-"}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}
async function startSession() {
  duration = Number(durationSel.value);
  promptEl.textContent = chooseDrill();
  showRandomTip();
  box.value = "";
  pasteAttempts = 0;
  startedAt = Date.now();
  setTime(duration);
  startBtn.disabled = true;
  finishBtn.disabled = false;
  box.disabled = false;
  box.focus();
  $("pasteStatus").textContent = "Paste blocked: 0 attempts";

  active = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    trainee: "Aswin",
    mode: mode.value,
    level: Number(level.value),
    targetAccuracy,
    startedAt: new Date().toISOString()
  };

  fetch("/api/session/start", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(active)
  }).catch(() => {});

  clearInterval(timer);
  timer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const left = Math.max(0, duration - elapsed);
    setTime(left);
    compute();
    if (left <= 0) finishSession();
  }, 1000);
}

async function finishSession() {
  if (!active) return;
  clearInterval(timer);
  const stats = compute();
  const durationSeconds = Math.floor((Date.now() - startedAt) / 1000);
  finishBtn.disabled = true;
  box.disabled = true;
  startBtn.disabled = false;

  const accuracyPoints = Math.min(70, stats.accuracy * 0.70);
  const speedPoints = stats.accuracy >= 95 ? Math.min(30, stats.wpm * 0.60) : 0;
  const session = {
    ...active,
    ...stats,
    durationSeconds,
    completedAt: new Date().toISOString(),
    passed: stats.accuracy >= active.targetAccuracy,
    score: Math.round(accuracyPoints + speedPoints)
  };

  updateProgressWithSession(session);

  $("ruleBox").textContent = session.passed
    ? `PASS: ${session.accuracy}% accuracy, score ${session.score}/100.`
    : `REPEAT REQUIRED: ${session.accuracy}% accuracy is below the ${session.targetAccuracy}% gate.`;
  $("ruleBox").className = "rule " + (session.passed ? "good" : "bad");
  showRandomTip();

  fetch("/api/session/complete", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(session)
  }).catch(() => {});

  active = null;
  refreshHistory();
  refreshSummary();
}
function reset() {
  clearInterval(timer);
  active = null;
  startedAt = null;
  box.value = "";
  pasteAttempts = 0;
  box.disabled = true;
  startBtn.disabled = false;
  finishBtn.disabled = true;
  promptEl.textContent = "Press Start Practice to begin.";
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  accEl.className = "";
  errEl.textContent = "0";
  liveScoreEl.textContent = "70";
  $("mistakeSummary").textContent = "No mistakes yet.";
  $("charProgress").textContent = "0 / 0 characters";
  $("handFocus").textContent = "Right-hand focus analytics will appear here.";
  $("handFocus").className = "hand-focus";
  $("pasteStatus").textContent = "Paste blocked: 0 attempts";
  $("ruleBox").className = "rule";
  $("ruleBox").textContent = `Pass condition: ${targetAccuracy}% accuracy or higher. Paste is blocked.`;
  setTime(Number(durationSel.value));
  showRandomTip();
}

async function testNotification() {
  const btn = $("testNotifyBtn");
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Testing...";
  try {
    const r = await fetch("/api/test-notification", { method:"POST" });
    $("notifyStatus").textContent = r.ok ? "Telegram working" : "Telegram test failed";
  } catch {
    $("notifyStatus").textContent = "Telegram test failed";
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

box.addEventListener("paste", e => {
  e.preventDefault();
  pasteAttempts++;
  $("pasteStatus").textContent = `Paste blocked: ${pasteAttempts} attempt${pasteAttempts === 1 ? "" : "s"}`;
});
box.addEventListener("drop", e => {
  e.preventDefault();
  pasteAttempts++;
  $("pasteStatus").textContent = `Drop/paste blocked: ${pasteAttempts} attempt${pasteAttempts === 1 ? "" : "s"}`;
});
box.addEventListener("beforeinput", e => {
  if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop") e.preventDefault();
});

box.addEventListener("input", compute);
startBtn.addEventListener("click", startSession);
finishBtn.addEventListener("click", finishSession);
resetBtn.addEventListener("click", reset);
$("testNotifyBtn").addEventListener("click", testNotification);
durationSel.addEventListener("change", () => { if (!active) setTime(Number(durationSel.value)); });

setTime(Number(durationSel.value));
showRandomTip();
refreshConfig();
refreshSummary();
refreshHistory();
