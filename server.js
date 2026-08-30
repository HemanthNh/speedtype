const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PUBLIC_DIR = path.join(__dirname, "public");

function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
}

function bodyJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
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

async function notifyTelegram(message) {
  const { token, chatId } = getTelegramConfig();
  if (!token || !chatId) {
    return { ok: false, configured: false, reason: "Telegram not configured" };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });

    let telegramResponse = null;
    try { telegramResponse = await response.json(); }
    catch { telegramResponse = null; }

    return {
      ok: response.ok,
      configured: true,
      status: response.status,
      response: telegramResponse
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      reason: error.message
    };
  }
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon"
  })[ext] || "application/octet-stream";
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  const relativePath = pathname.replace(/^\/+/, "");
  const filePath = path.resolve(PUBLIC_DIR, relativePath);
  const relative = path.relative(PUBLIC_DIR, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(data);
  });
}

function calculateResult(body) {
  const accuracy = Number(body.accuracy) || 0;
  const wpm = Number(body.wpm) || 0;
  const targetAccuracy = Number(body.targetAccuracy) || 97;
  const accuracyPoints = Math.min(70, accuracy * 0.70);
  const speedPoints = accuracy >= 95 ? Math.min(30, wpm * 0.60) : 0;

  return {
    ...body,
    completedAt: body.completedAt || new Date().toISOString(),
    accuracy,
    wpm,
    targetAccuracy,
    passed: accuracy >= targetAccuracy,
    score: Math.round(accuracyPoints + speedPoints)
  };
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/config") {
      const { token, chatId } = getTelegramConfig();
      return sendJson(res, 200, {
        notificationConfigured: Boolean(token && chatId),
        trainee: "Aswin",
        accuracyGate: 97,
        dailyTargetMinutes: 20,
        persistence: "localStorage"
      });
    }

    if (req.method === "POST" && url.pathname === "/api/test-notification") {
      const result = await notifyTelegram("Typing Monitor test notification: Telegram connection is working.");
      return sendJson(res, result.ok ? 200 : 503, result);
    }

    if (req.method === "POST" && url.pathname === "/api/session/start") {
      try {
        const body = await bodyJson(req);
        const startedAt = body.startedAt || new Date().toISOString();
        const session = {
          id: String(body.id || Date.now()),
          trainee: body.trainee || "Aswin",
          mode: body.mode || "Accuracy",
          level: Number(body.level) || 1,
          targetAccuracy: Number(body.targetAccuracy) || 97,
          startedAt
        };

        const message = `${session.trainee} started typing practice.\nMode: ${session.mode}\nLevel: ${session.level}\nTarget accuracy: ${session.targetAccuracy}%\nStarted: ${new Date(startedAt).toLocaleString()}`;
        const notification = await notifyTelegram(message);

        return sendJson(res, 201, { session, notification });
      } catch {
        return sendJson(res, 400, { error: "Invalid request" });
      }
    }

    if (req.method === "POST" && url.pathname === "/api/session/complete") {
      try {
        const body = await bodyJson(req);
        const session = calculateResult(body);
        const minutes = Math.max(1, Math.round((Number(session.durationSeconds) || 0) / 60));
        const resultText = session.passed ? "PASS" : "REPEAT REQUIRED";
        const message = `${session.trainee || "Aswin"} completed typing practice.\nResult: ${resultText}\nMode: ${session.mode || "Accuracy"}, Level ${Number(session.level) || 1}\nAccuracy: ${session.accuracy}% (target ${session.targetAccuracy}%)\nWPM: ${session.wpm}\nErrors: ${Number(session.errors) || 0}\nScore: ${session.score}/100\nDuration: ${minutes} min`;
        const notification = await notifyTelegram(message);

        return sendJson(res, 200, { session, notification });
      } catch {
        return sendJson(res, 400, { error: "Invalid request" });
      }
    }

    serveStatic(req, res);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  const host = "0.0.0.0";
  const server = createServer();
  server.listen(port, host, () => {
    console.log(`Typing Monitor running on http://${host}:${port}`);
  });
}

module.exports = { createServer, notifyTelegram, calculateResult, getTelegramConfig };
