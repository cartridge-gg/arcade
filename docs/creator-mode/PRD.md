# Creator Mode PRD

## 1. Document Control
- Product: Creator Mode for Onchain Games (Dojo + Cartridge)
- Target release: MVP over 5 phases
- Last updated: 2026-02-24
- Primary audience: internal/partner game teams and open self-serve developers

## 2. Problem Statement
Game teams building on Dojo/Cartridge currently stitch together planning, code generation, repo setup, CI, and Starknet deployment manually across multiple tools. This creates high setup friction, inconsistent quality, and long cycle times from idea to a deployed, skill-based onchain game.

We need a "creator" mode that:
- Interactively clarifies requirements into a decision-complete plan.
- Orchestrates agent execution (Codex, Claude Code, Gemini) to implement end-to-end.
- Persists all code and artifacts to GitHub.
- Shows live plan/progress while work executes.
- Automates devnet + Sepolia build/test/deploy flows.
- Remains cost-efficient for an MVP scale of up to 100 active creators/month.

## 3. Goals
1. Reduce idea-to-first-deployed-game time by >60% versus manual baseline.
2. Provide structured planning that resolves ambiguities before execution.
3. Provide portable harness support (Codex/Claude/Gemini) behind one orchestration layer.
4. Ensure deterministic persistence (repo-per-project, auditable commits, run logs, artifacts).
5. Keep infra cost low with Kubernetes job-based ephemeral sandboxes and strict quotas.

## 4. Non-Goals (MVP)
- Mainnet deployment automation.
- Fully custom plugin marketplace for arbitrary third-party tools.
- Real-time multiplayer simulation hosting.
- Multi-region active-active orchestration.

## 5. Personas
1. Studio Technical Lead
- Wants rapid prototyping and reliable delivery to Sepolia.
- Needs auditable plans/runs, PRs, and deploy artifacts.

2. Solo Onchain Developer
- Wants guided planning and low-ops automation.
- Needs clear errors and actionable remediation.

3. Internal Ecosystem Team
- Wants standardized project outputs and lower support burden.
- Needs policy controls, cost guardrails, and observability.

## 6. Jobs To Be Done
- "Given a game concept, help me reach a complete implementation plan without missing critical decisions."
- "Given an approved plan, generate and iterate Cairo/Dojo code, tests, and deployment artifacts in GitHub."
- "Show me exactly where execution stands and what failed, in language I can act on."

## 7. User Journey
1. Project setup
- User creates Creator project.
- System provisions one GitHub repo from template and links workspace.

2. Interactive planning
- Planner agent asks targeted clarification questions.
- User answers and edits a structured plan tree.
- Plan enters "Approved" state.

3. Execution
- User chooses harness (Codex/Claude/Gemini) and starts run.
- Orchestrator spawns sandbox and executes step graph.
- UI streams live progress, logs, artifacts.

4. Validation + deployment
- Build/tests run automatically.
- Deploy to devnet + Sepolia (if selected).
- Outputs include contract/world addresses and tx hashes.

5. Handoff
- Repo contains code, CI config, docs, and deployment summary.
- Run report is archived for auditability.

## 8. Functional Requirements

### 8.1 Project + Repo Lifecycle
- Create Creator project with metadata and owner.
- Provision GitHub repo per game project via GitHub App.
- Seed with Dojo/Cartridge starter template and CI workflows.
- Support branch/PR strategy for agent-generated changes.

### 8.2 Planning System
- Start a planning session per project.
- Planner must ask clarifying questions until required spec fields are complete.
- Represent plan as editable tree/graph with statuses and dependencies.
- Require explicit user approval before execution.
- Maintain immutable plan versions and diffs.

### 8.3 Multi-Agent Harness
- Single harness abstraction with adapters for:
  - Codex
  - Claude Code
  - Gemini
- Normalize token usage, step output, and error semantics.
- Allow harness selection per run.

