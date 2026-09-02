const fs = require('fs');
const path = require('path');

function sortSessions(rows) {
  return rows.slice().sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
}

function createFileStore(dataFile) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]', 'utf8');

  function readAllSync() {
    try {
      const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeAllSync(sessions) {
    const temp = `${dataFile}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(sessions, null, 2), 'utf8');
    try {
      fs.renameSync(temp, dataFile);
    } catch {
      fs.copyFileSync(temp, dataFile);
      fs.unlinkSync(temp);
    }
  }

  return {
    mode: 'file',
    persistent: false,
    async init() {},
    async health() { return { ok: true, mode: 'file', persistent: false }; },
    async listSessions() { return sortSessions(readAllSync()); },
    async getSession(id) { return readAllSync().find(row => row.id === String(id)) || null; },
    async createSession(session) {
      const sessions = readAllSync();
      const existing = sessions.find(row => row.id === String(session.id));
      if (existing) return { created: false, session: existing };
      sessions.push(session);
      writeAllSync(sessions);
      return { created: true, session };
    },
    async upsertSession(session) {
      const sessions = readAllSync();
      const index = sessions.findIndex(row => row.id === String(session.id));
      if (index >= 0) sessions[index] = session;
      else sessions.push(session);
      writeAllSync(sessions);
      return session;
    },
    async importSessions(incoming) {
      const sessions = readAllSync();
      const known = new Set(sessions.map(row => String(row.id)));
      let imported = 0;
      for (const session of incoming) {
        if (!session?.id || known.has(String(session.id))) continue;
        sessions.push(session);
        known.add(String(session.id));
        imported += 1;
      }
      if (imported) writeAllSync(sessions);
      return imported;
    },
    async close() {}
  };
}

function createPostgresStore(databaseUrl) {
  let Pool;
  try {
    ({ Pool } = require('pg'));
  } catch (error) {
    throw new Error('PostgreSQL driver is missing. Run npm install before starting the app.');
  }

  const sslDisabled = String(process.env.DATABASE_SSL || '').toLowerCase() === 'false';
  const rejectUnauthorized = String(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED || '').toLowerCase() === 'true';
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslDisabled ? false : { rejectUnauthorized },
    max: Math.max(1, Number(process.env.DATABASE_POOL_MAX) || 5),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  let initPromise = null;
  function init() {
    if (!initPromise) {
      initPromise = pool.query(`
        CREATE TABLE IF NOT EXISTS typing_sessions (
          id TEXT PRIMARY KEY,
          trainee TEXT NOT NULL,
          mode TEXT NOT NULL,
          level INTEGER NOT NULL,
          exercise_id TEXT,
          started_at TIMESTAMPTZ NOT NULL,
          completed_at TIMESTAMPTZ,
          completion_status TEXT NOT NULL,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_typing_sessions_started_at
          ON typing_sessions (started_at DESC);
        CREATE INDEX IF NOT EXISTS idx_typing_sessions_completed_at
          ON typing_sessions (completed_at DESC);
        CREATE INDEX IF NOT EXISTS idx_typing_sessions_mode_level
          ON typing_sessions (mode, level);
      `).catch(error => {
        initPromise = null;
        throw error;
      });
    }
    return initPromise;
  }

  function columns(session) {
    return [
      String(session.id),
      String(session.trainee || 'Aswin'),
      String(session.mode || 'Python Automation'),
      Math.min(4, Math.max(1, Number(session.level) || 1)),
      session.exerciseId ? String(session.exerciseId) : null,
      session.startedAt || new Date().toISOString(),
      session.completedAt || null,
      String(session.completionStatus || 'IN_PROGRESS'),
      JSON.stringify(session)
    ];
  }

  async function listSessions() {
    await init();
    const result = await pool.query('SELECT data FROM typing_sessions ORDER BY started_at DESC');
    return result.rows.map(row => row.data);
  }

  return {
    mode: 'postgres',
    persistent: true,
    init,
    async health() {
      try {
        await init();
        await pool.query('SELECT 1');
        return { ok: true, mode: 'postgres', persistent: true };
      } catch (error) {
        return { ok: false, mode: 'postgres', persistent: true, error: error.message };
      }
    },
    listSessions,
    async getSession(id) {
      await init();
      const result = await pool.query('SELECT data FROM typing_sessions WHERE id = $1', [String(id)]);
      return result.rows[0]?.data || null;
    },
    async createSession(session) {
      await init();
      const values = columns(session);
      const result = await pool.query(`
        INSERT INTO typing_sessions
          (id, trainee, mode, level, exercise_id, started_at, completed_at, completion_status, data)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
        ON CONFLICT (id) DO NOTHING
        RETURNING data
      `, values);
      if (result.rows.length) return { created: true, session: result.rows[0].data };
      const existingResult = await pool.query('SELECT data FROM typing_sessions WHERE id = $1', [String(session.id)]);
      return { created: false, session: existingResult.rows[0]?.data || session };
    },
    async upsertSession(session) {
      await init();
      const values = columns(session);
      const result = await pool.query(`
        INSERT INTO typing_sessions
          (id, trainee, mode, level, exercise_id, started_at, completed_at, completion_status, data)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
        ON CONFLICT (id) DO UPDATE SET
          trainee = EXCLUDED.trainee,
          mode = EXCLUDED.mode,
          level = EXCLUDED.level,
          exercise_id = EXCLUDED.exercise_id,
          started_at = EXCLUDED.started_at,
          completed_at = EXCLUDED.completed_at,
          completion_status = EXCLUDED.completion_status,
          data = EXCLUDED.data,
          updated_at = NOW()
        RETURNING data
      `, values);
      return result.rows[0].data;
    },
    async importSessions(incoming) {
      await init();
      if (!incoming.length) return 0;
      const client = await pool.connect();
      let imported = 0;
      try {
        await client.query('BEGIN');
        for (const session of incoming) {
          const values = columns(session);
          const result = await client.query(`
            INSERT INTO typing_sessions
              (id, trainee, mode, level, exercise_id, started_at, completed_at, completion_status, data)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
            ON CONFLICT (id) DO NOTHING
          `, values);
          imported += result.rowCount || 0;
        }
        await client.query('COMMIT');
        return imported;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async close() { await pool.end(); }
  };
}

function createSessionStore(options = {}) {
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL ?? '';
  const dataFile = options.dataFile || process.env.DATA_FILE || path.join(__dirname, 'data', 'sessions.json');
  if (databaseUrl) return createPostgresStore(databaseUrl);
  return createFileStore(path.resolve(dataFile));
}

module.exports = { createSessionStore };
