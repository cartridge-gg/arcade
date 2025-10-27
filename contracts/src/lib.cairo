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
        pub mod erc1155;
        pub mod erc20;
        pub mod erc721;
        pub mod register;
        // Re-export top-level starterpack_impl for tests
        pub use super::super::starterpack_impl;
    }

    pub mod registry {
        mod test_registerable;
    }

    pub mod marketplace {
        pub mod erc721 {
            mod test_fees;
            mod test_intent_execute;
            mod test_list_cancel;
            mod test_list_execute;
            mod test_list_remove;
            mod test_offer_cancel;
            mod test_offer_execute;
            mod test_offer_remove;
        }
        pub mod erc1155 {
            mod test_fees;
            mod test_intent_execute;
            mod test_list_cancel;
            mod test_list_execute;
            mod test_list_remove;
            mod test_offer_cancel;
            mod test_offer_execute;
            mod test_offer_remove;
        }
    }

    pub mod starterpack {
        mod test_administration;
        mod test_fees;
        mod test_issue;
        mod test_register;
        mod test_update_pause;
    }
}
