pub mod constants;
pub mod store;

pub mod types {
    pub mod category;
    pub mod status;
}

pub mod events {
    pub mod index;
    pub mod listing;
    pub mod offer;
    pub mod sale;
}

pub mod models {
    pub mod book;
    pub mod index;
    pub mod order;
}

pub mod components {
    pub mod buyable;
    pub mod manageable;
    pub mod sellable;
    pub mod verifiable;
}

#[cfg(test)]
pub mod tests {
    pub mod setup;
    pub mod test_setup;
    pub mod mocks {
        pub mod account;
        pub mod erc1155;
        pub mod erc20;
        pub mod erc721;
        pub mod marketplace;
    }
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
