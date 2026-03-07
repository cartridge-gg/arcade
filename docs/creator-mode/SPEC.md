# Creator Mode Technical SPEC

## 1. Document Control
- System: Creator Mode Orchestration + UI
- Last updated: 2026-02-24
- Language/runtime assumptions:
  - Backend control plane in Go (within `cartridge-gg/internal`)
  - Frontend integration in existing React app
  - Execution sandboxes on Kubernetes

## 2. Architecture Overview

### 2.1 Components
1. Creator API (Go)
- Project, planning, run, deployment, quota APIs.
- AuthZ and workspace RBAC enforcement.

2. Planner Service (Go + harness adapter)
- Manages interactive clarification loop.
- Produces structured plan graph and completeness scoring.

3. Run Orchestrator (Go)
- Converts approved plan version into executable DAG.
- Manages queueing, scheduling, state transitions, retries.

4. Sandbox Controller (Go)
- Creates/monitors Kubernetes Jobs.
- Streams logs/events and enforces runtime/resource limits.

5. Harness Adapter Layer
- Provider-neutral interface with adapters:
  - CodexAdapter
  - ClaudeAdapter
  - GeminiAdapter

6. Artifact + State Stores
- PostgreSQL for system-of-record state.
- Object storage for logs/artifacts/checkpoints.
- GitHub repo per project for source persistence.

7. Creator UI (React)
- Planning chat + editable plan tree.
- Run timeline, live logs, artifacts, deployment panel.

### 2.2 High-Level Data Flow
1. User creates project -> GitHub repo provisioned.
2. User starts planning session -> planner asks clarifications -> plan versions stored.
3. User approves plan -> run created with selected harness.
4. Orchestrator acquires quota -> launches K8s Job.
5. Sandbox executes steps, emits events, pushes commits/artifacts.
6. Build/test/deploy outputs persisted and shown in UI.

## 3. Domain Model

### 3.1 Core Entities
- `creator_projects`
  - `id`, `workspace_id`, `name`, `github_repo`, `default_branch`, `status`, `created_at`

- `plan_sessions`
  - `id`, `project_id`, `status` (`draft`, `awaiting_user`, `ready_for_approval`, `approved`, `archived`), `created_by`, `created_at`

- `plan_versions`
  - `id`, `session_id`, `version`, `plan_graph_json`, `completeness_score`, `assumptions_json`, `created_at`

- `runs`
  - `id`, `project_id`, `plan_version_id`, `harness`, `status` (`queued`, `starting`, `running`, `paused`, `failed`, `succeeded`, `canceled`), `started_at`, `finished_at`, `cost_estimate`

- `run_steps`
  - `id`, `run_id`, `step_key`, `depends_on`, `status`, `attempt`, `started_at`, `finished_at`, `summary`, `error_code`

- `run_events`
  - `id`, `run_id`, `sequence`, `event_type`, `payload_json`, `created_at`

- `artifacts`
  - `id`, `run_id`, `step_id`, `type`, `uri`, `checksum`, `metadata_json`, `created_at`

- `deployments`
  - `id`, `run_id`, `environment` (`devnet`, `sepolia`), `status`, `world_address`, `tx_hashes_json`, `manifest_uri`, `created_at`

- `sandbox_leases`
  - `id`, `run_id`, `k8s_job_name`, `pod_name`, `node_type`, `cpu_limit`, `mem_limit_mb`, `deadline_ts`, `status`

- `workspace_quotas`
  - `workspace_id`, `max_concurrent_runs`, `max_run_minutes`, `max_monthly_tokens`, `max_monthly_runtime_minutes`

- `usage_ledger`
  - `id`, `workspace_id`, `run_id`, `provider`, `tokens_in`, `tokens_out`, `runtime_seconds`, `estimated_cost_usd`

## 4. API Contracts

## 4.1 Projects
### `POST /v1/creator/projects`
Request:
```json
{
  "workspace_id": "ws_123",
  "name": "dojo-roguelike",
  "github_owner": "team-or-user",
  "template": "dojo-cartridge-skill-game"
}
```
Response:
```json
{
  "project_id": "proj_abc",
  "status": "active",
  "github_repo": "https://github.com/team-or-user/dojo-roguelike"
}
```

## 4.2 Planning
### `POST /v1/creator/projects/{id}/plan/sessions`
Creates planning session and initial draft plan.

