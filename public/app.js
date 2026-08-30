const core = window.TYPING_CORE;
const drills = window.TESTING_DRILLS || {};
const typingTips = window.TESTING_TIPS || [];

const PROGRESS_KEY = "aswinTypingProgressV3";
const OLD_PROGRESS_KEY = "aswinTypingProgressV2";
const LOCAL_SESSION_LIMIT = 250;
const EXERCISE_HISTORY_LIMIT = 12;
const TARGET_DAILY_MINUTES = 20;

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
let sessionCompletedExerciseIds = [];
let finishing = false;
let cachedServerSessions = [];

const $ = id => document.getElementById(id);
const mode = $("mode");
const level = $("level");
const durationSel = $("duration");
const revisionMode = $("revisionMode");
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
const continueBtn = $("continueBtn");
const referenceLineNumbers = $("referenceLineNumbers");
const typingLineNumbers = $("typingLineNumbers");
const caretStatus = $("caretStatus");
const editorMatchStatus = $("editorMatchStatus");
const referenceFile = $("referenceFile");
const referenceMeta = $("referenceMeta");
const referencePosition = $("referencePosition");

let progressState = loadProgressState();

function defaultProgressState() {
  return {
    version: 3,
    lastActivity: null,
    exercises: {},
    localSessions: [],
    processedSessionIds: [],
    settings: {
      mode: "Python Automation",
      level: 1,
      duration: 600,
      revisionMode: false
    },
    updatedAt: null
  };
}

function normalizeProgressState(parsed) {
  const base = defaultProgressState();
  const state = {
    ...base,
    ...(parsed && typeof parsed === "object" ? parsed : {}),
    exercises: parsed?.exercises && typeof parsed.exercises === "object" ? parsed.exercises : {},
    localSessions: Array.isArray(parsed?.localSessions) ? parsed.localSessions : [],
    processedSessionIds: Array.isArray(parsed?.processedSessionIds) ? parsed.processedSessionIds : [],
    settings: { ...base.settings, ...(parsed?.settings || {}) },
    version: 3
  };
  return state;
}

function loadProgressState() {
  try {
    const current = localStorage.getItem(PROGRESS_KEY);
    if (current) return normalizeProgressState(JSON.parse(current));

    const old = localStorage.getItem(OLD_PROGRESS_KEY);
    if (old) {
      const migrated = normalizeProgressState(JSON.parse(old));
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(migrated)); } catch {}
      return migrated;
    }
  } catch (error) {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY) || localStorage.getItem(OLD_PROGRESS_KEY);
      if (raw) localStorage.setItem(`${PROGRESS_KEY}_corrupt_${Date.now()}`, raw.slice(0, 200000));
    } catch {}
  }
  return defaultProgressState();
}

