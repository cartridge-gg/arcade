/// Models

// package schema

// import (
// "encoding/json"
// "time"

// "entgo.io/contrib/entgql"
// "entgo.io/ent"
// "entgo.io/ent/schema"
// "entgo.io/ent/schema/edge"
// "entgo.io/ent/schema/field"
// "entgo.io/ent/schema/index"
// "github.com/lucsky/cuid"
// )

// type Resources struct {
// Memory float64 `json:"memory,omitempty"`
// CPU    float64 `json:"cpu,omitempty"`
// }

// type MachineSpecs struct {
// Requests *Resources `json:"requests,omitempty"`
// Limits   *Resources `json:"limits,omitempty"`
// Storage  int        `json:"storage,omitempty"`
// }

// // Deployment holds the schema definition for the Deployment entity.
// type Deployment struct {
// ent.Schema
// }

// // Fields of the Deployment.
// func (Deployment) Fields() []ent.Field {
// return []ent.Field{
// field.String("id").
// Unique().
// Immutable().
// DefaultFunc(cuid.New),
// field.String("project"),
// field.Enum("status").
// Values("active", "disabled").
// Default("active"),
// field.String("branch").Default("main").Optional(),
// field.String("service_id"),
// field.Enum("tier").Values(
// "basic",
// "common",
// "uncommon",
// "rare",
// "epic",
// "legendary",
// "insane",
// ),
// field.Strings("regions"),
// field.Bool("auto_upgrade").Default(false),
// field.JSON("config", json.RawMessage{}).
// Annotations(entgql.Skip()).
// Optional(),
// field.Time("created_at").
// Default(time.Now).
// Annotations(
// entgql.OrderField("CREATED_AT"),
// ),
// field.Time("updated_at").
// Default(time.Now).
// UpdateDefault(time.Now),
// field.Time("spin_down_at").Optional(),
// field.Time("spin_up_at").Optional(),
// }
// }

// // Edges of the Deployment.
// func (Deployment) Edges() []ent.Edge {
// return []ent.Edge{
// edge.From("teams", Team.Type).
// Ref("deployments").
// Annotations(entgql.RelayConnection()),
// edge.From("service", Service.Type).Ref("deployments").Field("service_id").Unique().Required(),
// edge.To("events", DeploymentLog.Type),
// }
// }

// func (Deployment) Indexes() []ent.Index {
// return []ent.Index{
// index.Fields("project", "service_id").Unique(),
// }
// }

// // Annotations returns Deployment annotations.
// func (Deployment) Annotations() []schema.Annotation {
// return []schema.Annotation{
// entgql.RelayConnection(),
// }
// }

#[derive(Clone, Drop, Serde)]
#[dojo::model]
pub struct Deployment {
    #[key]
    id: felt252,
    #[key]
    project: felt252,
    status: u8,
    branch: Option<felt252>,
    service_id: felt252,
    tier: u8,
    regions: felt252,
    auto_upgrade: bool,
    config: ByteArray,
    created_at: u64,
    updated_at: u64,
    spin_down_at: Option<u64>,
    spin_up_at: Option<u64>,
}
