pub mod store;

pub mod types {
    pub mod item;
}

pub mod events {
    pub mod index;
    pub mod score;
}

pub mod components {
    pub mod rankable;
}

#[cfg(test)]
pub mod tests {
    pub mod mocks {
        pub mod ranker;
    }
    pub mod setup;
    pub mod test_ranker;
}