function saveProgressState() {
  progressState.version = 3;
  progressState.updatedAt = new Date().toISOString();
  progressState.localSessions = progressState.localSessions.slice(0, LOCAL_SESSION_LIMIT);
  progressState.processedSessionIds = progressState.processedSessionIds.slice(-1000);
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressState));
    $("syncStatus").textContent = pendingSyncCount() ? `${pendingSyncCount()} session(s) pending server sync` : "Progress saved locally";
  } catch {
    $("syncStatus").textContent = "Browser storage unavailable";
  }
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function fetchJson(url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function allDrillsFor(modeName, levelNumber) {
  return drills?.[modeName]?.[Number(levelNumber)] || [];
}

function getDrillById(id) {
  if (!id) return null;
  for (const modeName of Object.keys(drills)) {
    for (const levelNumber of Object.keys(drills[modeName] || {})) {
      const found = (drills[modeName][levelNumber] || []).find(d => d.id === id);
      if (found) return { ...found, mode: modeName, level: Number(levelNumber) };
    }
  }
  return null;
}

function exerciseProgress(exerciseId) {
  return progressState.exercises[exerciseId] || null;
}

function isMastered(exerciseId) {
  return exerciseProgress(exerciseId)?.status === "mastered";
}

function levelProgress(modeName, levelNumber) {
  return core.levelProgress(drills, progressState.exercises, modeName, Number(levelNumber));
}

function chooseDrill(options = {}) {
  const modeName = options.mode || mode.value;
  const levelNumber = Number(options.level || level.value);
  const revision = options.revision ?? revisionMode.checked;
  const arr = allDrillsFor(modeName, levelNumber);
  if (!arr.length) return null;

  const excluded = new Set(options.excludeIds || []);
  let candidates;
  if (revision) {
    candidates = arr.filter(d => !excluded.has(d.id));
    if (!candidates.length) candidates = arr;
  } else {
    const unresolved = arr.filter(d => !isMastered(d.id) && !excluded.has(d.id));
    const repeats = unresolved.filter(d => exerciseProgress(d.id)?.status === "repeat");
    const inProgress = unresolved.filter(d => exerciseProgress(d.id)?.status === "in_progress");
    candidates = repeats.length ? repeats : (inProgress.length ? inProgress : unresolved);
    if (!candidates.length) return null;
  }

  let index = Math.floor(Math.random() * candidates.length);
  let chosen = candidates[index];
  if (candidates.length > 1 && chosen.id === lastDrillKey) {
    index = (index + 1) % candidates.length;
    chosen = candidates[index];
  }
  lastDrillKey = chosen.id;
  return { ...chosen, mode: modeName, level: levelNumber };
}

function ensureExerciseRecord(exercise, fallback = {}) {
  const current = progressState.exercises[exercise.id] || {
    id: exercise.id,
    mode: exercise.mode || fallback.mode,
    level: Number(exercise.level || fallback.level || 1),
    concept: exercise.concept || fallback.exerciseConcept || "",
    status: "not_started",
    attempts: 0,
    revisionAttempts: 0,
    bestScore: 0,
    bestAccuracy: 0,
    bestWpm: 0,
    history: []
  };
  current.mode = exercise.mode || fallback.mode || current.mode;
  current.level = Number(exercise.level || fallback.level || current.level || 1);
  current.concept = exercise.concept || current.concept || "";
  current.history = Array.isArray(current.history) ? current.history : [];
  return current;
}

function markExerciseInProgress(exercise) {
  if (!exercise?.id) return;
  const current = ensureExerciseRecord(exercise);
  if (current.status !== "mastered") current.status = "in_progress";
  current.lastStartedAt = new Date().toISOString();
  progressState.exercises[exercise.id] = current;
  saveProgressState();
}

function recordExerciseAttempt(exercise, status, session) {
  if (!exercise?.id || !session?.id) return;
  const current = ensureExerciseRecord(exercise, session);
  const existing = current.history.find(item => item.sessionId === session.id);
  if (!existing) {
    current.attempts = Number(current.attempts || 0) + 1;
    if (session.revisionMode) current.revisionAttempts = Number(current.revisionAttempts || 0) + 1;
    current.history.unshift({
      sessionId: session.id,
      at: session.completedAt || new Date().toISOString(),
      status: session.completionStatus || status.toUpperCase(),
      score: Number(session.score || 0),
      accuracy: Number(session.accuracy || 0),
      wpm: Number(session.wpm || 0)
    });
    current.history = current.history.slice(0, EXERCISE_HISTORY_LIMIT);
  }

  current.lastAttemptAt = session.completedAt || new Date().toISOString();
  current.lastScore = Number(session.score || 0);
  current.lastAccuracy = Number(session.accuracy || 0);
  current.lastWpm = Number(session.wpm || 0);
  current.lastCompletionStatus = session.completionStatus || status.toUpperCase();
  current.bestScore = Math.max(Number(current.bestScore || 0), Number(session.score || 0));
  current.bestAccuracy = Math.max(Number(current.bestAccuracy || 0), Number(session.accuracy || 0));

  const validWpm = Number(session.accuracy || 0) >= Number(session.targetAccuracy || targetAccuracy) && Number(session.exerciseBlocksCompleted || 0) > 0;
  if (validWpm) current.bestWpm = Math.max(Number(current.bestWpm || 0), Number(session.wpm || 0));

  if (status === "mastered") {
    if (current.status !== "mastered") current.masteredAt = session.completedAt || new Date().toISOString();
    current.status = "mastered";
  } else if (current.status !== "mastered") {
    current.status = status;
  }

  progressState.exercises[exercise.id] = current;
}

function rememberLocalSession(session) {
  if (!session?.id) return;
  const filtered = progressState.localSessions.filter(s => s.id !== session.id);
  progressState.localSessions = [{ ...session }, ...filtered].slice(0, LOCAL_SESSION_LIMIT);
}

function sessionTimestamp(session) {
  return new Date(session.completedAt || session.startedAt || 0).getTime() || 0;
}

function applySessionToProgress(session, options = {}) {
  if (!session?.id) return;
  const processed = new Set(progressState.processedSessionIds || []);
  if (processed.has(session.id) && !options.force) {
    rememberLocalSession(session);
    saveProgressState();
    return;
  }

  const completedIds = Array.isArray(session.exerciseIdsCompleted) ? [...new Set(session.exerciseIdsCompleted)] : [];
  const passed = Boolean(session.passed) && session.completionStatus === "PASS";
  const interrupted = session.completionStatus === "INTERRUPTED";

  for (const id of completedIds) {
    const drill = getDrillById(id);
    if (drill) recordExerciseAttempt(drill, passed ? "mastered" : "repeat", session);
  }

  const currentId = session.currentExerciseId || session.exerciseId;
  const current = getDrillById(currentId);
  if (current && !completedIds.includes(currentId)) {
    let status = "repeat";
    if (passed) status = "in_progress";
    if (interrupted && Number(session.charactersTyped || 0) === 0) status = "in_progress";
    recordExerciseAttempt(current, status, session);
  }

  let lastStatus = "repeat";
  if (session.completionStatus === "INTERRUPTED") lastStatus = "interrupted";
  else if (passed && current && !completedIds.includes(currentId)) lastStatus = "in_progress";
  else if (passed) lastStatus = "mastered";
  else if (session.completionStatus === "INCOMPLETE") lastStatus = "incomplete";

  const lastActivity = {
    mode: session.mode,
    level: Number(session.level),
    exerciseId: currentId || completedIds.at(-1) || session.exerciseId || null,
    status: lastStatus,
    score: session.score,
    accuracy: session.accuracy,
    wpm: session.wpm,
    startedAt: session.startedAt,
    completedAt: session.completedAt
  };

  if (!progressState.lastActivity || sessionTimestamp(lastActivity) >= sessionTimestamp(progressState.lastActivity)) {
    progressState.lastActivity = lastActivity;
  }

  rememberLocalSession(session);
  processed.add(session.id);
  progressState.processedSessionIds = [...processed].slice(-1000);
  saveProgressState();
  renderProgressUI();
}

function mergeSessions(serverRows = cachedServerSessions) {
  const merged = new Map();
  for (const row of [...progressState.localSessions, ...(serverRows || [])]) {
    if (!row?.id) continue;
    merged.set(row.id, { ...(merged.get(row.id) || {}), ...row });
  }
  return [...merged.values()].sort((a, b) => sessionTimestamp(b) - sessionTimestamp(a));
}

function pendingSyncCount() {
  return progressState.localSessions.filter(s => s?.completedAt && s.syncStatus === "pending").length;
}

function nextRecommendation() {
  const all = core.allDrills(drills);
  const repeats = all
    .filter(d => exerciseProgress(d.id)?.status === "repeat")
    .sort((a, b) => {
      const ap = exerciseProgress(a.id) || {};
      const bp = exerciseProgress(b.id) || {};
      return Number(bp.attempts || 0) - Number(ap.attempts || 0) || Number(ap.lastAccuracy || 100) - Number(bp.lastAccuracy || 100);
    });

  const last = progressState.lastActivity;
  if (last && ["repeat", "interrupted", "in_progress", "incomplete"].includes(last.status)) {
    const target = getDrillById(last.exerciseId);
    if (target && !isMastered(target.id)) {
      const lp = levelProgress(target.mode, target.level);
      return {
        mode: target.mode,
        level: target.level,
        exerciseId: target.id,
        title: `${last.status === "repeat" ? "Repeat" : "Continue"} ${target.mode}, Level ${target.level}`,
        detail: `${target.id}, ${target.concept} ${lp.mastered}/${lp.total} exercises mastered at this level.`
      };
    }
  }

  if (repeats.length) {
    const target = repeats[0];
    const p = exerciseProgress(target.id) || {};
    return {
      mode: target.mode,
      level: target.level,
      exerciseId: target.id,
      title: `Clear repeat queue: ${target.id}`,
      detail: `${target.mode}, Level ${target.level}. Last accuracy ${Number(p.lastAccuracy || 0).toFixed(1)}%, attempts ${Number(p.attempts || 0)}. ${target.concept}`
    };
  }

  if (last) {
    const modeName = last.mode || "Python Automation";
    let levelNumber = Number(last.level) || 1;
    for (let l = levelNumber; l <= 4; l++) {
      const lp = levelProgress(modeName, l);
      if (!lp.complete) {
        const next = allDrillsFor(modeName, l).find(d => !isMastered(d.id));
        if (next) return {
          mode: modeName,
          level: l,
          exerciseId: next.id,
          title: `Continue ${modeName}, Level ${l}`,
          detail: `${lp.mastered}/${lp.total} mastered. Next: ${next.id}, ${next.concept}`
        };
      }
    }
  }

  for (const modeName of Object.keys(drills)) {
    for (let l = 1; l <= 4; l++) {
      const next = allDrillsFor(modeName, l).find(d => !isMastered(d.id));
      if (next) {
        const lp = levelProgress(modeName, l);
        return {
          mode: modeName,
          level: l,
          exerciseId: next.id,
          title: `Next: ${modeName}, Level ${l}`,
          detail: `${lp.mastered}/${lp.total} mastered. ${next.id}, ${next.concept}`
        };
      }
    }
  }

  return {
    mode: "Python Automation",
    level: 1,
    exerciseId: null,
    title: "All exercises mastered",
    detail: "The full practice bank is complete. Enable Revision Mode to revisit mastered exercises."
  };
}

function renderNextUp() {
  const rec = nextRecommendation();
  const last = progressState.lastActivity;
  $("nextTitle").textContent = rec.title;
  $("nextDetail").textContent = rec.detail;

  if (last) {
    const when = last.completedAt || last.startedAt;
    const statusMap = {
      mastered: "PASS",
      repeat: "REPEAT",
      incomplete: "INCOMPLETE",
      in_progress: "IN PROGRESS",
      interrupted: "INTERRUPTED"
    };
    $("lastActivity").textContent = `${last.mode}, Level ${last.level} | ${last.exerciseId || "-"} | ${statusMap[last.status] || last.status} | Score ${last.score == null ? "-" : `${last.score}/100`} | Accuracy ${last.accuracy == null ? "-" : `${last.accuracy}%`}${when ? ` | ${new Date(when).toLocaleString()}` : ""}`;
  } else {
    $("lastActivity").textContent = "No previous activity saved on this browser.";
  }

  continueBtn.dataset.mode = rec.mode;
  continueBtn.dataset.level = String(rec.level);
  continueBtn.dataset.exerciseId = rec.exerciseId || "";
}

function refreshModeOptions() {
  const selected = mode.value || progressState.settings.mode || "Python Automation";
  const summary = core.progressSummary(drills, progressState.exercises);
  mode.innerHTML = "";
  for (const d of summary.domains) {
    const option = document.createElement("option");
    option.value = d.mode;
    const started = d.mastered > 0 || d.levels.some(p => p.repeats > 0 || p.inProgress > 0);
    option.textContent = d.complete ? `${d.mode} · COMPLETE` : started ? `${d.mode} · IN PROGRESS ${d.mastered}/${d.total}` : `${d.mode} · NOT STARTED`;
    mode.appendChild(option);
  }
  mode.value = Object.keys(drills).includes(selected) ? selected : Object.keys(drills)[0];
}

function refreshLevelOptions() {
  const selected = Number(level.value || progressState.settings.level || 1);
  level.innerHTML = "";
  for (let l = 1; l <= 4; l++) {
    const p = levelProgress(mode.value, l);
    const option = document.createElement("option");
    option.value = String(l);
    const status = p.complete ? "COMPLETE" : p.mastered || p.repeats || p.inProgress ? `${p.mastered}/${p.total}` : "NOT STARTED";
    option.textContent = `Level ${l} · ${status}`;
    level.appendChild(option);
  }
  level.value = String(Math.min(4, Math.max(1, selected)));
}

function renderOverallProgress() {
  const summary = core.progressSummary(drills, progressState.exercises);
  $("overallMastered").textContent = summary.overallMastered;
  $("overallTotal").textContent = summary.overallTotal;
  $("overallPercent").textContent = `${summary.overallPercent}%`;
  $("overallProgressBar").style.width = `${summary.overallPercent}%`;
  $("coreProgressText").textContent = `${summary.coreMastered} / ${summary.coreTotal} (${summary.corePercent}%)`;
  $("completedLevelsText").textContent = `${summary.completedLevels} / ${summary.totalLevels}`;
  $("repeatQueueCount").textContent = summary.repeatQueue.length;
}

function renderDomainProgress() {
  const summary = core.progressSummary(drills, progressState.exercises);
  $("domainProgress").innerHTML = summary.domains.map(d => {
    const levelChips = d.levels.map(p => `<span class="level-chip ${p.complete ? "complete" : p.mastered ? "started" : ""}">L${p.level}: ${p.complete ? "✓" : `${p.mastered}/${p.total}`}</span>`).join("");
    return `<article class="domain-card">
      <div class="domain-head"><strong>${escapeHtml(d.mode)}</strong><span>${d.complete ? "COMPLETE" : `${d.percent}%`}</span></div>
      <div class="progress-track small"><div class="progress-fill" style="width:${d.percent}%"></div></div>
      <div class="domain-count">${d.mastered}/${d.total} mastered</div>
      <div class="level-chips">${levelChips}</div>
    </article>`;
  }).join("");
}

function renderRepeatQueue() {
  const repeat = core.progressSummary(drills, progressState.exercises).repeatQueue
    .sort((a, b) => Number(exerciseProgress(b.id)?.attempts || 0) - Number(exerciseProgress(a.id)?.attempts || 0));
  if (!repeat.length) {
    $("repeatQueue").textContent = "No exercises need repeating.";
    return;
  }
  $("repeatQueue").innerHTML = repeat.slice(0, 10).map(d => {
    const p = exerciseProgress(d.id) || {};
    return `<div class="list-row"><div><strong>${escapeHtml(d.id)}</strong> · ${escapeHtml(d.mode)} L${d.level}<small>${escapeHtml(d.concept)}</small></div><div class="list-metric">${Number(p.lastAccuracy || 0).toFixed(1)}%<small>${Number(p.attempts || 0)} attempt(s)</small></div></div>`;
  }).join("");
}

function renderRecentMastered() {
  const rows = core.allDrills(drills)
    .map(d => ({ ...d, progress: exerciseProgress(d.id) }))
    .filter(d => d.progress?.status === "mastered")
    .sort((a, b) => new Date(b.progress.masteredAt || b.progress.lastAttemptAt || 0) - new Date(a.progress.masteredAt || a.progress.lastAttemptAt || 0));
  if (!rows.length) {
    $("recentMastered").textContent = "No mastered exercises yet.";
    return;
  }
  $("recentMastered").innerHTML = rows.slice(0, 8).map(d => `<div class="list-row"><div><strong>${escapeHtml(d.id)}</strong> · ${escapeHtml(d.mode)} L${d.level}<small>${escapeHtml(d.concept)}</small></div><div class="list-metric">${Number(d.progress.bestAccuracy || 0).toFixed(1)}%<small>PB ${Number(d.progress.bestWpm || 0)} WPM</small></div></div>`).join("");
}

function aggregateKeyErrors(sessions) {
  const counts = {};
  for (const s of sessions) {
    for (const [key, value] of Object.entries(s.mistakeBreakdown?.keyErrors || {})) counts[key] = Number(counts[key] || 0) + Number(value || 0);
  }
  return counts;
}

function renderWeakRecommendation() {
  const repeat = core.progressSummary(drills, progressState.exercises).repeatQueue;
  const sessions = mergeSessions().filter(s => s.completedAt);
  const keyErrors = aggregateKeyErrors(sessions);
  const topKey = Object.entries(keyErrors).sort((a, b) => b[1] - a[1])[0];

  if (repeat.length) {
    const target = repeat.slice().sort((a, b) => {
      const ap = exerciseProgress(a.id) || {};
      const bp = exerciseProgress(b.id) || {};
      return Number(bp.attempts || 0) - Number(ap.attempts || 0) || Number(ap.lastAccuracy || 100) - Number(bp.lastAccuracy || 100);
    })[0];
    const p = exerciseProgress(target.id) || {};
    $("weakRecommendation").innerHTML = `<strong>Priority: ${escapeHtml(target.id)}, ${escapeHtml(target.mode)} Level ${target.level}</strong><br>${escapeHtml(target.concept)} Last accuracy ${Number(p.lastAccuracy || 0).toFixed(1)}%, ${Number(p.attempts || 0)} attempt(s).${topKey ? ` Most frequent mistyped key overall: <code>${escapeHtml(topKey[0])}</code> (${topKey[1]} errors).` : ""}`;
    return;
  }

  const summary = core.progressSummary(drills, progressState.exercises);
  const started = summary.domains.filter(d => d.mastered > 0 && !d.complete).sort((a, b) => a.percent - b.percent);
  if (started.length) {
    const d = started[0];
    $("weakRecommendation").innerHTML = `<strong>Build depth in ${escapeHtml(d.mode)}</strong><br>${d.mastered}/${d.total} mastered (${d.percent}%).${topKey ? ` Most frequent mistyped key overall: <code>${escapeHtml(topKey[0])}</code> (${topKey[1]} errors).` : ""}`;
  } else {
    $("weakRecommendation").textContent = topKey ? `No repeat queue. Most frequent mistyped key: ${topKey[0]} (${topKey[1]} errors).` : "Complete a few sessions to generate a recommendation.";
  }
}

function renderMiniChart(elementId, values, kind) {
  const el = $(elementId);
  if (!values.length) {
    el.textContent = "No data yet.";
    return;
  }
  const maxValue = kind === "accuracy" ? 100 : Math.max(20, ...values.map(v => Number(v.value || 0)));
  el.innerHTML = values.map(v => {
    const height = Math.max(4, Math.min(100, (Number(v.value || 0) / maxValue) * 100));
    return `<div class="chart-point" title="${escapeHtml(v.label)}: ${Number(v.value || 0)}${kind === "accuracy" ? "%" : " WPM"}"><span style="height:${height}%"></span><small>${escapeHtml(v.short)}</small></div>`;
  }).join("");
}

function renderTrendsAndMetrics() {
  const completed = mergeSessions().filter(s => s.completedAt && s.completionStatus !== "INTERRUPTED" && Number(s.exerciseBlocksCompleted || 0) > 0).sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  const recent = completed.slice(-12);
  renderMiniChart("accuracyTrend", recent.map((s, i) => ({ value: Number(s.accuracy || 0), label: `${s.mode} ${new Date(s.startedAt).toLocaleString()}`, short: String(i + 1) })), "accuracy");
  renderMiniChart("wpmTrend", recent.map((s, i) => ({ value: Number(s.wpm || 0), label: `${s.mode} ${new Date(s.startedAt).toLocaleString()}`, short: String(i + 1) })), "wpm");

  const rows = Object.keys(drills).map(modeName => {
    const domainSessions = completed.filter(s => s.mode === modeName);
    const avg = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const validWpm = domainSessions.filter(s => Number(s.accuracy || 0) >= Number(s.targetAccuracy || targetAccuracy) && Number(s.exerciseBlocksCompleted || 0) > 0);
    const p = core.domainProgress(drills, progressState.exercises, modeName);
    return {
      mode: modeName,
      sessions: domainSessions.length,
      avgAccuracy: avg(domainSessions.map(s => Number(s.accuracy || 0))),
      bestAccuracy: domainSessions.length ? Math.max(...domainSessions.map(s => Number(s.accuracy || 0))) : 0,
      avgWpm: avg(validWpm.map(s => Number(s.wpm || 0))),
      bestWpm: validWpm.length ? Math.max(...validWpm.map(s => Number(s.wpm || 0))) : 0,
      mastered: `${p.mastered}/${p.total}`
    };
  });

  $("technologyMetrics").innerHTML = `<table><thead><tr><th>Domain</th><th>Mastered</th><th>Sessions</th><th>Avg accuracy</th><th>Best accuracy</th><th>Avg valid WPM</th><th>Best valid WPM</th></tr></thead><tbody>${rows.map(r => `<tr><td>${escapeHtml(r.mode)}</td><td>${r.mastered}</td><td>${r.sessions}</td><td>${r.sessions ? r.avgAccuracy.toFixed(1) + "%" : "-"}</td><td>${r.sessions ? r.bestAccuracy.toFixed(1) + "%" : "-"}</td><td>${r.avgWpm ? Math.round(r.avgWpm) : "-"}</td><td>${r.bestWpm || "-"}</td></tr>`).join("")}</tbody></table>`;
}

function renderDiagnostics() {
  const completed = mergeSessions().filter(s => s.completedAt);
  const keyErrors = Object.entries(aggregateKeyErrors(completed)).sort((a, b) => b[1] - a[1]).slice(0, 16);
  if (keyErrors.length) {
    const max = keyErrors[0][1] || 1;
    $("mistakeHeatmap").innerHTML = keyErrors.map(([key, count]) => `<span class="heat-key" title="${count} errors" style="--heat:${Math.max(0.18, count / max)}"><strong>${escapeHtml(key)}</strong><small>${count}</small></span>`).join("");
  } else {
    $("mistakeHeatmap").textContent = "No key-error data yet.";
  }

  const recent = completed.slice(0, 10);
  if (!recent.length) {
    $("handSymbolTrend").textContent = "No diagnostic history yet.";
    return;
  }
  $("handSymbolTrend").innerHTML = recent.map(s => {
    const rh = Number(s.mistakeBreakdown?.rightHand || 0);
    const lh = Number(s.mistakeBreakdown?.leftHand || 0);
    const symbolAccuracy = s.mistakeBreakdown?.symbolAccuracy;
    return `<div class="list-row"><div><strong>${escapeHtml(s.mode)}</strong><small>${new Date(s.startedAt).toLocaleString()}</small></div><div class="list-metric">RH ${rh} / LH ${lh}<small>Symbols ${symbolAccuracy == null ? "-" : `${Number(symbolAccuracy).toFixed(1)}%`}</small></div></div>`;
  }).join("");
}

function computeMilestones() {
  const summary = core.progressSummary(drills, progressState.exercises);
  const sessions = mergeSessions().filter(s => s.completedAt);
  const daySummary = core.sessionSummary(sessions, targetAccuracy);
  const earned = [];
  if (summary.overallMastered >= 1) earned.push("First Mastery");
  if (summary.overallPercent >= 25) earned.push("25% Complete");
  if (summary.overallPercent >= 50) earned.push("Halfway Mastered");
  if (summary.overallPercent >= 75) earned.push("75% Complete");
  if (summary.overallPercent === 100) earned.push("Full Bank Mastery");
  for (const d of summary.domains.filter(d => core.CORE_MODES.includes(d.mode) && d.complete)) earned.push(`${d.mode} Mastered`);
  if (summary.corePercent === 100) earned.push("Core Testing Mastery");
  if (daySummary.todayMinutes >= TARGET_DAILY_MINUTES) earned.push("Daily Target Met");
  if (daySummary.streak >= 7) earned.push("7-Day Streak");
  return earned;
}

function progressCheckpoint() {
  const summary = core.progressSummary(drills, progressState.exercises);
  const completedLevels = [];
  const completedDomains = [];
  for (const domain of summary.domains) {
    if (domain.complete) completedDomains.push(domain.mode);
    for (const lp of domain.levels) if (lp.complete) completedLevels.push(`${domain.mode} Level ${lp.level}`);
  }
  return {
    milestones: computeMilestones(),
    masteredIds: core.allDrills(drills).filter(d => isMastered(d.id)).map(d => d.id),
    completedLevels,
    completedDomains
  };
}

function progressPieces(modeName, levelNumber) {
  const summary = core.progressSummary(drills, progressState.exercises);
  const domain = summary.domains.find(d => d.mode === modeName) || core.domainProgress(drills, progressState.exercises, modeName);
  const lp = core.levelProgress(drills, progressState.exercises, modeName, Number(levelNumber));
  return {
    level: { mastered: lp.mastered, total: lp.total, percent: lp.percent, complete: lp.complete },
    domain: { mastered: domain.mastered, total: domain.total, percent: domain.percent, complete: domain.complete },
    core: { mastered: summary.coreMastered, total: summary.coreTotal, percent: summary.corePercent },
    overall: {
      mastered: summary.overallMastered,
      total: summary.overallTotal,
      percent: summary.overallPercent,
      completedLevels: summary.completedLevels,
      totalLevels: summary.totalLevels,
      repeatQueue: summary.repeatQueue.length
    }
  };
}

function weeklyTrainingSnapshot() {
  const rows = mergeSessions();
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const sessions = rows.filter(s => s.completedAt && new Date(s.startedAt) >= weekStart);
  const mastered = Object.values(progressState.exercises).filter(p => p.status === "mastered" && p.masteredAt && new Date(p.masteredAt) >= weekStart).length;
  return {
    minutes: Math.round(sessions.reduce((sum, row) => sum + Number(row.durationSeconds || 0), 0) / 60),
    sessions: sessions.length,
    mastered
  };
}

function weakAreaText() {
  const repeat = core.progressSummary(drills, progressState.exercises).repeatQueue;
  const sessions = mergeSessions().filter(s => s.completedAt);
  const topKey = Object.entries(aggregateKeyErrors(sessions)).sort((a, b) => b[1] - a[1])[0];
  if (repeat.length) {
    const target = repeat.slice().sort((a, b) => {
      const ap = exerciseProgress(a.id) || {};
      const bp = exerciseProgress(b.id) || {};
      return Number(bp.attempts || 0) - Number(ap.attempts || 0) || Number(ap.lastAccuracy || 100) - Number(bp.lastAccuracy || 100);
    })[0];
    const p = exerciseProgress(target.id) || {};
    return `Priority ${target.id}, ${target.mode} Level ${target.level}: ${target.concept} Last accuracy ${Number(p.lastAccuracy || 0).toFixed(1)}%, attempts ${Number(p.attempts || 0)}.${topKey ? ` Most frequent mistyped key overall: ${topKey[0]} (${topKey[1]} errors).` : ""}`;
  }
  return topKey ? `No repeat queue. Most frequent mistyped key overall: ${topKey[0]} (${topKey[1]} errors).` : "No repeat queue or recurring key weakness identified yet.";
}

function buildTelegramStartContext(modeName, levelNumber) {
  const pieces = progressPieces(modeName, levelNumber);
  return { ...pieces, repeatQueue: pieces.overall.repeatQueue };
}

function buildTelegramCompletionReport(session, before) {
  const pieces = progressPieces(session.mode, session.level);
  const after = progressCheckpoint();
  const beforeMastered = new Set(before?.masteredIds || []);
  const beforeLevels = new Set(before?.completedLevels || []);
  const beforeDomains = new Set(before?.completedDomains || []);
  const beforeMilestones = new Set(before?.milestones || []);
  const completedIds = Array.isArray(session.exerciseIdsCompleted) ? session.exerciseIdsCompleted : [];
  const newlyMastered = completedIds.filter(id => !beforeMastered.has(id) && isMastered(id));
  const repeatRequired = [...new Set([...completedIds, session.currentExerciseId].filter(id => id && exerciseProgress(id)?.status === "repeat"))];
  const rows = mergeSessions();
  const domainRows = rows.filter(s => s.completedAt && s.mode === session.mode);
  const scoredDomainRows = domainRows.filter(s => s.completionStatus !== "INTERRUPTED" && Number(s.exerciseBlocksCompleted || 0) > 0);
  const validDomainWpmRows = scoredDomainRows.filter(s => Number(s.accuracy || 0) >= Number(s.targetAccuracy || targetAccuracy));
  const average = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const day = core.sessionSummary(rows, targetAccuracy);
  const recentScored = rows.filter(s => s.completedAt && s.completionStatus !== "INTERRUPTED" && Number(s.exerciseBlocksCompleted || 0) > 0).slice(0, 5).reverse();
  const keyErrors = Object.entries(session.mistakeBreakdown?.keyErrors || {}).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 5);
  const rec = nextRecommendation();

  return {
    ...pieces,
    newlyMastered,
    repeatRequired,
    newMilestones: after.milestones.filter(x => !beforeMilestones.has(x)),
    newlyCompletedLevels: after.completedLevels.filter(x => !beforeLevels.has(x)),
    newlyCompletedDomains: after.completedDomains.filter(x => !beforeDomains.has(x)),
    diagnostics: {
      topErrors: keyErrors.map(([key, count]) => ({ key, count: Number(count || 0) })),
      symbolAccuracy: Number(session.mistakeBreakdown?.symbolAccuracy ?? 100),
      rightHand: Number(session.mistakeBreakdown?.rightHand || 0),
      leftHand: Number(session.mistakeBreakdown?.leftHand || 0)
    },
    personalBest: {
      domainBestWpm: core.validBestWpm(domainRows, targetAccuracy),
      overallBestWpm: core.validBestWpm(rows, targetAccuracy)
    },
    domainMetrics: {
      sessions: scoredDomainRows.length,
      avgAccuracy: Number(average(scoredDomainRows.map(s => Number(s.accuracy || 0))).toFixed(1)),
      bestAccuracy: scoredDomainRows.length ? Number(Math.max(...scoredDomainRows.map(s => Number(s.accuracy || 0))).toFixed(1)) : 0,
      avgValidWpm: validDomainWpmRows.length ? Math.round(average(validDomainWpmRows.map(s => Number(s.wpm || 0)))) : 0,
      bestValidWpm: core.validBestWpm(domainRows, targetAccuracy)
    },
    trends: {
      accuracy: recentScored.map(s => Number(s.accuracy || 0)),
      wpm: recentScored.map(s => Number(s.wpm || 0))
    },
    daily: {
      minutes: day.todayMinutes,
      targetMinutes: TARGET_DAILY_MINUTES,
      complete: day.todayMinutes >= TARGET_DAILY_MINUTES,
      streak: day.streak
    },
    weekly: weeklyTrainingSnapshot(),
    weakArea: weakAreaText(),
    next: { mode: rec.mode, level: rec.level, exerciseId: rec.exerciseId, title: rec.title, detail: rec.detail }
  };
}

