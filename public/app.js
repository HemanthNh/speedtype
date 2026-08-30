const RIGHT_HAND_KEYS = new Set("yuiophjklnmYUIOPHJKLNM[]{};:'\",./<>?7890-_=+");
const LEFT_HAND_KEYS = new Set("qwertasdfgzxcvbQWERTASDFGZXCVB123456!@#$%^");
const drills = window.TESTING_DRILLS;
const typingTips = window.TESTING_TIPS;

let active = null;
let timer = null;
let startedAt = null;
let duration = 600;
let targetAccuracy = 97;
let pasteAttempts = 0;
let lastDrillKey = null;
let activeExercise = null;
let exerciseBlockNumber = 0;
let completedExerciseBlocks = 0;

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

function extendPromptIfComplete() {
  if (!active || !promptEl.textContent || box.value !== promptEl.textContent) return;

  completedExerciseBlocks++;
  activeExercise = chooseDrill();
  exerciseBlockNumber++;
  promptEl.textContent += `

${activeExercise.text}`;
  $("learningFocus").textContent = `Block ${exerciseBlockNumber} | ${activeExercise.id} | ${activeExercise.concept}`;
  showRandomTip();
}

function handOfExpectedChar(ch) {
  if (RIGHT_HAND_KEYS.has(ch)) return "right";
  if (LEFT_HAND_KEYS.has(ch)) return "left";
  return "neutral";
}

function classifyMistakes(target, typed) {
  const breakdown = {
    letters:0, numbers:0, spaces:0, punctuation:0, case:0, extra:0,
    rightHand:0, leftHand:0, neutral:0
  };
  let errors = 0;
  for (let i = 0; i < typed.length; i++) {
    const a = target[i];
    const b = typed[i];
    if (a === b) continue;
    errors++;
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

  if (completed.some(s => s.passed && Number(s.level) === 4)) earned.add("Advanced Technical Clean Run");
  if (completed.some(s => Number(s.wpm) >= 40 && Number(s.accuracy) >= 97)) earned.add("40 Club");
  if (completed.some(s => Number(s.mistakeBreakdown?.pasteAttempts || 0) === 0)) earned.add("Zero Paste");
  return [...earned];
}

async function refreshSummary() {
  try {
    const r = await fetch("/api/summary");
    const s = await r.json();
    $("todayMinutes").textContent = `${s.todayMinutes} min`;
    $("avgAccuracy").textContent = `${s.avgAccuracy}%`;
    $("bestWpm").textContent = s.bestWpm;
    $("streak").textContent = `${s.streak} day${s.streak === 1 ? "" : "s"}`;
  } catch {}
}

async function refreshHistory() {
  try {
    const r = await fetch("/api/sessions");
    const rows = await r.json();
    const completed = rows.filter(s => s.completedAt);
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
      <thead><tr><th>Date</th><th>Mode</th><th>Concept</th><th>Level</th><th>Blocks</th><th>Result</th><th>WPM</th><th>Accuracy</th><th>Errors</th><th>RH errors</th><th>Paste</th><th>Score</th></tr></thead>
      <tbody>${completed.slice(0,20).map(s => `<tr>
        <td>${new Date(s.startedAt).toLocaleString()}</td>
        <td>${s.mode}</td>
        <td>${s.exerciseConcept || "-"}</td>
        <td>${s.level || "-"}</td>
        <td>${s.exerciseBlocksCompleted ?? "-"}</td>
        <td><span class="badge ${s.passed ? "pass" : "fail"}">${s.passed ? "PASS" : "REPEAT"}</span></td>
        <td>${s.wpm ?? "-"}</td>
        <td>${s.accuracy == null ? "-" : s.accuracy + "%"}</td>
        <td>${s.errors ?? "-"}</td>
        <td>${s.mistakeBreakdown?.rightHand ?? "-"}</td>
        <td>${s.mistakeBreakdown?.pasteAttempts ?? 0}</td>
        <td>${s.score ?? "-"}</td>
      </tr>`).join("")}</tbody>
    </table>`;
  } catch {
    $("history").textContent = "Unable to load history.";
  }
}

async function startSession() {
  duration = Number(durationSel.value);
  activeExercise = chooseDrill();
  exerciseBlockNumber = 1;
  completedExerciseBlocks = 0;
  promptEl.textContent = activeExercise.text;
  $("learningFocus").textContent = `Block ${exerciseBlockNumber} | ${activeExercise.id} | ${activeExercise.concept}`;
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

  const r = await fetch("/api/session/start", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      trainee: "Aswin",
      mode: mode.value,
      level: Number(level.value),
      exerciseId: activeExercise.id,
      exerciseConcept: activeExercise.concept,
      targetAccuracy
    })
  });
  const data = await r.json();
  active = data.session;

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

  const r = await fetch("/api/session/complete", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ id: active.id, ...stats, durationSeconds, exerciseBlocksCompleted: completedExerciseBlocks })
  });
  const data = await r.json();

  if (data.session) {
    $("ruleBox").textContent = data.session.passed
      ? `PASS: ${data.session.accuracy}% accuracy, score ${data.session.score}/100.`
      : `REPEAT REQUIRED: ${data.session.accuracy}% accuracy is below the ${data.session.targetAccuracy}% gate.`;
    $("ruleBox").className = "rule " + (data.session.passed ? "good" : "bad");
    showRandomTip();
  }

  active = null;
  await refreshHistory();
  await refreshSummary();
}

function reset() {
  clearInterval(timer);
  active = null;
  startedAt = null;
  box.value = "";
  pasteAttempts = 0;
  exerciseBlockNumber = 0;
  completedExerciseBlocks = 0;
  activeExercise = null;
  box.disabled = true;
  startBtn.disabled = false;
  finishBtn.disabled = true;
  promptEl.textContent = "Press Start Practice to begin.";
  $("learningFocus").textContent = "Choose a testing domain and level. Each exercise includes a best-practice learning focus.";
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

box.addEventListener("input", () => {
  compute();
  extendPromptIfComplete();
  compute();
});
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
