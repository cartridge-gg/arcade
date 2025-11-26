pub mod interfaces;
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
    pub mod definition;
    pub mod index;
}

pub mod events {
    pub mod claimed;
    pub mod completed;
    pub mod creation;
    pub mod index;
    pub mod progress;
}

pub mod components {
    pub mod achievable;
}

#[cfg(test)]
mod tests {
    pub mod setup;
    pub mod test_achievable;

    pub mod cases {
        pub mod test_delayed_permanent;
        pub mod test_permanent;
        pub mod test_time_limited;
        pub mod test_time_limited_with_delay;
    }

    pub mod mocks {
        pub mod achiever;
        pub mod rewarder;
    }
}

