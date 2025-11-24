pub mod constants;
pub mod starterpack_impl;

pub mod systems {
    pub mod marketplace;
    pub mod registry;
    pub mod slot;
    pub mod social;
    pub mod starterpack;
    pub mod wallet;
}

#[cfg(test)]
mod tests {
    mod setup;
    mod test_setup;

    pub mod mocks {
        pub mod account;
        pub mod collection;
        pub mod erc20;
        // Re-export top-level starterpack_impl for tests
        pub use super::super::starterpack_impl;
    }

    pub mod starterpack {
        mod test_administration;
        mod test_fees;
        mod test_issue;
        mod test_register;
        mod test_update_pause;
    }
}
