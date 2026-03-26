pub mod component;
pub mod store;

pub mod types {
    pub mod metadata;
    pub mod reward;
    pub mod task;
}

pub mod models {
    pub mod advancement;
    pub mod association;
    pub mod completion;
    pub mod condition;
    pub mod definition;
    pub mod index;
}

pub mod events {
    pub mod claimed;
    pub mod completed;
    pub mod creation;
    pub mod index;
    pub mod progression;
    pub mod unlocked;
}

#[cfg(test)]
pub mod tests {
    pub mod contract;
    pub mod setup;
    pub mod test_component;
}
