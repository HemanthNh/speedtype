const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const DATA_FILE = process.env.DATA_FILE ? path.resolve(process.env.DATA_FILE) : path.join(DATA_DIR, "sessions.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const REPORT_TIME_ZONE = process.env.REPORT_TIME_ZONE || "Asia/Kolkata";

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

function readSessions() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions) {
  const temp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(sessions, null, 2), "utf8");
  try {
    fs.renameSync(temp, DATA_FILE);
  } catch {
    fs.copyFileSync(temp, DATA_FILE);
    fs.unlinkSync(temp);
  }
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(obj));
}

function bodyJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let tooLarge = false;
    req.on("data", chunk => {
      if (tooLarge) return;
      data += chunk;
      if (data.length > 1_000_000) tooLarge = true;
    });
    req.on("end", () => {
      if (tooLarge) return reject(new Error("Request body too large"));
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (error) { reject(error); }
    });
    req.on("error", reject);
  });
}

function getTelegramConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || ""
  };
}

function safeTelegramContext(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  try {
    const raw = JSON.stringify(value);
    if (raw.length > 20000) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clampTelegramMessage(message) {
  const text = String(message || "");
  return text.length <= 3900 ? text : `${text.slice(0, 3860)}\n\n[Report shortened]`;
}

async function notifyTelegram(message) {
  const { token, chatId } = getTelegramConfig();
  if (!token || !chatId) return { ok: false, reason: "Telegram not configured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: clampTelegramMessage(message) }),
      signal: controller.signal
    });
    const raw = await response.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}
    return { ok: response.ok, status: response.status, response: data };
  } catch (error) {
    return { ok: false, reason: error.name === "AbortError" ? "Telegram request timed out" : error.message };
  } finally {
    clearTimeout(timeout);
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
  })[ext] || "application/octet-stream";
}

