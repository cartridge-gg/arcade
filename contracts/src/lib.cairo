mod constants;

mod systems {
    mod registry;
    mod slot;
    mod social;
    mod wallet;
}

#[cfg(test)]
mod tests {
    mod setup;
    mod test_setup;
}
