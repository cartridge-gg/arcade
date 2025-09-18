pub mod constants;

pub mod systems {
    pub mod marketplace;
    pub mod registry;
    pub mod slot;
    pub mod social;
    pub mod wallet;
}

#[cfg(test)]
mod tests {
    mod setup;
    mod test_setup;
}