### `POST /v1/creator/projects/{id}/plan/sessions/{sid}/messages`
Request:
```json
{
  "role": "user",
  "content": "Game should include quests and leaderboard with referral rewards"
}
```
Response includes:
- next clarifying question OR
- updated `plan_version` with `ready_for_approval=true`

### `POST /v1/creator/projects/{id}/plan/sessions/{sid}/approve`
Locks selected plan version for execution.

## 4.3 Runs
### `POST /v1/creator/projects/{id}/runs`
Request:
```json
{
  "plan_version_id": "pv_17",
  "harness": "codex",
  "target_envs": ["devnet", "sepolia"]
}
```
Response:
```json
{
  "run_id": "run_987",
  "status": "queued"
}
```

### `GET /v1/creator/projects/{id}/runs/{runId}`
Returns run metadata, step graph, resource usage, and deployment summary.

### `GET /v1/creator/projects/{id}/runs/{runId}/events`
- SSE stream.
- Supports `Last-Event-ID` replay.

### `POST /v1/creator/projects/{id}/runs/{runId}/cancel`
Graceful stop; kill pod; mark run canceled.

## 4.4 Deployments
### `POST /v1/creator/projects/{id}/deployments`
Creates deployment task from run artifact set.

## 5. Harness Adapter Interface

```go
type HarnessAdapter interface {
    Name() string
    ValidateCredentials(ctx context.Context, creds WorkspaceCredentials) error
    StartStep(ctx context.Context, req StepRequest) (StepHandle, error)
    PollStep(ctx context.Context, handle StepHandle) (StepProgress, error)
    CancelStep(ctx context.Context, handle StepHandle) error
    Usage(ctx context.Context, handle StepHandle) (UsageMetrics, error)
}
```

Normalization requirements:
- Map provider-native statuses to standard step statuses.
- Normalize usage fields (input/output tokens, billed units).
- Normalize error categories (`rate_limit`, `invalid_auth`, `tool_failure`, `provider_unavailable`, `unknown`).

## 6. Planning Engine Design

### 6.1 Required Plan Completeness Schema
A plan cannot be approved unless these are complete:
- Core game loop and win/loss conditions.
- Onchain model/system definitions.
- Required modules (quests, leaderboard, social, economy, etc.).
- Permission/admin model.
- Test strategy.
- Deployment targets and acceptance criteria.
- Known assumptions and unresolved risks.

### 6.2 Clarification Loop
1. Planner inspects current plan graph and completeness score.
2. Generates highest-impact missing-question prompt.
3. User answer updates graph and assumptions.
4. Repeat until completeness threshold is met.

## 7. Run Orchestrator State Machine
Run state transitions:
- `queued -> starting -> running -> succeeded`
- `running -> failed`
- `queued|starting|running -> canceled`
- `running -> paused -> running`

Step state transitions:
- `pending -> running -> succeeded`
- `running -> failed -> retrying -> running`
- `running -> canceled`

Rules:
- Max retries per step configurable (default: 2).
- Retry only idempotent steps or after safe checkpoint.

## 8. Sandbox Spawning and Lifecycle

## 8.1 Execution Unit
- One Kubernetes Job per run.
- Single pod by default; optional sidecar for log shipper.

## 8.2 Pod Spec Requirements
- Image: pinned version with Dojo/Scarb/Katana/Node/pnpm/tooling.
- Resource caps (initial defaults):
  - `cpu: 2`
  - `memory: 4Gi`
  - `ephemeral-storage: 20Gi`
- `activeDeadlineSeconds`: default 7200.
- `ttlSecondsAfterFinished`: default 600.

## 8.3 Storage Strategy
- Ephemeral volume for workspace.
- Durable uploads for:
  - step logs (chunked)
  - patch bundles
  - test/build outputs
  - deployment manifests

## 8.4 Cost Controls
- Workspace quotas checked before enqueue and before each major phase.
- Concurrency cap per workspace.
- Hard stop on runtime/token budget breach.
- Prefer spot/preemptible nodes for worker pool.

## 8.5 Failure Recovery
- Checkpoint after each successful major step.
- On pod loss/preemption: recreate job and resume from checkpoint.
- Commit deduplication via idempotency key (`run_id + step_key + attempt`).

## 9. GitHub Persistence

## 9.1 Auth Model
- GitHub App installation scoped per workspace/org.
- App token minted per operation.