### 8.4 Run Orchestration
- Execute approved plan as step graph with retries and checkpoints.
- Stream run events/logs to UI in near real-time.
- Support cancel/pause/resume (resume from last durable checkpoint).
- Persist artifacts (patches, test outputs, manifests, deploy records).

### 8.5 Sandbox Execution
- Spawn Kubernetes Job per run (one sandbox for full run).
- Enforce resource limits, timeouts, and cleanup TTL.
- Use ephemeral workspace storage plus durable artifact uploads.

### 8.6 Dojo/Starknet Delivery
- Build/test Cairo + TS where applicable.
- Automate deployment to devnet and Sepolia.
- Capture world/contract addresses and tx hashes.
- Emit deployment summary and rollback guidance.

### 8.7 Progress UX
- Display current plan, active step, completed steps, blocked steps.
- Provide structured step logs and summarized errors.
- Show cost/runtime counters at run and workspace level.

### 8.8 Security + Credentials
- BYOK provider credentials scoped per workspace.
- Secret-at-rest encryption and runtime injection only.
- No plaintext secrets in logs/artifacts.

## 9. Non-Functional Requirements
- Availability: control plane 99.5% for MVP.
- Durability: plan/run/audit records persisted transactionally.
- Latency:
  - event stream update target p95 < 2s from producer to UI
  - run creation p95 < 5s before queued/running state
- Security: strict RBAC on project/run operations.
- Cost: quotas and worker pool controls to fit MVP budget envelope.

## 10. Success Metrics

### Product Metrics
- Time from project creation to first successful Sepolia deployment.
- Planning completion rate (sessions reaching approved plan).
- Run success rate and mean retries per run.
- Weekly active creators.

### Quality Metrics
- % runs with actionable error summaries.
- % deployments requiring manual intervention.
- Test pass rate on generated projects.

### Cost Metrics
- Median run cost by harness.
- Monthly infra cost per active creator.
- % runs terminated by quota/timeout (must remain controlled).

## 11. Constraints
- Existing backend foundation is `cartridge-gg/internal` (Go).
- Must support both internal/partner teams and open self-serve.
- Must minimize infra/ops overhead for MVP.

## 12. Risks and Mitigations
1. Scope overload from multi-persona MVP
- Mitigation: strict phased rollout + minimum UX surface in phase 1.

2. Runaway compute/token cost
- Mitigation: workspace quotas, concurrency caps, hard runtime ceilings.

3. Unclear plan quality leads to bad execution
- Mitigation: required plan schema completeness checks before approval.

4. Provider instability across harnesses
- Mitigation: adapter isolation + fallback/retry policy + clear provider health telemetry.

5. Sandbox failures (preemption/timeout)
- Mitigation: durable checkpoints and idempotent step execution.

## 13. Rollout Plan
1. Phase 0 (Foundations)
- Project/repo provisioning, schema, eventing, basic run primitives.

2. Phase 1 (Planning)
- Interactive clarifications, plan tree editor, approval gates.

3. Phase 2 (Execution)
- Multi-harness adapter, sandbox runner, live progress stream.

4. Phase 3 (Dojo pipeline)
- Automated build/test + devnet/Sepolia deploy outputs.

5. Phase 4 (Hardening)
- Quotas, observability, reliability, security hardening.

## 14. MVP Acceptance Criteria
- User can create project and get a linked GitHub repo.
- User can complete an interactive planning session to an approved plan.
- User can execute approved plan with selected harness.
- UI shows live step progress and logs during execution.
- Code and artifacts are persisted to GitHub and storage.
- Automated devnet + Sepolia deployment succeeds for at least one reference template game.
- Quotas prevent unbounded cost in test load.

## 15. Out-of-Scope Backlog (Post-MVP)
- Mainnet deployment automation with policy approvals.
- Advanced collaborative planning board and multiplayer editing.
- Custom tool/plugin marketplace and third-party extension SDK.
- Enterprise SSO/SCIM and per-org compliance exports.
