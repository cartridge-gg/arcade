// Imports

use graffiti::json::JsonImpl;
use starknet::ContractAddress;

// Types

#[derive(Clone, Drop, Serde)]
pub struct StarterpackItem {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
}

#[derive(Clone, Drop, Serde)]
pub struct StarterpackMetadata {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
    pub items: Span<StarterpackItem>,
    pub additional_payment_tokens: Span<ContractAddress>,
}

// Errors

pub mod Errors {
    pub const ITEM_INVALID_NAME: felt252 = 'Item: invalid name';
    pub const ITEM_INVALID_DESCRIPTION: felt252 = 'Item: invalid description';
    pub const ITEM_INVALID_IMAGE_URI: felt252 = 'Item: invalid image uri';
    pub const METADATA_INVALID_NAME: felt252 = 'Metadata: invalid name';
    pub const METADATA_INVALID_DESCRIPTION: felt252 = 'Metadata: invalid description';
    pub const METADATA_INVALID_IMAGE_URI: felt252 = 'Metadata: invalid image uri';
}

// Implementations

#[generate_trait]
pub impl ItemImpl of ItemTrait {
    #[inline]
    fn new(name: ByteArray, description: ByteArray, image_uri: ByteArray) -> StarterpackItem {
        // [Check] Inputs
        ItemAssert::assert_valid_name(@name);
        ItemAssert::assert_valid_description(@description);
        ItemAssert::assert_valid_image_uri(@image_uri);
        // [Return] Item
        StarterpackItem { name, description, image_uri }
    }

    #[inline]
    fn jsonify(self: StarterpackItem) -> ByteArray {
        // [Return] Item
        JsonImpl::new()
            .add("name", self.name)
            .add("description", self.description)
            .add("image_uri", self.image_uri)
            .build()
    }
}

#[generate_trait]
pub impl ItemAssert of ItemAssertTrait {
    #[inline]
    fn assert_valid_name(name: @ByteArray) {
        assert(name.len() > 0, Errors::ITEM_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, Errors::ITEM_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_image_uri(image_uri: @ByteArray) {
        assert(image_uri.len() > 0, Errors::ITEM_INVALID_IMAGE_URI);
    }
}

#[generate_trait]
pub impl StarterpackMetadataImpl of StarterpackMetadataTrait {
    #[inline]
    fn new(
        name: ByteArray,
        description: ByteArray,
        image_uri: ByteArray,
        items: Span<StarterpackItem>,
        additional_payment_tokens: Span<ContractAddress>,
    ) -> StarterpackMetadata {
        // [Check] Inputs
        MetadataAssert::assert_valid_name(@name);
        MetadataAssert::assert_valid_description(@description);
        MetadataAssert::assert_valid_image_uri(@image_uri);
        // [Return] Metadata
        StarterpackMetadata { name, description, image_uri, items, additional_payment_tokens }
    }

    #[inline]
    fn jsonify(mut self: StarterpackMetadata) -> ByteArray {
        // Build items array
        let mut items_json: Array<ByteArray> = array![];
        while let Option::Some(item) = self.items.pop_front() {
            items_json.append(item.clone().jsonify());
        }

        // Build additional_payment_tokens array string manually
        let mut tokens_array_str: ByteArray = "[";
        let mut first = true;
        while let Option::Some(token) = self.additional_payment_tokens.pop_front() {
            if !first {
                tokens_array_str.append(@",");
            }
            first = false;
            let token_felt: felt252 = (*token).into();
            let token_u256: u256 = token_felt.into();
            tokens_array_str.append(@format!("\"0x{:x}\"", token_u256));
        }
        tokens_array_str.append(@"]");

        // Build the full JSON manually to include the tokens array
        let base_json = JsonImpl::new()
            .add("name", self.name)
            .add("description", self.description)
            .add("image_uri", self.image_uri)
            .add_array("items", items_json.span())
            .build();

        // Insert the additional_payment_tokens before the closing brace
        let mut result: ByteArray = "";
        let base_len = base_json.len();
        let mut i: u32 = 0;
        while i < base_len - 1 {
            result.append_byte(base_json[i]);
            i += 1;
        }
        result.append(@",\"additional_payment_tokens\":");
        result.append(@tokens_array_str);
        result.append(@"}");
        result
    }
}

#[generate_trait]
pub impl MetadataAssert of MetadataAssertTrait {
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
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::*;

    // Constants

    const TOKEN1: felt252 = 0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49;
    const TOKEN2: felt252 = 0x01bfe97d729138fc7c2d93c77d6d1d8a24708d5060608017d9b384adf38f04c7;

    // Item tests

    #[test]
    fn test_item_complete() {
        let name: ByteArray = "Item 1";
        let description: ByteArray = "Description of item 1";
        let image_uri: ByteArray = "https://example.com/item1.png";
        let item: ByteArray = ItemImpl::new(name, description, image_uri).jsonify();
        assert_eq!(
            item,
            "{\"name\":\"Item 1\",\"description\":\"Description of item 1\",\"image_uri\":\"https://example.com/item1.png\"}",
        );
    }

    #[test]
    #[should_panic(expected: ('Item: invalid name',))]
    fn test_item_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "https://example.com/item.png";
        ItemImpl::new("", description, image_uri).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Item: invalid description',))]
    fn test_item_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let image_uri: ByteArray = "https://example.com/item.png";
        ItemImpl::new(name, "", image_uri).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Item: invalid image uri',))]
    fn test_item_creation_new_invalid_image_uri() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        ItemImpl::new(name, description, "").jsonify();
    }

    // Metadata tests

    #[test]
    fn test_metadata_complete() {
        let name: ByteArray = "My Starterpack";
        let description: ByteArray = "A description of what's included in this starterpack";
        let image_uri: ByteArray = "https://example.com/starterpack-image.png";
        let items: Span<StarterpackItem> = array![
            ItemTrait::new("Item 1", "Description of item 1", "https://example.com/item1.png"),
            ItemTrait::new("Item 2", "Description of item 2", "https://example.com/item2.png"),
        ]
            .span();
        let tokens: Span<ContractAddress> = array![
            TOKEN1.try_into().unwrap(), TOKEN2.try_into().unwrap(),
        ]
            .span();
        let metadata: ByteArray = StarterpackMetadataImpl::new(
            name, description, image_uri, items, tokens,
        )
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"My Starterpack\",\"description\":\"A description of what's included in this starterpack\",\"image_uri\":\"https://example.com/starterpack-image.png\",\"items\":[{\"name\":\"Item 1\",\"description\":\"Description of item 1\",\"image_uri\":\"https://example.com/item1.png\"},{\"name\":\"Item 2\",\"description\":\"Description of item 2\",\"image_uri\":\"https://example.com/item2.png\"}],\"additional_payment_tokens\":[\"0x124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49\",\"0x1bfe97d729138fc7c2d93c77d6d1d8a24708d5060608017d9b384adf38f04c7\"]}",
        );
    }