function serveStatic(req, res) {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || "localhost"}`); }
  catch { res.writeHead(400); res.end("Bad request"); return; }

  let relative;
  try { relative = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400); res.end("Bad request"); return; }
  if (relative === "/") relative = "/index.html";

  const filePath = path.resolve(PUBLIC_DIR, `.${relative}`);
  const publicPrefix = `${path.resolve(PUBLIC_DIR)}${path.sep}`;
  if (filePath !== path.resolve(PUBLIC_DIR) && !filePath.startsWith(publicPrefix)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, {
      "Content-Type": contentType(filePath),
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=300"
    });
    res.end(req.method === "HEAD" ? undefined : data);
  });
}

function dayKey(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function buildSummary(sessions) {
  const completed = sessions.filter(s => s.completedAt);
  const scored = completed.filter(s => s.completionStatus !== "INTERRUPTED" && Number(s.exerciseBlocksCompleted || 0) > 0);
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = completed.filter(s => dayKey(s.startedAt) === today);
  const avg = values => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const validWpm = scored.filter(s => Number(s.accuracy || 0) >= Number(s.targetAccuracy || 97));

  return {
    totalSessions: completed.length,
    todaySessions: todaySessions.length,
    todayMinutes: Math.round(todaySessions.reduce((sum, s) => sum + Number(s.durationSeconds || 0), 0) / 60),
    avgAccuracy: Number(avg(scored.map(s => Number(s.accuracy || 0))).toFixed(1)),
    avgWpm: Math.round(avg(validWpm.map(s => Number(s.wpm || 0)))),
    bestAccuracy: completed.length ? Number(Math.max(...completed.map(s => Number(s.accuracy || 0))).toFixed(1)) : 0,
    bestWpm: validWpm.length ? Math.max(...validWpm.map(s => Number(s.wpm || 0))) : 0
  };
}

function sanitizeSessionStart(body) {
  const startedAt = body.startedAt && !Number.isNaN(new Date(body.startedAt).getTime()) ? body.startedAt : new Date().toISOString();
  return {
    id: String(body.id || crypto.randomUUID()),
    trainee: String(body.trainee || "Aswin").slice(0, 100),
    mode: String(body.mode || "Python Automation").slice(0, 100),
    level: Math.min(4, Math.max(1, Number(body.level) || 1)),
    exerciseId: body.exerciseId ? String(body.exerciseId).slice(0, 100) : null,
    exerciseConcept: body.exerciseConcept ? String(body.exerciseConcept).slice(0, 500) : null,
    targetAccuracy: Math.min(100, Math.max(0, Number(body.targetAccuracy) || 97)),
    startedAt,
    completedAt: null,
    revisionMode: Boolean(body.revisionMode),
    wpm: null,
    accuracy: null,
    errors: null,
    durationSeconds: null,
    passed: null,
    score: null,
    mistakeBreakdown: null,
    exerciseBlocksCompleted: 0,
    exerciseIdsCompleted: [],
    currentExerciseId: body.exerciseId ? String(body.exerciseId).slice(0, 100) : null,
    completionStatus: "IN_PROGRESS",
    syncStatus: "server",
    telegramStartContext: safeTelegramContext(body.telegramStartContext),
    telegramReport: null
  };
}

function applyCompletion(target, body, forcedStatus = null) {
  target.trainee = String(body.trainee || target.trainee || "Aswin").slice(0, 100);
  target.mode = String(body.mode || target.mode || "Python Automation").slice(0, 100);
  target.level = Math.min(4, Math.max(1, Number(body.level || target.level) || 1));
  target.exerciseId = body.exerciseId || target.exerciseId || null;
  target.exerciseConcept = body.exerciseConcept || target.exerciseConcept || null;
  target.targetAccuracy = Math.min(100, Math.max(0, Number(body.targetAccuracy || target.targetAccuracy) || 97));
  target.startedAt = body.startedAt || target.startedAt || new Date().toISOString();
  target.completedAt = body.completedAt || new Date().toISOString();
  target.revisionMode = Boolean(body.revisionMode ?? target.revisionMode);
  target.wpm = Math.max(0, Number(body.wpm) || 0);
  target.wpmFormula = body.wpmFormula || "characters/5/minute";
  target.accuracy = Math.min(100, Math.max(0, Number(body.accuracy) || 0));
  target.errors = Math.max(0, Number(body.errors) || 0);
  target.durationSeconds = Math.max(0, Number(body.durationSeconds) || 0);
  target.mistakeBreakdown = body.mistakeBreakdown && typeof body.mistakeBreakdown === "object" ? body.mistakeBreakdown : {};
  target.charactersTyped = Math.max(0, Number(body.charactersTyped) || 0);
  target.exerciseBlocksCompleted = Math.max(0, Number(body.exerciseBlocksCompleted) || 0);
  target.exerciseIdsCompleted = Array.isArray(body.exerciseIdsCompleted) ? [...new Set(body.exerciseIdsCompleted.map(String))].slice(0, 100) : [];
  target.currentExerciseId = body.currentExerciseId || target.exerciseId || null;
  target.finishReason = body.finishReason || null;
  target.sessionNote = body.sessionNote ? String(body.sessionNote).slice(0, 2000) : "";
  target.telegramReport = safeTelegramContext(body.telegramReport) || target.telegramReport || null;
  target.syncStatus = "server";

  if (forcedStatus === "INTERRUPTED") {
    target.passed = false;
    target.completionStatus = "INTERRUPTED";
  } else {
    target.passed = target.accuracy >= target.targetAccuracy && target.exerciseBlocksCompleted > 0;
    target.completionStatus = target.passed ? "PASS" : (target.exerciseBlocksCompleted > 0 ? "REPEAT" : "INCOMPLETE");
  }

  const accuracyPoints = Math.min(70, target.accuracy * 0.70);
  const speedPoints = target.accuracy >= 95 ? Math.min(30, target.wpm * 0.60) : 0;
  target.score = Math.round(accuracyPoints + speedPoints);
  return target;
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "-");
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: REPORT_TIME_ZONE,
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function pct(value) {
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toFixed(1).replace(/\.0$/, "")}%` : "-";
}

