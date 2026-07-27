package models

import "time"

type RunStatus string

type PlanSessionStatus string

type StepStatus string

type DeploymentEnv string

const (
	RunQueued   RunStatus = "queued"
	RunStarting RunStatus = "starting"
	RunRunning  RunStatus = "running"
	RunPaused   RunStatus = "paused"
	RunFailed   RunStatus = "failed"
	RunSuccess  RunStatus = "succeeded"
	RunCanceled RunStatus = "canceled"
)

const (
	PlanDraft      PlanSessionStatus = "draft"
	PlanAwaiting   PlanSessionStatus = "awaiting_user"
	PlanReady      PlanSessionStatus = "ready_for_approval"
	PlanApproved   PlanSessionStatus = "approved"
	PlanArchived   PlanSessionStatus = "archived"
)

const (
	StepPending  StepStatus = "pending"
	StepRunning  StepStatus = "running"
	StepSuccess  StepStatus = "succeeded"
	StepFailed   StepStatus = "failed"
	StepRetrying StepStatus = "retrying"
	StepCanceled StepStatus = "canceled"
)

const (
	EnvDevnet  DeploymentEnv = "devnet"
	EnvSepolia DeploymentEnv = "sepolia"
)

type CreatorProject struct {
	ID           string
	WorkspaceID  string
	Name         string
	GithubOwner  string
	GithubRepo   string
	DefaultBranch string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type PlanVersion struct {
	ID                string
	SessionID         string
	Version           int
	PlanGraphJSON     []byte
	AssumptionsJSON   []byte
	CompletenessScore float64
	CreatedAt         time.Time
}

type Run struct {
	ID            string
	ProjectID     string
	PlanVersionID string
	Harness       string
	Status        RunStatus
	TargetEnvs    []string
	StartedAt     *time.Time
	FinishedAt    *time.Time
	CreatedAt     time.Time
}

type RunStep struct {
	ID         string
	RunID      string
	StepKey    string
	DependsOn  []byte
	Status     StepStatus
	Attempt    int
	Summary    string
	ErrorCode  string
	StartedAt  *time.Time
	FinishedAt *time.Time
}

type RunEvent struct {
	ID         string
	RunID      string
	Sequence   int64
	EventType  string
	PayloadJSON []byte
	CreatedAt  time.Time
}
