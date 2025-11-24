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

    pub mod cases {
        pub mod test_delayed_permanent;
        pub mod test_permanent;
        pub mod test_recurring_permanent;
        pub mod test_recurring_permanent_with_delay;
        pub mod test_recurring_time_limited;
        pub mod test_recurring_time_limited_with_delay;
        pub mod test_time_limited;
        pub mod test_time_limited_with_delay;
    }

    pub mod conditions {
        pub mod test_convergent;
        pub mod test_diamond;
        pub mod test_independent;
        pub mod test_linear_chain;
        pub mod test_multiple_parents_single_child;
        pub mod test_single_parent_multiple_children;
        pub mod test_tree;
    }

    pub mod mocks {
        pub mod quester;
        pub mod rewarder;
    }
}
