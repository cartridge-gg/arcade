// Shared RBAC (Role-Based Access Control) module
pub mod rbac {
    pub mod types {
        pub mod role;
    }

    pub mod models {
        pub mod index;
        pub mod moderator;
    }

    pub mod store;
}
