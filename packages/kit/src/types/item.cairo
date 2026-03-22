use graffiti::json::JsonImpl;

#[derive(Clone, Drop, Serde)]
pub struct Item {
    pub name: ByteArray,
    pub description: ByteArray,
    pub image_uri: ByteArray,
}

pub mod Errors {
    pub const ITEM_INVALID_NAME: felt252 = 'Item: invalid name';
    pub const ITEM_INVALID_DESCRIPTION: felt252 = 'Item: invalid description';
    pub const ITEM_INVALID_IMAGE_URI: felt252 = 'Item: invalid image uri';
}

#[generate_trait]
pub impl ItemImpl of ItemTrait {
    #[inline]
    fn new(name: ByteArray, description: ByteArray, image_uri: ByteArray) -> Item {
        ItemAssert::assert_valid_name(@name);
        ItemAssert::assert_valid_description(@description);
        ItemAssert::assert_valid_image(@image_uri);
        Item { name, description, image_uri }
    }

    #[inline]
    fn jsonify(self: Item) -> ByteArray {
        JsonImpl::new()
            .add("name", self.name)
            .add("description", self.description)
            .add("image_uri", self.image_uri)
            .build()
    }
}

#[generate_trait]
pub impl ItemAssert of AssertTrait {
    #[inline]
    fn assert_valid_name(name: @ByteArray) {
        assert(name.len() > 0, Errors::ITEM_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, Errors::ITEM_INVALID_DESCRIPTION);
    }

    #[inline]
    fn assert_valid_image(image_uri: @ByteArray) {
        assert(image_uri.len() > 0, Errors::ITEM_INVALID_IMAGE_URI);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_item_complete() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "IMAGE_URI";
        let item: ByteArray = ItemImpl::new(name, description, image_uri).jsonify();
        assert_eq!(
            item, "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"image_uri\":\"IMAGE_URI\"}",
        );
    }

    #[test]
    #[should_panic(expected: ('Item: invalid name',))]
    fn test_item_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let image_uri: ByteArray = "IMAGE_URI";
        ItemImpl::new("", description, image_uri).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Item: invalid description',))]
    fn test_item_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let image_uri: ByteArray = "IMAGE_URI";
        ItemImpl::new(name, "", image_uri).jsonify();
    }

    #[test]
    #[should_panic(expected: ('Item: invalid image uri',))]
    fn test_item_creation_new_invalid_image_uri() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        ItemImpl::new(name, description, "").jsonify();
    }
}