function renderMilestones() {
  const earned = computeMilestones();
  $("milestones").innerHTML = earned.length ? earned.map(a => `<span class="achievement">${escapeHtml(a)}</span>`).join("") : "Start practising to unlock milestones.";
}

function renderProgressOverview() {
  const levelRows = [];
  for (const modeName of Object.keys(drills)) {
    for (let l = 1; l <= 4; l++) {
      const p = levelProgress(modeName, l);
      const attempts = allDrillsFor(modeName, l).reduce((sum, d) => sum + Number(exerciseProgress(d.id)?.attempts || 0), 0);
      const status = p.complete ? "COMPLETE" : (p.mastered || p.repeats || p.inProgress ? "IN PROGRESS" : "NOT STARTED");
      levelRows.push(`<tr><td>${escapeHtml(modeName)}</td><td>Level ${l}</td><td>${p.mastered}/${p.total}</td><td>${attempts}</td><td><span class="badge ${p.complete ? "pass" : ""}">${status}</span></td></tr>`);
    }
  }

  const startedExercises = core.allDrills(drills)
    .map(d => ({ ...d, progress: exerciseProgress(d.id) }))
    .filter(d => d.progress && d.progress.status !== "not_started")
    .sort((a, b) => new Date(b.progress.lastAttemptAt || b.progress.lastStartedAt || 0) - new Date(a.progress.lastAttemptAt || a.progress.lastStartedAt || 0));

  const exerciseRows = startedExercises.slice(0, 60).map(d => `<tr><td>${escapeHtml(d.id)}</td><td>${escapeHtml(d.mode)}</td><td>L${d.level}</td><td><span class="badge ${d.progress.status === "mastered" ? "pass" : d.progress.status === "repeat" ? "fail" : ""}">${escapeHtml(d.progress.status.toUpperCase().replaceAll("_", " "))}</span></td><td>${Number(d.progress.attempts || 0)}</td><td>${Number(d.progress.lastScore || 0)}</td><td>${Number(d.progress.bestAccuracy || 0).toFixed(1)}%</td><td>${Number(d.progress.bestWpm || 0) || "-"}</td></tr>`).join("");

  $("progressOverview").innerHTML = `<table><thead><tr><th>Domain</th><th>Level</th><th>Mastered</th><th>Attempts</th><th>Status</th></tr></thead><tbody>${levelRows.join("")}</tbody></table>${startedExercises.length ? `<h3 class="subheading">Started exercise detail</h3><table><thead><tr><th>Exercise</th><th>Domain</th><th>Level</th><th>Status</th><th>Attempts</th><th>Last score</th><th>Best accuracy</th><th>Best valid WPM</th></tr></thead><tbody>${exerciseRows}</tbody></table>` : ""}`;
}

