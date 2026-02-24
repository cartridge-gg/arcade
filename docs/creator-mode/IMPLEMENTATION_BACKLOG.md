# Creator Mode Implementation Backlog

## Scope
This backlog translates `docs/creator-mode/SPEC.md` into implementation-ready epics and stories targeted at:
- `cartridge-gg/internal` (Go control plane and orchestration)
- Arcade frontend (`client/`) for Creator UI

All stories include acceptance criteria and dependencies.

## Milestone M0: Foundations (2 weeks)

### Epic M0-E1: Data + API Skeleton (`internal`)
1. Story M0-E1-S1: Create core DB schema migrations
- Files: mirrored in `docs/creator-mode/scaffolding/internal/migrations/0001_creator_mode.sql`
- Acceptance:
  - Tables for projects, plans, runs, events, artifacts, deployments, quotas, usage exist.
  - FK constraints and indexes exist for key lookup paths.

2. Story M0-E1-S2: Implement Creator API route group
- Endpoints:
  - `POST /v1/creator/projects`
  - `GET /v1/creator/projects/{id}`
  - `GET /v1/creator/projects/{id}/runs/{runId}`
- Acceptance:
  - OpenAPI generated docs include all request/response models.
  - AuthZ middleware enforces workspace scope.

3. Story M0-E1-S3: Implement run event SSE endpoint
- Endpoint: `GET /v1/creator/projects/{id}/runs/{runId}/events`
- Acceptance:
  - Supports `Last-Event-ID` replay semantics.
  - Events emitted in monotonic `sequence` order.

### Epic M0-E2: GitHub provisioning (`internal`)
1. Story M0-E2-S1: GitHub App installation and token exchange
- Acceptance:
  - Installation ID linked to workspace.
  - API can mint short-lived installation token.

2. Story M0-E2-S2: Repo bootstrap flow
- Acceptance:
  - Repo created per project.
  - Starter template copied with README and CI.
  - Project status transitions to `active` on success.

## Milestone M1: Interactive Planning (2-3 weeks)

### Epic M1-E1: Planning sessions + versions (`internal`)
1. Story M1-E1-S1: Create planning session lifecycle endpoints
- `POST /plan/sessions`, `POST /messages`, `POST /approve`
- Acceptance:
  - Session statuses persist correctly.
  - Version history immutable.

2. Story M1-E1-S2: Plan completeness validator
- Acceptance:
  - Required schema fields validated.
  - Completeness score returned in API.

### Epic M1-E2: Creator planning UI (`client`)
1. Story M1-E2-S1: Add `/creator` route and project selector
- Acceptance:
  - Route appears in app navigation.
  - Project state sourced from Creator API.

2. Story M1-E2-S2: Planning chat + editable plan tree
- Acceptance:
  - User can answer clarifying prompts.
  - Plan graph edits persist to new plan version.
  - Approve button only enabled when complete.

## Milestone M2: Run Execution + Sandboxes (3 weeks)

### Epic M2-E1: Harness adapter runtime (`internal`)
1. Story M2-E1-S1: Implement adapter interface and registry
- Adapters: codex, claude, gemini
- Acceptance:
  - Common `HarnessAdapter` contract implemented.
  - Provider errors normalized to standard taxonomy.

2. Story M2-E1-S2: Usage metering integration
- Acceptance:
  - Tokens/runtime tracked by run and workspace.
  - Usage ledger written per completed step.

### Epic M2-E2: K8s sandbox controller (`internal`)
1. Story M2-E2-S1: Job launcher + monitor
- Acceptance:
  - One Kubernetes Job per run with resource caps.
  - Lease row created/updated with pod status.

2. Story M2-E2-S2: Checkpoint and resume primitives
- Acceptance:
  - Step checkpoints stored durably.
  - Resume on pod restart from last checkpoint.

3. Story M2-E2-S3: Quota enforcement
- Acceptance:
  - Run blocked when workspace caps exceeded.
  - Budget exceeded during run triggers terminal state with reason.

### Epic M2-E3: Execution UI (`client`)
1. Story M2-E3-S1: Run timeline + step graph
- Acceptance:
  - Live status updates from SSE.
  - Failed step shows actionable summary.

2. Story M2-E3-S2: Logs and artifact browser
- Acceptance:
  - Logs stream in near real-time.
  - Artifacts downloadable with metadata.

## Milestone M3: Dojo Pipeline + Deploy (2 weeks)

### Epic M3-E1: Build/test/deploy workflow (`internal`)
1. Story M3-E1-S1: Build + test execution stage
- Acceptance:
  - Cairo and TS checks run and persist outputs.
  - Deploy stage gated by passing checks.

2. Story M3-E1-S2: Devnet + Sepolia deployment stage
- Acceptance:
  - Deploy tx hashes and world/contract addresses persisted.
  - Deployment summary artifact generated.

### Epic M3-E2: Deployment UI (`client`)
1. Story M3-E2-S1: Deployments panel
- Acceptance:
  - Shows per-environment status and tx metadata.
  - Displays reproducibility metadata (git SHA, tool versions).

## Milestone M4: Hardening + Launch (2 weeks)

### Epic M4-E1: Observability
1. Story M4-E1-S1: Metrics + tracing
- Acceptance:
  - Dashboards for run success, queue time, cost/usage.
  - Alerting on provider outage and queue backlog.

### Epic M4-E2: Security + abuse controls
1. Story M4-E2-S1: Secret isolation + redaction audit
- Acceptance:
  - No secret values in logs/events.

2. Story M4-E2-S2: Self-serve guardrails
- Acceptance:
  - Per-workspace rate limits and anti-abuse limits configured.

## Cross-Cutting Test Matrix
1. Unit: validator, adapter normalization, scheduler, quota evaluator.
2. Integration: planning to approved plan, run with mocked harness, repo provisioning.
3. E2E: create -> plan -> run -> deploy success.
4. Chaos: pod preemption, provider timeout, SSE reconnect/replay.

## Delivery Ownership (Proposed)
- Internal platform/backend team: M0/M1 internal, M2, M3 backend, M4 backend.
- Frontend team: M1 UI, M2 UI, M3 UI.
- DevOps/SRE: cluster capacity, job templates, observability stack.

## Critical Path
1. M0 schema + API + GitHub provisioning
2. M1 planning and approval flow
3. M2 run orchestration + sandbox stability
4. M3 deploy automation

## Launch Readiness Gate
- Reference game can be generated and deployed to Sepolia via each harness adapter.
- Quota controls verified under load profile for 100 active creators/month.
