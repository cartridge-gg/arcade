pub mod constants;
pub mod store;

pub mod helpers {
    pub mod base64;
    pub mod json;
    pub mod seeder;
}

pub mod types {
    pub mod config;
    pub mod metadata;
    pub mod role;
}

pub mod models {
    pub mod access;
    pub mod collection;
    pub mod edition;
    pub mod game;
    pub mod index;
    pub mod unicity;
}

pub mod components {
    pub mod initializable;
    pub mod registerable;
}

#[cfg(test)]
mod tests {
    mod setup;
    mod test_registerable;

    mod mocks {
        pub mod collection;
        pub mod register;
    }
}