## 9.2 Repo Strategy
- One repository per Creator project.
- Branch naming: `creator/run-{run_id}`.
- Commit style:
  - atomic per step where possible.
  - include run metadata trailer in commit message.

## 9.3 Merge Strategy
- MVP default: open PR and optional auto-merge if checks pass and policy allows.
- Protected branch compatibility required.

## 10. Dojo/Cartridge Pipeline

### 10.1 Build/Test Steps
1. Generate/update code from plan.
2. Run formatting/lint checks.
3. Run Cairo tests and TS tests where applicable.
4. Build artifacts and manifests.

### 10.2 Deploy Steps
- Devnet deploy (Katana or configured devnet endpoint).
- Sepolia deploy via configured RPC.
- Persist:
  - world address
  - contract addresses
  - tx hashes
  - deployment manifest URI

### 10.3 Acceptance Gates
- No deploy if tests/build fail.
- Deploy summary must include reproducibility metadata (git SHA, image tag, tool versions).

## 11. Frontend Integration

### 11.1 New Route/Feature Surface
- Add `creator` feature module and route in client app.
- Views:
  - Project setup
  - Planning chat + plan tree editor
  - Run timeline + logs
  - Artifacts + deployment panel

### 11.2 Realtime UX
- SSE consumer with reconnect and replay using `Last-Event-ID`.
- Event ordering by monotonic `sequence`.
- UI source-of-truth reconciliation via periodic run snapshot fetch.

### 11.3 ViewModel Pattern
- Follow existing `use<Feature>ViewModel` conventions.
- Keep data orchestration in hooks, views dumb.

## 12. Security Model
- BYOK credentials encrypted at rest (KMS-backed).
- Decrypt only inside execution boundary for active step.
- Secrets never written to logs/events/artifacts.
- RBAC:
  - `creator:read`
  - `creator:plan:write`
  - `creator:run:execute`
  - `creator:deploy`

## 13. Observability
- Metrics:
  - run duration, step duration, queue time
  - success/failure rates by harness and phase
  - token/runtime/cost usage by workspace
- Tracing:
  - request -> run -> step -> sandbox correlation IDs
- Logs:
  - structured JSON with PII/secret redaction

## 14. Testing Strategy

### 14.1 Unit Tests
- Plan completeness validator.
- Harness adapter status/error normalization.
- Quota evaluator and run scheduler logic.

### 14.2 Integration Tests
- End-to-end planning session to approved plan.
- Run orchestration with mocked harnesses.
- GitHub repo provisioning + branch/PR flow.
- K8s job lifecycle and event streaming.

### 14.3 E2E Tests
- User creates project -> approves plan -> executes run -> sees live progress.
- Successful devnet + Sepolia deployment from template game.
- Cancellation and recovery from sandbox failure.

### 14.4 Performance and Cost Tests
- Queue behavior under 100 active creator profile.
- Token/runtime budget enforcement under stress.

## 15. Phase-by-Phase Implementation Plan

### Phase 0: Foundations
- DB migrations for core entities.
- Creator API skeleton and authz wiring.
- GitHub App integration and repo bootstrap.
- Event table + SSE endpoint.

### Phase 1: Planning
- Planner session endpoints.
- Clarification loop + plan graph persistence.
- Plan approval gating.
- UI planning chat + editable plan tree.

### Phase 2: Execution
- Run creation/cancel APIs.
- Harness adapter interface + Codex/Claude/Gemini adapters.
- K8s Job launcher and monitor.
- Run timeline/logs UI.

### Phase 3: Delivery
- Dojo generation/build/test pipeline.
- Devnet/Sepolia deployment tasks.
- Deployment artifact panel.

### Phase 4: Hardening
- Quotas and budget policies.
- Retry/resume from checkpoint on failures.
- Observability dashboards + alerting.
- Security review and abuse controls for self-serve.

## 16. Open Decisions (Explicit Defaults Chosen)
1. Real-time transport: SSE (default) instead of WebSockets for MVP.
2. Sandbox model: one sandbox per full run.
3. Repo model: one GitHub repo per project.
4. Credential model: BYOK.
5. Deploy automation: devnet + Sepolia only.

## 17. MVP Exit Criteria
- All PRD acceptance criteria satisfied.
- At least one reference Dojo game generated and deployed end-to-end via each harness adapter in staging.
- Quota enforcement blocks runaway costs in load test.
- Incident runbook exists for sandbox/job failures and provider outages.
