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