function renderProgressUI() {
  renderOverallProgress();
  renderNextUp();
  renderDomainProgress();
  renderRepeatQueue();
  renderRecentMastered();
  renderWeakRecommendation();
  renderProgressOverview();
  renderMilestones();
  refreshModeOptions();
  refreshLevelOptions();
  updateDailyChallenge();
}

function editorFileName(modeName) {
  const names = {
    "Python Automation": "test_automation.py",
    "Selenium": "test_ui.py",
    "JMeter": "jmeter_script.groovy",
    "Postman": "postman_tests.js",
    "Mixed Testing": "qa_workflow.txt",
    "Right-Hand QA Focus": "qa_focus.txt"
  };
  return names[modeName] || "reference.txt";
}

function renderLineNumbers(element, count, activeLine = 0) {
  if (!element) return;
  const safeCount = Math.max(1, Number(count || 1));
  const active = Math.max(0, Number(activeLine || 0));
  element.innerHTML = Array.from({ length: safeCount }, (_, index) => {
    const line = index + 1;
    return `<span${line === active ? ' class="active"' : ""}>${line}</span>`;
  }).join("");
}

function updateEditorChrome() {
  const target = promptEl.textContent || "";
  const lineCount = Math.max(1, target.split("\n").length);
  const typedLineCount = Math.max(1, String(box.value || "").split("\n").length);
  const caret = core.lineColumn(box.value, Number(box.selectionStart || 0));
  renderLineNumbers(referenceLineNumbers, lineCount, Math.min(caret.line, lineCount));
  renderLineNumbers(typingLineNumbers, Math.max(lineCount, typedLineCount), caret.line);
  if (referenceFile) referenceFile.textContent = editorFileName(active?.mode || mode.value);
  if (referenceMeta) referenceMeta.textContent = activeExercise ? `${activeExercise.id} • Block ${exerciseBlockNumber}` : "Reference";
  if (referencePosition) referencePosition.textContent = `${lineCount} line${lineCount === 1 ? "" : "s"}`;
  if (caretStatus) caretStatus.textContent = `Ln ${caret.line}, Col ${caret.column}`;
}

