const fs = require("fs");
const path = require("path");
const { createSessionStore } = require("../storage");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const file = path.resolve(process.argv[2] || path.join(__dirname, "..", "data", "sessions.json"));
  if (!fs.existsSync(file)) throw new Error(`JSON history not found: ${file}`);
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("Session history JSON must be an array");
  const rows = parsed.filter(row => row && row.id && row.startedAt);
  const store = createSessionStore({ databaseUrl: process.env.DATABASE_URL });
  try {
    await store.init();
    const imported = await store.importSessions(rows);
    const total = (await store.listSessions()).length;
    console.log(`Imported ${imported} session(s). PostgreSQL now contains ${total} session(s).`);
  } finally {
    await store.close();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
