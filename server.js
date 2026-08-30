
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "sessions.json");
const PUBLIC_DIR = path.join(__dirname, "public");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");

function readSessions() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return []; }
}
function writeSessions(sessions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(sessions, null, 2));
}
function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}
function bodyJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
  });
}

function getTelegramConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || ""
  };
}

async function notifyTelegram(message) {
  const { token, chatId } = getTelegramConfig();
  if (!token || !chatId) return { ok: false, reason: "Telegram not configured" };
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    const raw = await r.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}
    return { ok: r.ok, status: r.status, response: data };
  } catch (e) {
    return { ok: false, reason: e.message };
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
  const u = new URL(req.url, `http://${req.headers.host}`);
  let rel = decodeURIComponent(u.pathname);
  if (rel === "/") rel = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(data);
  });
}

function dayKey(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

function buildSummary(sessions) {
  const completed = sessions.filter(s => s.completedAt);
  const today = new Date().toISOString().slice(0,10);
  const todaySessions = completed.filter(s => dayKey(s.startedAt) === today);
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const bestAcc = completed.length ? Math.max(...completed.map(s => Number(s.accuracy)||0)) : 0;
  const bestWpm = completed.length ? Math.max(...completed.map(s => Number(s.wpm)||0)) : 0;

  // consecutive UTC-day streak with at least one completed session
  const days = [...new Set(completed.map(s => dayKey(s.startedAt)))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setUTCHours(0,0,0,0);
  for (let i=0; i<days.length; i++) {
    const expected = cursor.toISOString().slice(0,10);
    if (days[i] === expected) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate()-1);
    } else if (i===0 && days[i] < expected) {
      cursor.setUTCDate(cursor.getUTCDate()-1);
      if (days[i] === cursor.toISOString().slice(0,10)) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate()-1);
      } else break;
    } else break;
  }

  return {
    totalSessions: completed.length,
    todaySessions: todaySessions.length,
    todayMinutes: Math.round(todaySessions.reduce((a,s)=>a+(Number(s.durationSeconds)||0),0)/60),
    avgAccuracy: Number(avg(completed.map(s=>Number(s.accuracy)||0)).toFixed(1)),
    avgWpm: Math.round(avg(completed.map(s=>Number(s.wpm)||0))),
    bestAccuracy: Number(bestAcc.toFixed(1)),
    bestWpm,
    streak
  };
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && u.pathname === "/api/config") {
    const { token, chatId } = getTelegramConfig();
    return sendJson(res, 200, {
      notificationConfigured: Boolean(token && chatId),
      trainee: "Aswin",
      accuracyGate: 97,
      dailyTargetMinutes: 20
    });
  }

  if (req.method === "GET" && u.pathname === "/api/sessions") {
    return sendJson(res, 200, readSessions().slice().reverse());
  }

  if (req.method === "GET" && u.pathname === "/api/summary") {
    return sendJson(res, 200, buildSummary(readSessions()));
  }

  if (req.method === "POST" && u.pathname === "/api/test-notification") {
    const result = await notifyTelegram("Typing Monitor test notification: Telegram connection is working.");
    return sendJson(res, result.ok ? 200 : 500, result);
  }

  if (req.method === "POST" && u.pathname === "/api/session/start") {
    try {
      const b = await bodyJson(req);
      const sessions = readSessions();
      const session = {
        id: Date.now().toString(),
        trainee: b.trainee || "Aswin",
        mode: b.mode || "Accuracy",
        level: Number(b.level) || 1,
        exerciseId: b.exerciseId || null,
        exerciseConcept: b.exerciseConcept || null,
        targetAccuracy: Number(b.targetAccuracy) || 97,
        startedAt: new Date().toISOString(),
        completedAt: null,
        wpm: null,
        accuracy: null,
        errors: null,
        durationSeconds: null,
        passed: null,
        score: null,
        mistakeBreakdown: null,
        exerciseBlocksCompleted: 0
      };
      sessions.push(session);
      writeSessions(sessions);

      const msg =
`${session.trainee} started typing practice.
Mode: ${session.mode}
Level: ${session.level}
Exercise: ${session.exerciseId || "-"}
Learning focus: ${session.exerciseConcept || "-"}
Target accuracy: ${session.targetAccuracy}%
Started: ${new Date(session.startedAt).toLocaleString()}`;

      const notification = await notifyTelegram(msg);
      return sendJson(res, 201, { session, notification });
    } catch {
      return sendJson(res, 400, { error: "Invalid request" });
    }
  }

  if (req.method === "POST" && u.pathname === "/api/session/complete") {
    try {
      const b = await bodyJson(req);
      const sessions = readSessions();
      const s = sessions.find(x => x.id === b.id);
      if (!s) return sendJson(res, 404, { error: "Session not found" });

      s.completedAt = new Date().toISOString();
      s.wpm = Number(b.wpm) || 0;
      s.accuracy = Number(b.accuracy) || 0;
      s.errors = Number(b.errors) || 0;
      s.durationSeconds = Number(b.durationSeconds) || 0;
      s.mistakeBreakdown = b.mistakeBreakdown || {};
      s.exerciseBlocksCompleted = Number(b.exerciseBlocksCompleted) || 0;
      s.passed = s.accuracy >= s.targetAccuracy;

      // accuracy-first score, speed only contributes meaningfully after accuracy is decent
      const accuracyPoints = Math.min(70, s.accuracy * 0.70);
      const speedPoints = s.accuracy >= 95 ? Math.min(30, s.wpm * 0.60) : 0;
      s.score = Math.round(accuracyPoints + speedPoints);

      writeSessions(sessions);

      const mins = Math.max(1, Math.round(s.durationSeconds / 60));
      const resultText = s.passed ? "PASS" : "REPEAT REQUIRED";
      const msg =
`${s.trainee} completed typing practice.
Result: ${resultText}
Mode: ${s.mode}, Level ${s.level}
Exercise: ${s.exerciseId || "-"}
Accuracy: ${s.accuracy}% (target ${s.targetAccuracy}%)
WPM: ${s.wpm}
Errors: ${s.errors}
Completed code blocks: ${s.exerciseBlocksCompleted}
Score: ${s.score}/100
Duration: ${mins} min`;

      const notification = await notifyTelegram(msg);
      return sendJson(res, 200, { session: s, notification });
    } catch {
      return sendJson(res, 400, { error: "Invalid request" });
    }
  }

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Typing Monitor Testing Edition running at http://localhost:${PORT}`);
  console.log(`LAN access: http://<THIS-PC-IP>:${PORT}`);
});