function syncReferenceGutter() {
  if (referenceLineNumbers) referenceLineNumbers.style.transform = `translateY(-${Number(promptEl.scrollTop || 0)}px)`;
}

function syncEditorScroll() {
  if (!box || !promptEl) return;
  promptEl.scrollTop = box.scrollTop || 0;
  promptEl.scrollLeft = box.scrollLeft || 0;
  if (typingLineNumbers) typingLineNumbers.style.transform = `translateY(-${Number(box.scrollTop || 0)}px)`;
  syncReferenceGutter();
}

function updateEditorMatch(stats) {
  if (!editorMatchStatus) return;
  if (!active) {
    editorMatchStatus.textContent = "Ready";
    editorMatchStatus.className = "";
    return;
  }
  if (!box.value.length) {
    editorMatchStatus.textContent = "Start typing";
    editorMatchStatus.className = "";
    return;
  }
  if (Number(stats?.errors || 0) === 0) {
    editorMatchStatus.textContent = "Exact so far";
    editorMatchStatus.className = "good";
  } else if (Number(stats?.accuracy || 0) >= targetAccuracy) {
    editorMatchStatus.textContent = `${stats.errors} mismatch${stats.errors === 1 ? "" : "es"}`;
    editorMatchStatus.className = "warn";
  } else {
    editorMatchStatus.textContent = `${stats.errors} mismatch${stats.errors === 1 ? "" : "es"}`;
    editorMatchStatus.className = "bad";
  }
}

function handleTypingChange() {
  if (!active || finishing) {
    updateEditorChrome();
    return;
  }
  const first = compute();
  extendPromptIfComplete();
  const stats = active && !finishing ? compute() : first;
  updateEditorMatch(stats);
  updateEditorChrome();
  syncEditorScroll();
}

function applyEditorTab(event) {
  if (!active || finishing || box.disabled || event.key !== "Tab") return;
  event.preventDefault();
  const result = core.applyTabEdit(
    box.value,
    Number(box.selectionStart || 0),
    Number(box.selectionEnd ?? box.selectionStart ?? 0),
    Boolean(event.shiftKey),
    4
  );
  box.value = result.value;
  box.selectionStart = result.selectionStart;
  box.selectionEnd = result.selectionEnd;
  handleTypingChange();
}

function showRandomTip() {
  if (!typingTips.length) return;
  $("typingTip").textContent = typingTips[Math.floor(Math.random() * typingTips.length)];
}

function updateDailyChallenge() {
  const repeatCount = core.progressSummary(drills, progressState.exercises).repeatQueue.length;
  $("dailyChallenge").textContent = repeatCount
    ? `Clear at least one repeat-queue exercise at ${targetAccuracy}%+ accuracy before moving to new material.`
    : `Complete one Level 3 or 4 testing drill at 98%+ accuracy, then explain the best practice used in the code.`;
}