function startMessage(session) {
  const c = session.telegramStartContext || {};
  const lines = [
    "TYPING TRAINING STARTED",
    "",
    `Trainee: ${session.trainee}`,
    `Mode: ${session.mode}`,
    `Level: ${session.level}`,
    `Exercise: ${session.exerciseId || "-"}`,
    `Learning focus: ${session.exerciseConcept || "-"}`,
    `Target accuracy: ${session.targetAccuracy}%`,
    `Started: ${formatTimestamp(session.startedAt)}`
  ];
  if (c.level) lines.push("", `Current level: ${c.level.mastered}/${c.level.total} mastered (${c.level.percent}%)`);
  if (c.domain) lines.push(`${session.mode}: ${c.domain.mastered}/${c.domain.total} mastered (${c.domain.percent}%)`);
  if (c.core) lines.push(`Core testing: ${c.core.mastered}/${c.core.total} mastered (${c.core.percent}%)`);
  if (c.overall) lines.push(`Overall: ${c.overall.mastered}/${c.overall.total} mastered (${c.overall.percent}%)`);
  if (Number.isFinite(Number(c.repeatQueue))) lines.push(`Repeat queue: ${Number(c.repeatQueue)}`);
  return lines.join("\n");
}

function completionMessage(session) {
  const r = session.telegramReport || {};
  const resultText = session.completionStatus === "PASS" ? "PASS" : session.completionStatus === "INTERRUPTED" ? "INTERRUPTED" : session.completionStatus === "INCOMPLETE" ? "INCOMPLETE" : "REPEAT REQUIRED";
  const lines = [
    "TYPING TRAINING REPORT",
    "",
    `Trainee: ${session.trainee}`,
    `Result: ${resultText}`,
    `Mode: ${session.mode}`,
    `Level: ${session.level}`,
    `Exercise: ${session.exerciseId || "-"}`,
    `Learning focus: ${session.exerciseConcept || "-"}`,
    `Duration: ${Math.round(session.durationSeconds / 60)} min`,
    "",
    "PERFORMANCE",
    `WPM: ${session.wpm}`,
    `Accuracy: ${pct(session.accuracy)} (target ${session.targetAccuracy}%)`,
    `Errors: ${session.errors}`,
    `Score: ${session.score}/100`,
    `Code blocks completed: ${session.exerciseBlocksCompleted}`
  ];

  if (r.level) lines.push("", "LEVEL PROGRESS", `${session.mode} L${session.level}: ${r.level.mastered}/${r.level.total} mastered (${r.level.percent}%)${r.level.complete ? " COMPLETE" : ""}`);
  if (r.domain) lines.push("", "DOMAIN PROGRESS", `${session.mode}: ${r.domain.mastered}/${r.domain.total} mastered (${r.domain.percent}%)${r.domain.complete ? " COMPLETE" : ""}`);
  if (r.core) lines.push("", "CORE TESTING PROGRESS", `${r.core.mastered}/${r.core.total} mastered (${r.core.percent}%)`);
  if (r.overall) lines.push("", "OVERALL PROGRESS", `${r.overall.mastered}/${r.overall.total} mastered (${r.overall.percent}%)`, `Completed levels: ${r.overall.completedLevels}/${r.overall.totalLevels}`, `Repeat queue: ${r.overall.repeatQueue}`);

  const mastered = Array.isArray(r.newlyMastered) ? r.newlyMastered : [];
  const repeat = Array.isArray(r.repeatRequired) ? r.repeatRequired : [];
  lines.push("", "THIS SESSION");
  lines.push(`Newly mastered: ${mastered.length ? mastered.join(", ") : "None"}`);
  lines.push(`Repeat required: ${repeat.length ? repeat.join(", ") : "None"}`);

  if (r.diagnostics) {
    lines.push("", "TYPING DIAGNOSTICS");
    if (Array.isArray(r.diagnostics.topErrors) && r.diagnostics.topErrors.length) lines.push(`Top errors: ${r.diagnostics.topErrors.map(x => `${x.key} (${x.count})`).join(", ")}`);
    lines.push(`Technical symbol accuracy: ${pct(r.diagnostics.symbolAccuracy)}`);
    lines.push(`Right-hand errors: ${Number(r.diagnostics.rightHand || 0)}`);
    lines.push(`Left-hand errors: ${Number(r.diagnostics.leftHand || 0)}`);
  }

  if (r.domainMetrics) {
    lines.push("", "DOMAIN PERFORMANCE", `Sessions: ${r.domainMetrics.sessions}`, `Average accuracy: ${pct(r.domainMetrics.avgAccuracy)}`, `Best accuracy: ${pct(r.domainMetrics.bestAccuracy)}`, `Average valid WPM: ${r.domainMetrics.avgValidWpm || "-"}`);
  }

  if (r.personalBest) {
    lines.push("", "PERSONAL BEST", `${session.mode} best valid WPM: ${r.personalBest.domainBestWpm || "-"}`, `Overall best valid WPM: ${r.personalBest.overallBestWpm || "-"}`);
  }

  if (r.trends && (r.trends.accuracy?.length || r.trends.wpm?.length)) {
    lines.push("", "RECENT TREND");
    if (r.trends.accuracy?.length) lines.push(`Accuracy: ${r.trends.accuracy.map(x => pct(x)).join(" -> ")}`);
    if (r.trends.wpm?.length) lines.push(`WPM: ${r.trends.wpm.join(" -> ")}`);
  }

  if (r.daily) lines.push("", "DAILY TARGET", `${r.daily.minutes}/${r.daily.targetMinutes} min${r.daily.complete ? " COMPLETE" : ""}`, `Current streak: ${Number(r.daily.streak || 0)} day(s)`);
  if (r.weekly) lines.push("", "ROLLING 7 DAYS", `Practice: ${r.weekly.minutes} min`, `Sessions: ${r.weekly.sessions}`, `Exercises mastered: ${r.weekly.mastered}`);
  if (r.weakArea) lines.push("", "WEAK-AREA GUIDANCE", r.weakArea);
  if (session.sessionNote) lines.push("", "SESSION NOTE", session.sessionNote);
  if (r.next) lines.push("", "RECOMMENDED NEXT", r.next.title || "Continue training", r.next.detail || "");

  return lines.filter((line, index, arr) => !(line === "" && arr[index - 1] === "")).join("\n");
}

