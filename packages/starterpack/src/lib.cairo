pub mod constants;
pub mod interface;
pub mod store;

pub mod types {
    pub mod item;
    pub mod metadata;
    pub mod status;
}

pub mod events {
    pub mod index;
}

pub mod models {
    pub mod config;
    pub mod group_reward;
    pub mod index;
    pub mod issuance;
    pub mod referral_reward;
    pub mod starterpack;
}

pub mod components {
    pub mod initializable;
    pub mod issuable;
    pub mod manageable;
    pub mod registrable;
}

#[cfg(test)]
pub mod tests {
    pub mod mocks {
        pub mod account;
        pub mod erc20;
        pub mod implementation;
        pub mod registry;
    }
    pub mod setup;
    pub mod test_administration;
    pub mod test_fees;
    pub mod test_issue;
    pub mod test_register;
    pub mod test_update_pause;
}
