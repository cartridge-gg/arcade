// Imports

use graffiti::json::JsonImpl;
use starknet::ContractAddress;
use crate::types::item::{Item, ItemTrait};

// Types

#[derive(Clone, Drop, Serde)]
pub struct Metadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
    pub items: Span<Item>,
    pub tokens: Span<ContractAddress>,
}

// Errors

pub mod Errors {
    pub const METADATA_INVALID_NAME: felt252 = 'Metadata: invalid name';
    pub const METADATA_INVALID_DESCRIPTION: felt252 = 'Metadata: invalid description';
    pub const METADATA_INVALID_IMAGE_URI: felt252 = 'Metadata: invalid image uri';
    pub const METADATA_INVALID_ITEMS: felt252 = 'Metadata: invalid items';
}

// Implementations

#[generate_trait]
pub impl MetadataImpl of MetadataTrait {
    #[inline]
    fn new(
        name: ByteArray,
        description: ByteArray,
        image_uri: ByteArray,
        items: Span<Item>,
        tokens: Span<ContractAddress>,
    ) -> Metadata {
        // [Check] Inputs
        MetadataAssert::assert_valid_name(@name);
        MetadataAssert::assert_valid_description(@description);
        MetadataAssert::assert_valid_image_uri(@image_uri);
        MetadataAssert::assert_valid_items(@items);
        // [Return] Metadata
        Metadata { name, description, image_uri, items, tokens }
    }

    #[inline]
    fn jsonify(mut self: Metadata) -> ByteArray {
        // [Return] Metadata
        let mut items: Array<ByteArray> = array![];
        while let Option::Some(item) = self.items.pop_front() {
            items.append(item.clone().jsonify());
        }
        let mut tokens: Array<ByteArray> = array![];
        while let Option::Some(token) = self.tokens.pop_front() {
            let felt: felt252 = (*token).into();
            tokens.append(format!("{}", felt));
        }
        JsonImpl::new()
            .add("name", self.name)
            .add("description", self.description)
            .add("image_uri", self.image_uri)
            .add_array("items", items.span())
            .add_array("tokens", tokens.span())
            .build()
    }
}

#[generate_trait]
pub impl MetadataAssert of AssertTrait {
    #[inline]
    fn assert_valid_name(name: @ByteArray) {
        assert(name.len() > 0, Errors::METADATA_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, Errors::METADATA_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_image_uri(image_uri: @ByteArray) {
        assert(image_uri.len() > 0, Errors::METADATA_INVALID_IMAGE_URI);
    }

    #[inline]
    fn assert_valid_items(items: @Span<Item>) {
        assert(items.len() > 0, Errors::METADATA_INVALID_ITEMS);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::*;

    // Constants

    const ICON: felt252 = 'ICON';
    const TOKEN: ContractAddress = 'TOKEN'.try_into().unwrap();

    #[test]
    fn test_metadata_complete() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "IMAGE_URI";
        let items: Span<Item> = array![ItemTrait::new("NAME", "DESCRIPTION", "IMAGE_URI")].span();
        let tokens: Span<ContractAddress> = array![TOKEN].span();
        let metadata: ByteArray = MetadataImpl::new(name, description, image_uri, items, tokens)
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"image_uri\":\"IMAGE_URI\",\"items\":[{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"image_uri\":\"IMAGE_URI\"}],\"tokens\":[\"362107585870\"]}",
        );
    }

    #[test]
    fn test_metadata_uncomplete() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "IMAGE_URI";
        let items: Span<Item> = array![ItemTrait::new("NAME", "DESCRIPTION", "IMAGE_URI")].span();
        let tokens: Span<ContractAddress> = array![].span();
        let metadata: ByteArray = MetadataImpl::new(name, description, image_uri, items, tokens)
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"image_uri\":\"IMAGE_URI\",\"items\":[{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"image_uri\":\"IMAGE_URI\"}],\"tokens\":[]}",
        );
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid name',))]
    fn test_metadata_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "IMAGE_URI";
        let items: Span<Item> = array![ItemTrait::new("NAME", "DESCRIPTION", "IMAGE_URI")].span();
        let tokens: Span<ContractAddress> = array![TOKEN].span();
        MetadataImpl::new("", description, image_uri, items, tokens).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid description',))]
    fn test_metadata_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let image_uri: ByteArray = "IMAGE_URI";
        let items: Span<Item> = array![ItemTrait::new("NAME", "DESCRIPTION", "IMAGE_URI")].span();
        let tokens: Span<ContractAddress> = array![TOKEN].span();
        MetadataImpl::new(name, "", image_uri, items, tokens).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid image uri',))]
    fn test_metadata_creation_new_invalid_image_uri() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let items: Span<Item> = array![ItemTrait::new("NAME", "DESCRIPTION", "IMAGE_URI")].span();
        let tokens: Span<ContractAddress> = array![TOKEN].span();
        MetadataImpl::new(name, description, "", items, tokens).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid items',))]
    fn test_metadata_creation_new_invalid_items() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "IMAGE_URI";
        let items: Span<Item> = array![].span();
        let tokens: Span<ContractAddress> = array![TOKEN].span();
        MetadataImpl::new(name, description, image_uri, items, tokens).jsonify();
    }
}

