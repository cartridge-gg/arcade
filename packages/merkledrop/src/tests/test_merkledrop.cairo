use core::poseidon::poseidon_hash_span;
use starknet::testing::set_contract_address;
use crate::tests::mocks::registry::IRegistryDispatcherTrait;
use crate::tests::setup::setup::spawn;

// Tests

#[test]
fn test_merkledrop_register() {
    let systems = spawn();
    let data = [[0x1].span(), [0x2].span(), [0x3].span()].span();
    let root = systems.registry.register(data, 2);
    assert_ne!(root, 0);
}

#[test]
fn test_merkledrop_claim() {
    let systems = spawn();
    let data = [[0x1].span(), [0x2].span(), [0x3].span()].span();
    let root = systems.registry.register(data, 2);
    set_contract_address(0x1.try_into().unwrap());
    let proofs = [
        907316533554300518970989593361581641884722336105092139183718192455367796082,
        3607669716317214452405727508484314200253059781412795125669234850493457454238,
    ]
        .span();
    systems.registry.claim(root, proofs, [0x1].span(), 0x1.try_into().unwrap());
    let leaf = poseidon_hash_span([0x1].span());
    systems.registry.is_claimed(root, leaf);
}

#[test]
#[should_panic(expected: ('MerkleDrop: not recipient', 'ENTRYPOINT_FAILED'))]
fn test_merkledrop_claim_invalid_recipient() {
    let systems = spawn();
    let data = [[0x1].span(), [0x2].span(), [0x3].span()].span();
    let root = systems.registry.register(data, 2);
    set_contract_address('RANDOM'.try_into().unwrap());
    let proofs = [
        907316533554300518970989593361581641884722336105092139183718192455367796082,
        3607669716317214452405727508484314200253059781412795125669234850493457454238,
    ]
        .span();
    systems.registry.claim(root, proofs, [0x1].span(), 0x1.try_into().unwrap());
}

#[test]
#[should_panic(expected: ('MerkleDrop: invalid proof', 'ENTRYPOINT_FAILED'))]
fn test_merkledrop_claim_invalid_proof() {
    let systems = spawn();
    let data = [[0x1].span(), [0x2].span(), [0x3].span()].span();
    let root = systems.registry.register(data, 2);
    set_contract_address(0x1.try_into().unwrap());
    let proofs = [0, 0].span();
    systems.registry.claim(root, proofs, [0x1].span(), 0x1.try_into().unwrap());
}

