pub mod store;

pub mod types {
    pub mod index;
    pub mod task;
}

pub mod events {
    pub mod creation;
    pub mod index;
    pub mod pinning;
    pub mod progress;
}

pub mod components {
    pub mod achievable;
    pub mod pinnable;
}
// #[cfg(test)]
// mod tests {
//     pub mod setup;
//     pub mod test_achievable;

//     pub mod mocks {
//         pub mod achiever;
//     }
// }


