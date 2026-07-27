package services

import (
	"context"
	"time"
)

type CreateProjectRequest struct {
	WorkspaceID string
	Name        string
	GithubOwner string
	Template    string
}

type CreateProjectResponse struct {
	ProjectID  string
	Status     string
	GithubRepo string
}

type PlanMessageRequest struct {
	ProjectID string
	SessionID string
	Content   string
}

type PlanMessageResponse struct {
	SessionStatus       string
	LatestPlanVersionID string
	NextQuestion        *string
}

type CreateRunRequest struct {
	ProjectID      string
	PlanVersionID  string
	Harness        string
	TargetEnvs     []string
	RequestedBy    string
}

type UsageMetrics struct {
	TokensIn      int64
	TokensOut     int64
	RuntimeSecond int64
	EstimatedUSD  float64
}

type StepRequest struct {
	RunID         string
	StepKey       string
	Instruction   string
	WorkingDirURI string
	Timeout       time.Duration
}

type StepHandle struct {
	Provider string
	OpaqueID string
}

type StepProgress struct {
	Status   string
	Summary  string
	LogChunk string
	Done     bool
}

type WorkspaceCredentials struct {
	WorkspaceID string
	Provider    string
	SecretRef   string
}

type HarnessAdapter interface {
	Name() string
	ValidateCredentials(ctx context.Context, creds WorkspaceCredentials) error
	StartStep(ctx context.Context, req StepRequest) (StepHandle, error)
	PollStep(ctx context.Context, handle StepHandle) (StepProgress, error)
	CancelStep(ctx context.Context, handle StepHandle) error
	Usage(ctx context.Context, handle StepHandle) (UsageMetrics, error)
}

type PlannerService interface {
	CreateSession(ctx context.Context, projectID, actorID string) (sessionID string, err error)
	ProcessMessage(ctx context.Context, req PlanMessageRequest) (PlanMessageResponse, error)
	ApprovePlan(ctx context.Context, projectID, sessionID, planVersionID, actorID string) error
}

type RunService interface {
	CreateRun(ctx context.Context, req CreateRunRequest) (runID string, err error)
	CancelRun(ctx context.Context, projectID, runID, actorID string) error
	PauseRun(ctx context.Context, projectID, runID, actorID string) error
	ResumeRun(ctx context.Context, projectID, runID, actorID string) error
}

type SandboxController interface {
	LaunchRunSandbox(ctx context.Context, runID string) (leaseID string, err error)
	TerminateRunSandbox(ctx context.Context, runID string) error
	ResumeRunSandbox(ctx context.Context, runID string) (leaseID string, err error)
}
