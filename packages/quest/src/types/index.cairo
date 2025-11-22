/// Types

#[derive(Clone, Drop, Serde, Introspect, DojoStore)]
pub struct Task {
    pub id: felt252,
    pub total: u128,
    pub description: ByteArray,
}