function compute() {
  const target = promptEl.textContent;
  const typed = box.value;
  const elapsedMs = startedAt ? Date.now() - startedAt : 0;
  const stats = core.calculateTypingStats(target, typed, elapsedMs, targetAccuracy, pasteAttempts);
  const b = stats.mistakeBreakdown;

  wpmEl.textContent = stats.wpm;
  accEl.textContent = `${stats.accuracy.toFixed(1)}%`;
  errEl.textContent = stats.errors;
  liveScoreEl.textContent = stats.liveScore;
  accEl.className = stats.accuracy >= targetAccuracy ? "good" : (stats.accuracy >= 95 ? "warn" : "bad");

  const regular = [["letters", b.letters], ["numbers", b.numbers], ["punctuation", b.punctuation], ["spaces", b.spaces], ["case", b.case]]
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${key}: ${value}`);
  $("mistakeSummary").textContent = `${regular.length ? regular.join(" | ") + " | " : ""}Right-hand errors: ${b.rightHand} | Left-hand errors: ${b.leftHand}`;
  $("charProgress").textContent = `${typed.length} / ${target.length} characters`;

  const totalHandErrors = b.rightHand + b.leftHand;
  if (totalHandErrors > 0) {
    const rightPct = Math.round((b.rightHand / totalHandErrors) * 100);
    $("handFocus").textContent = `Right-hand share of hand-classified errors: ${rightPct}%`;
    $("handFocus").className = rightPct >= 60 ? "hand-focus bad" : "hand-focus";
  } else {
    $("handFocus").textContent = "No hand-classified errors yet.";
    $("handFocus").className = "hand-focus good";
  }

  $("symbolFocus").textContent = b.symbolExpected ? `Technical symbol accuracy: ${b.symbolAccuracy.toFixed(1)}% (${b.symbolErrors} errors)` : "No technical symbols typed yet.";
  $("symbolFocus").className = b.symbolExpected && b.symbolAccuracy < targetAccuracy ? "hand-focus bad" : "hand-focus good";

  return { ...stats, charactersTyped: typed.length };
}

function setSetupDisabled(disabled) {
  mode.disabled = disabled;
  level.disabled = disabled;
  durationSel.disabled = disabled;
  revisionMode.disabled = disabled;
}

function setTime(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  timeEl.textContent = `${minutes}:${String(secs).padStart(2, "0")}`;
}

function buildSessionNote(stats, session) {
  const notes = [];
  if (session.completionStatus === "INTERRUPTED") notes.push("Session was interrupted. Resume the unfinished exercise before advancing.");
  else if (Number(stats.accuracy || 0) < targetAccuracy) notes.push(`Accuracy is below the ${targetAccuracy}% mastery gate. Reduce speed slightly and repeat the exercise.`);
  else if (Number(session.exerciseBlocksCompleted || 0) === 0) notes.push("No complete code block was finished. Resume this exercise next.");
  else notes.push("Accuracy gate met. Completed blocks count toward mastery.");

  const b = stats.mistakeBreakdown || {};
  const totalHand = Number(b.rightHand || 0) + Number(b.leftHand || 0);
  if (totalHand && Number(b.rightHand || 0) / totalHand >= 0.60) notes.push("Most hand-classified errors were on right-hand keys, use the Right-Hand QA Focus mode for reinforcement.");
  if (Number(b.symbolExpected || 0) >= 5 && Number(b.symbolAccuracy || 100) < targetAccuracy) notes.push("Technical punctuation is below the accuracy gate, slow down on brackets, quotes and operators.");
  if (Number(b.pasteAttempts || 0) > 0) notes.push("Paste/drop attempts were blocked and recorded.");
  return notes.join(" ");
}

function renderSessionRecap(session) {
  const completed = Array.isArray(session.exerciseIdsCompleted) ? session.exerciseIdsCompleted : [];
  const concepts = completed.map(id => getDrillById(id)?.concept).filter(Boolean);
  const current = getDrillById(session.currentExerciseId);
  if (current && !completed.includes(current.id)) concepts.push(`Resume ${current.id}: ${current.concept}`);
  $("recapText").textContent = concepts.length ? [...new Set(concepts)].slice(0, 5).join(" ") : "No complete code block was mastered in this session.";
  $("sessionNote").textContent = session.sessionNote || "";
  $("sessionRecap").classList.remove("hidden");
}

function extendPromptIfComplete() {
  if (!active || finishing || !activeExercise || box.value !== promptEl.textContent) return;

  completedExerciseBlocks++;
  if (activeExercise.id && !sessionCompletedExerciseIds.includes(activeExercise.id)) sessionCompletedExerciseIds.push(activeExercise.id);

  const next = chooseDrill({ excludeIds: sessionCompletedExerciseIds });
  if (!next && !revisionMode.checked) {
    activeExercise = null;
    $("learningFocus").textContent = `All remaining exercises in ${mode.value}, Level ${level.value} are complete for this session.`;
    finishSession("level_complete");
    return;
  }

  activeExercise = next;
  exerciseBlockNumber++;
  promptEl.textContent += `\n\n${activeExercise.text}`;
  $("learningFocus").textContent = `Block ${exerciseBlockNumber} | ${activeExercise.id} | ${activeExercise.concept}`;
  updateEditorChrome();
  markExerciseInProgress(activeExercise);
  showRandomTip();
}

async function refreshConfig() {
  try {
    const config = await fetchJson("/api/config", {}, 4000);
    targetAccuracy = Number(config.accuracyGate || 97);
    $("ruleBox").textContent = `Pass condition: ${targetAccuracy}% accuracy or higher and at least one complete code block. Paste is blocked. Speed does not compensate for poor accuracy.`;
    $("notifyStatus").textContent = config.notificationConfigured ? "Telegram configured" : "Telegram not configured";
  } catch {
    $("notifyStatus").textContent = "Server unavailable, local progress still works";
  }
  updateDailyChallenge();
}

function computeAchievements(completed) {
  const earned = new Set();
  if (completed.some(s => Number(s.accuracy) >= 98 && Number(s.exerciseBlocksCompleted || 0) > 0)) earned.add("Clean Run");
  let consecutive = 0;
  for (const s of completed.slice().reverse()) {
    if (s.passed) consecutive++;
    else consecutive = 0;
    if (consecutive >= 3) earned.add("Precision 3");
  }
  if (completed.some(s => {
    const rh = Number(s.mistakeBreakdown?.rightHand || 0);
    const lh = Number(s.mistakeBreakdown?.leftHand || 0);
    return rh + lh > 0 && rh / (rh + lh) <= 0.20;
  })) earned.add("Right Hand Recovery");
  if (completed.some(s => s.passed && Number(s.level) === 4)) earned.add("Advanced Technical Clean Run");
  if (completed.some(s => Number(s.wpm) >= 40 && Number(s.accuracy) >= Number(s.targetAccuracy || targetAccuracy))) earned.add("40 Club");
  if (completed.some(s => Number(s.mistakeBreakdown?.pasteAttempts || 0) === 0)) earned.add("Zero Paste");
  return [...earned];
}

async function fetchServerSessions() {
  try {
    const rows = await fetchJson("/api/sessions", {}, 5000);
    cachedServerSessions = Array.isArray(rows) ? rows : [];
    $("syncStatus").textContent = pendingSyncCount() ? `${pendingSyncCount()} session(s) pending server sync` : "Local + server history synced";
    return cachedServerSessions;
  } catch {
    cachedServerSessions = [];
    $("syncStatus").textContent = pendingSyncCount() ? `${pendingSyncCount()} session(s) pending server sync` : "Server offline, using local history";
    return [];
  }
}

function syncProgressFromSessions(rows) {
  const processed = new Set(progressState.processedSessionIds || []);
  const unsynced = (rows || []).filter(s => s?.id && s.completedAt && !processed.has(s.id)).sort((a, b) => sessionTimestamp(a) - sessionTimestamp(b));
  for (const session of unsynced) applySessionToProgress({ ...session, syncStatus: "synced" });
}

async function rehydrateMissingServerSessions(serverRows) {
  const serverIds = new Set((serverRows || []).map(s => s?.id).filter(Boolean));
  const missing = progressState.localSessions.filter(s => s?.id && s.completedAt && !serverIds.has(s.id));
  if (!missing.length) return serverRows || [];
  try {
    const data = await fetchJson("/api/sessions/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions: missing.slice(0, LOCAL_SESSION_LIMIT) })
    }, 7000);
    if (Array.isArray(data.sessions)) {
      cachedServerSessions = data.sessions;
      $("syncStatus").textContent = data.imported ? `Restored ${data.imported} local session(s) to server history` : "Local + server history synced";
      return cachedServerSessions;
    }
  } catch {}
  return serverRows || [];
}

async function syncPendingSessions() {
  const pending = progressState.localSessions.filter(s => s?.completedAt && s.syncStatus === "pending").slice().reverse();
  for (const session of pending) {
    try {
      const path = session.completionStatus === "INTERRUPTED" ? "/api/session/interrupt" : "/api/session/complete";
      const data = await fetchJson(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session)
      }, 5000);
      const canonical = data.session || session;
      rememberLocalSession({ ...canonical, syncStatus: "synced" });
      cachedServerSessions = [{ ...canonical }, ...cachedServerSessions.filter(s => s.id !== canonical.id)];
      saveProgressState();
    } catch {
      break;
    }
  }
}

function renderSummaryFromSessions() {
  const rows = mergeSessions();
  const summary = core.sessionSummary(rows, targetAccuracy);
  $("todayMinutes").textContent = `${summary.todayMinutes} min`;
  $("dailyTargetText").textContent = `Target ${TARGET_DAILY_MINUTES} min, ${Math.min(100, Math.round(summary.todayMinutes / TARGET_DAILY_MINUTES * 100))}% done`;
  $("avgAccuracy").textContent = `${summary.avgAccuracy}%`;
  $("bestWpm").textContent = summary.bestWpm;
  $("streak").textContent = `${summary.streak} day${summary.streak === 1 ? "" : "s"}`;
  $("weeklyMinutes").textContent = `${summary.weeklyMinutes} min`;

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekSessions = rows.filter(s => s.completedAt && new Date(s.startedAt) >= weekStart);
  const scoredWeekSessions = weekSessions.filter(s => s.completionStatus !== "INTERRUPTED" && Number(s.exerciseBlocksCompleted || 0) > 0);
  const average = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const validWpm = scoredWeekSessions.filter(s => Number(s.accuracy || 0) >= Number(s.targetAccuracy || targetAccuracy)).sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
  const masteredThisWeek = Object.values(progressState.exercises).filter(p => p.status === "mastered" && p.masteredAt && new Date(p.masteredAt) >= weekStart).length;
  let wpmChange = "-";
  if (validWpm.length >= 2) {
    const delta = Number(validWpm.at(-1).wpm || 0) - Number(validWpm[0].wpm || 0);
    wpmChange = `${delta > 0 ? "+" : ""}${delta} WPM`;
  } else if (validWpm.length === 1) {
    wpmChange = `${Number(validWpm[0].wpm || 0)} WPM baseline`;
  }
  $("weekPracticeTime").textContent = `${summary.weeklyMinutes} min`;
  $("weekSessions").textContent = weekSessions.length;
  $("weekMastered").textContent = masteredThisWeek;
  $("weekAccuracy").textContent = scoredWeekSessions.length ? `${average(scoredWeekSessions.map(s => Number(s.accuracy || 0))).toFixed(1)}%` : "0%";
  $("weekWpmChange").textContent = wpmChange;
}

function renderHistory() {
  const rows = mergeSessions();
  const completed = rows.filter(s => s.completedAt);
  if (!completed.length) {
    $("history").textContent = "No completed sessions yet.";
    $("achievements").textContent = "Complete sessions to unlock achievements.";
    return;
  }

  const achievements = computeAchievements(completed);
  $("achievements").innerHTML = achievements.length ? achievements.map(a => `<span class="achievement">${escapeHtml(a)}</span>`).join("") : "No achievements unlocked yet.";

  $("history").innerHTML = `<table><thead><tr><th>Date</th><th>Mode</th><th>Concept</th><th>Level</th><th>Blocks</th><th>Status</th><th>WPM</th><th>Accuracy</th><th>Symbols</th><th>Errors</th><th>RH/LH</th><th>Score</th><th>Sync</th></tr></thead><tbody>${completed.slice(0, 40).map(s => {
    const status = s.completionStatus || (s.passed ? "PASS" : Number(s.exerciseBlocksCompleted || 0) > 0 ? "REPEAT" : "INCOMPLETE");
    const badgeClass = status === "PASS" ? "pass" : status === "INTERRUPTED" || status === "REPEAT" ? "fail" : "";
    return `<tr><td>${escapeHtml(new Date(s.startedAt).toLocaleString())}</td><td>${escapeHtml(s.mode)}</td><td>${escapeHtml(s.exerciseConcept || "-")}</td><td>${escapeHtml(s.level || "-")}</td><td>${escapeHtml(s.exerciseBlocksCompleted ?? "-")}</td><td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td><td>${escapeHtml(s.wpm ?? "-")}</td><td>${s.accuracy == null ? "-" : `${Number(s.accuracy).toFixed(1)}%`}</td><td>${s.mistakeBreakdown?.symbolAccuracy == null ? "-" : `${Number(s.mistakeBreakdown.symbolAccuracy).toFixed(1)}%`}</td><td>${escapeHtml(s.errors ?? "-")}</td><td>${Number(s.mistakeBreakdown?.rightHand || 0)}/${Number(s.mistakeBreakdown?.leftHand || 0)}</td><td>${escapeHtml(s.score ?? "-")}</td><td>${escapeHtml(s.syncStatus || "server")}</td></tr>`;
  }).join("")}</tbody></table>`;
}

async function refreshData() {
  let serverRows = await fetchServerSessions();
  syncProgressFromSessions(serverRows);
  await syncPendingSessions();
  serverRows = await rehydrateMissingServerSessions(serverRows);
  cachedServerSessions = serverRows;
  renderSummaryFromSessions();
  renderHistory();
  renderProgressUI();
  renderTrendsAndMetrics();
  renderDiagnostics();
}

async function startSession() {
  if (active || finishing) return;
  duration = Number(durationSel.value);
  const preferredExerciseId = startBtn.dataset.preferredExerciseId || "";
  const preferred = preferredExerciseId ? getDrillById(preferredExerciseId) : null;
  let exercise = preferred && preferred.mode === mode.value && preferred.level === Number(level.value) && (revisionMode.checked || !isMastered(preferred.id)) ? preferred : chooseDrill();
  startBtn.dataset.preferredExerciseId = "";

  if (!exercise) {
    $("ruleBox").textContent = `Level ${level.value} is already complete. Choose another level or enable Revision Mode to practise mastered exercises.`;
    $("ruleBox").className = "rule good";
    renderNextUp();
    return;
  }

  activeExercise = exercise;
  exerciseBlockNumber = 1;
  completedExerciseBlocks = 0;
  sessionCompletedExerciseIds = [];
  promptEl.textContent = activeExercise.text;
  $("learningFocus").textContent = `Block ${exerciseBlockNumber} | ${activeExercise.id} | ${activeExercise.concept}`;
  $("sessionRecap").classList.add("hidden");
  showRandomTip();
  box.value = "";
  box.selectionStart = 0;
  box.selectionEnd = 0;
  box.scrollTop = 0;
  box.scrollLeft = 0;
  promptEl.scrollTop = 0;
  promptEl.scrollLeft = 0;
  pasteAttempts = 0;
  startedAt = Date.now();
  finishing = false;

  active = {
    id: createId(),
    trainee: "Aswin",
    mode: mode.value,
    level: Number(level.value),
    exerciseId: activeExercise.id,
    exerciseConcept: activeExercise.concept,
    targetAccuracy,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: null,
    revisionMode: revisionMode.checked,
    completionStatus: "IN_PROGRESS",
    syncStatus: "pending"
  };

  progressState.settings = {
    mode: mode.value,
    level: Number(level.value),
    duration,
    revisionMode: revisionMode.checked
  };
  progressState.lastActivity = {
    mode: active.mode,
    level: active.level,
    exerciseId: active.exerciseId,
    status: "in_progress",
    startedAt: active.startedAt,
    score: null,
    accuracy: null,
    wpm: null
  };
  markExerciseInProgress(activeExercise);
  active.telegramStartContext = buildTelegramStartContext(active.mode, active.level);
  saveProgressState();
  renderNextUp();
  setTime(duration);
  startBtn.disabled = true;
  finishBtn.disabled = false;
  setSetupDisabled(true);
  box.disabled = false;
  box.focus();
  updateEditorChrome();
  updateEditorMatch();
  syncEditorScroll();
  $("pasteStatus").textContent = "Paste blocked: 0 attempts";
  $("ruleBox").className = "rule";
  $("ruleBox").textContent = `Session active. Mastery requires ${targetAccuracy}%+ accuracy and at least one complete code block.`;

  const sessionId = active.id;
  clearInterval(timer);
  timer = setInterval(() => {
    if (!active || finishing) return;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const left = Math.max(0, duration - elapsed);
    setTime(left);
    compute();
    if (left <= 0) finishSession("timer");
  }, 500);

  try {
    const data = await fetchJson("/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...active, id: sessionId })
    });
    if (active && active.id === sessionId && data.session?.id === sessionId) {
      active = { ...active, ...data.session, syncStatus: "synced" };
    }
  } catch {
    if (active && active.id === sessionId) $("syncStatus").textContent = "Server offline, session will save locally";
  }
}

function buildCompletedSession(reason) {
  const stats = compute();
  const durationSeconds = Math.max(0, Math.min(duration, Math.floor((Date.now() - startedAt) / 1000)));
  const passed = stats.accuracy >= targetAccuracy && completedExerciseBlocks > 0;
  const completionStatus = passed ? "PASS" : (completedExerciseBlocks > 0 ? "REPEAT" : "INCOMPLETE");
  const session = {
    ...active,
    completedAt: new Date().toISOString(),
    wpm: stats.wpm,
    wpmFormula: "characters/5/minute",
    accuracy: stats.accuracy,
    errors: stats.errors,
    durationSeconds,
    mistakeBreakdown: stats.mistakeBreakdown,
    charactersTyped: stats.charactersTyped,
    exerciseBlocksCompleted: completedExerciseBlocks,
    exerciseIdsCompleted: [...sessionCompletedExerciseIds],
    currentExerciseId: activeExercise?.id || sessionCompletedExerciseIds.at(-1) || active?.exerciseId || null,
    passed,
    completionStatus,
    score: stats.liveScore,
    finishReason: reason || "manual",
    syncStatus: "pending"
  };
  session.sessionNote = buildSessionNote(stats, session);
  return session;
}

async function finishSession(reason = "manual") {
  if (!active || finishing) return;
  finishing = true;
  clearInterval(timer);

  const session = buildCompletedSession(reason);
  active = null;
  updateEditorMatch();
  updateEditorChrome();
  finishBtn.disabled = true;
  box.disabled = true;
  startBtn.disabled = true;
  resetBtn.disabled = true;
  setSetupDisabled(true);

  const beforeProgress = progressCheckpoint();
  applySessionToProgress(session, { force: true });
  session.telegramReport = buildTelegramCompletionReport(session, beforeProgress);
  rememberLocalSession(session);
  saveProgressState();
  renderSessionRecap(session);
  $("ruleBox").textContent = session.completionStatus === "PASS"
    ? `PASS: ${session.accuracy}% accuracy, ${session.wpm} WPM, score ${session.score}/100. Completed blocks saved.`
    : session.completionStatus === "INCOMPLETE"
      ? "INCOMPLETE: no full code block was completed. Resume this exercise next."
      : `REPEAT REQUIRED: ${session.accuracy}% accuracy is below the ${targetAccuracy}% gate.`;
  $("ruleBox").className = `rule ${session.completionStatus === "PASS" ? "good" : "bad"}`;

  try {
    const data = await fetchJson("/api/session/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session)
    }, 4500);
    if (data.session) {
      const canonical = { ...session, ...data.session, syncStatus: "synced" };
      rememberLocalSession(canonical);
      cachedServerSessions = [canonical, ...cachedServerSessions.filter(s => s.id !== canonical.id)];
      saveProgressState();
    }
  } catch {
    $("syncStatus").textContent = "Session saved locally, server sync pending";
  }

  finishing = false;
  startBtn.disabled = false;
  resetBtn.disabled = false;
  setSetupDisabled(false);
  showRandomTip();
  await refreshData();
}

function buildInterruptedSession(reason) {
  const stats = compute();
  const session = {
    ...active,
    completedAt: new Date().toISOString(),
    wpm: stats.wpm,
    wpmFormula: "characters/5/minute",
    accuracy: stats.accuracy,
    errors: stats.errors,
    durationSeconds: Math.max(0, Math.min(duration, Math.floor((Date.now() - startedAt) / 1000))),
    mistakeBreakdown: stats.mistakeBreakdown,
    charactersTyped: stats.charactersTyped,
    exerciseBlocksCompleted: completedExerciseBlocks,
    exerciseIdsCompleted: [...sessionCompletedExerciseIds],
    currentExerciseId: activeExercise?.id || active?.exerciseId || null,
    passed: false,
    completionStatus: "INTERRUPTED",
    score: stats.liveScore,
    finishReason: reason,
    syncStatus: "pending"
  };
  session.sessionNote = buildSessionNote(stats, session);
  return session;
}

function interruptActiveSession(reason = "RESET", useBeacon = false) {
  if (!active || finishing) return null;
  clearInterval(timer);
  const session = buildInterruptedSession(reason);
  const beforeProgress = progressCheckpoint();
  active = null;
  applySessionToProgress(session, { force: true });
  session.telegramReport = buildTelegramCompletionReport(session, beforeProgress);
  rememberLocalSession(session);
  saveProgressState();

  if (useBeacon && navigator.sendBeacon) {
    try {
      const blob = new Blob([JSON.stringify(session)], { type: "application/json" });
      navigator.sendBeacon("/api/session/interrupt", blob);
    } catch {}
  } else {
    fetch("/api/session/interrupt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
      keepalive: true
    }).catch(() => {});
  }
  return session;
}

function reset() {
  const interrupted = interruptActiveSession("RESET");
  startedAt = null;
  box.value = "";
  box.selectionStart = 0;
  box.selectionEnd = 0;
  box.scrollTop = 0;
  box.scrollLeft = 0;
  promptEl.scrollTop = 0;
  promptEl.scrollLeft = 0;
  pasteAttempts = 0;
  exerciseBlockNumber = 0;
  completedExerciseBlocks = 0;
  sessionCompletedExerciseIds = [];
  activeExercise = null;
  box.disabled = true;
  startBtn.disabled = false;
  finishBtn.disabled = true;
  setSetupDisabled(false);
  finishing = false;
  promptEl.textContent = "Press Start Practice to begin.";
  $("learningFocus").textContent = "Choose a testing domain and level. Each exercise includes a best-practice learning focus.";
  updateEditorChrome();
  updateEditorMatch();
  syncEditorScroll();
  wpmEl.textContent = "0";
  accEl.textContent = "100%";
  accEl.className = "";
  errEl.textContent = "0";
  liveScoreEl.textContent = "70";
  $("mistakeSummary").textContent = "No mistakes yet.";
  $("charProgress").textContent = "0 / 0 characters";
  $("handFocus").textContent = "Right-hand focus analytics will appear here.";
  $("handFocus").className = "hand-focus";
  $("symbolFocus").textContent = "Technical symbol accuracy will appear here.";
  $("symbolFocus").className = "hand-focus";
  $("pasteStatus").textContent = "Paste blocked: 0 attempts";
  $("ruleBox").className = "rule";
  $("ruleBox").textContent = interrupted ? "Previous session recorded as INTERRUPTED. It remains in the recommended queue." : `Pass condition: ${targetAccuracy}% accuracy or higher and at least one full code block.`;
  $("sessionRecap").classList.add("hidden");
  setTime(Number(durationSel.value));
  showRandomTip();
  renderProgressUI();
}

async function testNotification() {
  const btn = $("testNotifyBtn");
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Testing...";
  try {
    await fetchJson("/api/test-notification", { method: "POST" }, 7000);
    $("notifyStatus").textContent = "Telegram working";
  } catch {
    $("notifyStatus").textContent = "Telegram test failed";
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

function initializeSelections() {
  refreshModeOptions();
  mode.value = Object.keys(drills).includes(progressState.settings.mode) ? progressState.settings.mode : "Python Automation";
  refreshLevelOptions();
  level.value = String(Math.min(4, Math.max(1, Number(progressState.settings.level || 1))));
  durationSel.value = String([300, 600, 900, 1200].includes(Number(progressState.settings.duration)) ? Number(progressState.settings.duration) : 600);
  revisionMode.checked = Boolean(progressState.settings.revisionMode);
}

box.addEventListener("paste", event => {
  event.preventDefault();
  pasteAttempts++;
  $("pasteStatus").textContent = `Paste blocked: ${pasteAttempts} attempt${pasteAttempts === 1 ? "" : "s"}`;
});
box.addEventListener("drop", event => {
  event.preventDefault();
  pasteAttempts++;
  $("pasteStatus").textContent = `Drop/paste blocked: ${pasteAttempts} attempt${pasteAttempts === 1 ? "" : "s"}`;
});
box.addEventListener("beforeinput", event => {
  if (event.inputType === "insertFromPaste" || event.inputType === "insertFromDrop") event.preventDefault();
});
box.addEventListener("keydown", applyEditorTab);
box.addEventListener("input", handleTypingChange);
box.addEventListener("keyup", updateEditorChrome);
box.addEventListener("click", updateEditorChrome);
box.addEventListener("select", updateEditorChrome);
box.addEventListener("scroll", syncEditorScroll);
promptEl.addEventListener("scroll", syncReferenceGutter);

startBtn.addEventListener("click", () => startSession().catch(() => {
  $("ruleBox").textContent = "Unable to start the session cleanly. Reset and try again.";
  $("ruleBox").className = "rule bad";
}));
finishBtn.addEventListener("click", () => finishSession("manual"));
resetBtn.addEventListener("click", reset);
$("testNotifyBtn").addEventListener("click", testNotification);
durationSel.addEventListener("change", () => {
  if (!active) setTime(Number(durationSel.value));
  progressState.settings.duration = Number(durationSel.value);
  saveProgressState();
});
mode.addEventListener("change", () => {
  if (active) return;
  startBtn.dataset.preferredExerciseId = "";
  progressState.settings.mode = mode.value;
  progressState.settings.level = 1;
  refreshLevelOptions();
  level.value = "1";
  saveProgressState();
  updateEditorChrome();
});
level.addEventListener("change", () => {
  if (active) return;
  startBtn.dataset.preferredExerciseId = "";
  progressState.settings.level = Number(level.value);
  saveProgressState();
  updateEditorChrome();
});
revisionMode.addEventListener("change", () => {
  progressState.settings.revisionMode = revisionMode.checked;
  saveProgressState();
  $("ruleBox").textContent = revisionMode.checked ? "Revision Mode enabled. Mastered exercises may be selected, but revision attempts do not remove mastery." : `Normal progression mode. Mastered exercises will not be selected again.`;
});
continueBtn.addEventListener("click", () => {
  if (active) return;
  const recMode = continueBtn.dataset.mode;
  const recLevel = continueBtn.dataset.level;
  if (recMode) mode.value = recMode;
  refreshLevelOptions();
  if (recLevel) level.value = recLevel;
  revisionMode.checked = false;
  startBtn.dataset.preferredExerciseId = continueBtn.dataset.exerciseId || "";
  progressState.settings.mode = mode.value;
  progressState.settings.level = Number(level.value);
  progressState.settings.revisionMode = false;
  saveProgressState();
  startSession();
});

window.addEventListener("beforeunload", () => {
  if (active && !finishing) interruptActiveSession("PAGE_CLOSED", true);
});

initializeSelections();
renderProgressUI();
updateEditorChrome();
updateEditorMatch();
setTime(Number(durationSel.value));
showRandomTip();
refreshConfig();
refreshData();
