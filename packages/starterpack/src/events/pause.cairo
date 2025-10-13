// Events

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct StarterpackPaused {
    #[key]
    pub starterpack_id: u32,
    pub time: u64,
}

#[derive(Copy, Drop, Serde)]
#[dojo::event]
pub struct StarterpackResumed {
    #[key]
    pub starterpack_id: u32,
    pub time: u64,
}