function milestoneMessage(session) {
  const r = session.telegramReport || {};
  const milestones = Array.isArray(r.newMilestones) ? r.newMilestones : [];
  const levels = Array.isArray(r.newlyCompletedLevels) ? r.newlyCompletedLevels : [];
  const domains = Array.isArray(r.newlyCompletedDomains) ? r.newlyCompletedDomains : [];
  if (!milestones.length && !levels.length && !domains.length) return "";

  const lines = ["TRAINING MILESTONE ACHIEVED", "", `Trainee: ${session.trainee}`];
  if (levels.length) lines.push(`Level completed: ${levels.join(", ")}`);
  if (domains.length) lines.push(`Domain completed: ${domains.join(", ")}`);
  if (milestones.length) lines.push(`Milestones: ${milestones.join(", ")}`);
  if (r.core) lines.push(`Core testing progress: ${r.core.mastered}/${r.core.total} (${r.core.percent}%)`);
  if (r.overall) lines.push(`Overall progress: ${r.overall.mastered}/${r.overall.total} (${r.overall.percent}%)`);
  if (r.next) lines.push("", "Next:", r.next.title || "Continue training", r.next.detail || "");
  return lines.join("\n");
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || "localhost"}`); }
  catch { return sendJson(res, 400, { error: "Invalid URL" }); }

  if (req.method === "GET" && url.pathname === "/api/config") {
    const { token, chatId } = getTelegramConfig();
    return sendJson(res, 200, {
      notificationConfigured: Boolean(token && chatId),
      trainee: "Aswin",
      accuracyGate: 97,
      dailyTargetMinutes: 20
    });
  }

  if (req.method === "GET" && url.pathname === "/api/sessions") {
    return sendJson(res, 200, readSessions().slice().sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0)));
  }

  if (req.method === "GET" && url.pathname === "/api/summary") {
    return sendJson(res, 200, buildSummary(readSessions()));
  }

  if (req.method === "POST" && url.pathname === "/api/test-notification") {
    const result = await notifyTelegram("Typing Monitor test notification: Telegram connection is working.");
    return sendJson(res, result.ok ? 200 : 503, result);
  }


  if (req.method === "POST" && url.pathname === "/api/sessions/sync") {
    try {
      const body = await bodyJson(req);
      const incoming = Array.isArray(body.sessions) ? body.sessions.slice(0, 300) : [];
      const sessions = readSessions();
      let imported = 0;
      for (const item of incoming) {
        if (!item?.id || !item.completedAt) continue;
        const existing = sessions.find(s => s.id === String(item.id));
        if (existing) continue;
        const session = sanitizeSessionStart(item);
        applyCompletion(session, item, item.completionStatus === "INTERRUPTED" ? "INTERRUPTED" : null);
        sessions.push(session);
        imported++;
      }
      if (imported) writeSessions(sessions);
      return sendJson(res, 200, { imported, sessions: sessions.slice().sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0)) });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Invalid request" });
    }
  }

  if (req.method === "POST" && url.pathname === "/api/session/start") {
    try {
      const body = await bodyJson(req);
      const sessions = readSessions();
      const id = String(body.id || crypto.randomUUID());
      const existing = sessions.find(s => s.id === id);
      if (existing) return sendJson(res, 200, { session: existing, notification: { ok: false, reason: "Session already exists" } });

      const session = sanitizeSessionStart({ ...body, id });
      sessions.push(session);
      writeSessions(sessions);
      const notification = await notifyTelegram(startMessage(session));
      return sendJson(res, 201, { session, notification });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Invalid request" });
    }
  }

  if (req.method === "POST" && (url.pathname === "/api/session/complete" || url.pathname === "/api/session/interrupt")) {
    try {
      const body = await bodyJson(req);
      if (!body.id) return sendJson(res, 400, { error: "Session id is required" });

      const sessions = readSessions();
      let session = sessions.find(s => s.id === String(body.id));
      if (!session) {
        session = sanitizeSessionStart(body);
        sessions.push(session);
      }

      const incomingCompletedAt = body.completedAt ? new Date(body.completedAt).getTime() : 0;
      const existingCompletedAt = session.completedAt ? new Date(session.completedAt).getTime() : 0;
      if (existingCompletedAt && incomingCompletedAt && existingCompletedAt >= incomingCompletedAt && session.completionStatus !== "IN_PROGRESS") {
        return sendJson(res, 200, { session, notification: { ok: false, reason: "Already completed" } });
      }

      applyCompletion(session, body, url.pathname.endsWith("interrupt") ? "INTERRUPTED" : null);
      writeSessions(sessions);
      const notification = await notifyTelegram(completionMessage(session));
      const milestoneText = milestoneMessage(session);
      const milestoneNotification = milestoneText ? await notifyTelegram(milestoneText) : { ok: false, reason: "No new milestone" };
      return sendJson(res, 200, { session, notification, milestoneNotification });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || "Invalid request" });
    }
  }

  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 404, { error: "Not found" });
  serveStatic(req, res);
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`Typing Monitor v5.3 running at http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  startMessage,
  completionMessage,
  milestoneMessage,
  clampTelegramMessage,
  formatTimestamp
};