    #[test]
    fn test_metadata_empty_items_and_tokens() {
        let name: ByteArray = "My Starterpack";
        let description: ByteArray = "A simple starterpack";
        let image_uri: ByteArray = "https://example.com/image.png";
        let metadata: ByteArray = StarterpackMetadataImpl::new(
            name, description, image_uri, array![].span(), array![].span(),
        )
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"My Starterpack\",\"description\":\"A simple starterpack\",\"image_uri\":\"https://example.com/image.png\",\"items\":[],\"additional_payment_tokens\":[]}",
        );
    }

    #[test]
    fn test_metadata_with_items_no_tokens() {
        let name: ByteArray = "My Starterpack";
        let description: ByteArray = "A starterpack with items";
        let image_uri: ByteArray = "https://example.com/image.png";
        let items: Span<StarterpackItem> = array![
            ItemTrait::new("Item 1", "Description 1", "https://example.com/item1.png"),
        ]
            .span();
        let metadata: ByteArray = StarterpackMetadataImpl::new(
            name, description, image_uri, items, array![].span(),
        )
            .jsonify();
        assert_eq!(
            metadata,
            "{\"name\":\"My Starterpack\",\"description\":\"A starterpack with items\",\"image_uri\":\"https://example.com/image.png\",\"items\":[{\"name\":\"Item 1\",\"description\":\"Description 1\",\"image_uri\":\"https://example.com/item1.png\"}],\"additional_payment_tokens\":[]}",
        );
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid name',))]
    fn test_metadata_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "https://example.com/image.png";
        StarterpackMetadataImpl::new("", description, image_uri, array![].span(), array![].span())
            .jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid description',))]
    fn test_metadata_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let image_uri: ByteArray = "https://example.com/image.png";
        StarterpackMetadataImpl::new(name, "", image_uri, array![].span(), array![].span())
            .jsonify();
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid image uri',))]
    fn test_metadata_creation_new_invalid_image_uri() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        StarterpackMetadataImpl::new(name, description, "", array![].span(), array![].span())
            .jsonify();
    }
}
