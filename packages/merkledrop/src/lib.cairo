pub mod component;
pub mod store;

pub mod models {
    pub mod claim;
    pub mod index;
    pub mod tree;
}

pub mod events {
    pub mod index;
    pub mod proofs;
}

#[cfg(test)]
pub mod tests {
    pub mod contract;
    pub mod setup;
    pub mod test_component;
}
