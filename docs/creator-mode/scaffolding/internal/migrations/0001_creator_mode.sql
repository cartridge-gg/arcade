-- Creator mode baseline schema

CREATE TABLE IF NOT EXISTS creator_projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  github_repo TEXT,
  default_branch TEXT NOT NULL DEFAULT 'main',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES creator_projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plan_versions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES plan_sessions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  plan_graph_json JSONB NOT NULL,
  assumptions_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  completeness_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, version)
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES creator_projects(id) ON DELETE CASCADE,
  plan_version_id TEXT NOT NULL REFERENCES plan_versions(id),
  harness TEXT NOT NULL,
  status TEXT NOT NULL,
  target_envs TEXT[] NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS run_steps (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  depends_on JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  error_code TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  UNIQUE(run_id, step_key, attempt)
);

CREATE TABLE IF NOT EXISTS run_events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  sequence BIGINT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(run_id, sequence)
);

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  step_id TEXT REFERENCES run_steps(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  uri TEXT NOT NULL,
  checksum TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  world_address TEXT,
  tx_hashes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  manifest_uri TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sandbox_leases (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE REFERENCES runs(id) ON DELETE CASCADE,
  k8s_job_name TEXT NOT NULL,
  pod_name TEXT,
  node_type TEXT,
  cpu_limit_millicores INTEGER NOT NULL,
  mem_limit_mb INTEGER NOT NULL,
  deadline_ts TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_quotas (
  workspace_id TEXT PRIMARY KEY,
  max_concurrent_runs INTEGER NOT NULL,
  max_run_minutes INTEGER NOT NULL,
  max_monthly_tokens BIGINT NOT NULL,
  max_monthly_runtime_minutes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_ledger (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  tokens_in BIGINT NOT NULL DEFAULT 0,
  tokens_out BIGINT NOT NULL DEFAULT 0,
  runtime_seconds BIGINT NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(12,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_projects_workspace ON creator_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_plan_sessions_project ON plan_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_plan_versions_session ON plan_versions(session_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_runs_project_created ON runs(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_run_steps_run ON run_steps(run_id, step_key);
CREATE INDEX IF NOT EXISTS idx_run_events_run_seq ON run_events(run_id, sequence);
CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts(run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_run ON deployments(run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_workspace_created ON usage_ledger(workspace_id, created_at DESC);
