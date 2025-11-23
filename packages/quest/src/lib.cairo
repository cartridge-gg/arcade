pub mod interfaces;
pub mod store;

pub mod types {
    pub mod index;
    pub mod metadata;
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

pub mod components {
    pub mod questable;
}

#[cfg(test)]
pub mod tests {
    pub mod setup;
    pub mod test_questable;

    pub mod mocks {
        pub mod quester;
        pub mod rewarder;
    }
}
