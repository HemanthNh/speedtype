const { createSessionStore } = require("../storage");

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const store = createSessionStore({ databaseUrl: process.env.DATABASE_URL });
  try {
    const health = await store.health();
    if (!health.ok) throw new Error(health.error || "Database health check failed");
    const rows = await store.listSessions();
    console.log(`PostgreSQL connection OK. ${rows.length} session(s) stored.`);
  } finally {
    await store.close();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
