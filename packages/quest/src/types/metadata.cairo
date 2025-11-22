// Imports

use graffiti::json::JsonImpl;

// Errors

pub mod errors {
    pub const METADATA_INVALID_NAME: felt252 = 'Metadata: invalid name';
    pub const METADATA_INVALID_DESCRIPTION: felt252 = 'Metadata: invalid description';
    pub const METADATA_INVALID_HIDDEN: felt252 = 'Metadata: invalid hidden';
    pub const METADATA_INVALID_INDEX: felt252 = 'Metadata: invalid index';
    pub const METADATA_INVALID_GROUP: felt252 = 'Metadata: invalid group';
    pub const METADATA_INVALID_ICON: felt252 = 'Metadata: invalid icon';
    pub const METADATA_INVALID_DATA: felt252 = 'Metadata: invalid data';
}

// Implementations

#[generate_trait]
pub impl Metadata of MetadataTrait {
    #[inline]
    fn jsonify(
        name: ByteArray,
        description: ByteArray,
        hidden: bool,
        index: Option<u8>,
        group: Option<ByteArray>,
        icon: Option<ByteArray>,
        data: Option<ByteArray>,
    ) -> ByteArray {
        // [Check] Inputs
        MetadataAssert::assert_valid_name(@name);
        MetadataAssert::assert_valid_description(@description);
        // [Return] Metadata
        let hidden: ByteArray = if hidden {
            "true"
        } else {
            "false"
        };
        JsonImpl::new()
            .add("name", name)
            .add("description", description)
            .add("hidden", hidden)
            .add_if_some("index", index.map(|index| format!("{}", index)))
            .add_if_some("group", group)
            .add_if_some("icon", icon)
            .add_if_some("data", data)
            .build()
    }
}

#[generate_trait]
pub impl MetadataAssert of AssertTrait {
    #[inline]
    fn assert_valid_name(name: @ByteArray) {
        assert(name.len() > 0, errors::METADATA_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, errors::METADATA_INVALID_DESCRIPTION);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::*;

    // Constants

    const HIDDEN: bool = false;
    const INDEX: u8 = 0;
    const GROUP: felt252 = 'GROUP';
    const ICON: felt252 = 'ICON';

    #[test]
    fn test_metadata_complete() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let index: Option<u8> = Option::Some(0);
        let group: Option<ByteArray> = Option::Some("GROUP");
        let icon: Option<ByteArray> = Option::Some("ICON");
        let data: Option<ByteArray> = Option::Some("DATA");
        let metadata: ByteArray = Metadata::jsonify(
            name, description, HIDDEN, index, group, icon, data,
        );
        assert_eq!(
            metadata,
            "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"hidden\":\"false\",\"index\":\"0\",\"group\":\"GROUP\",\"icon\":\"ICON\",\"data\":\"DATA\"}",
        );
    }

    #[test]
    fn test_metadata_empty() {
        let name: ByteArray = "NAME";
        let description: ByteArray = "DESCRIPTION";
        let metadata: ByteArray = Metadata::jsonify(
            name, description, HIDDEN, Option::None, Option::None, Option::None, Option::None,
        );
        assert_eq!(
            metadata, "{\"name\":\"NAME\",\"description\":\"DESCRIPTION\",\"hidden\":\"false\"}",
        );
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid name',))]
    fn test_metadata_creation_new_invalid_name() {
        let description: ByteArray = "DESCRIPTION";
        let index: Option<u8> = Option::Some(0);
        let group: Option<ByteArray> = Option::Some("GROUP");
        let icon: Option<ByteArray> = Option::Some("ICON");
        let data: Option<ByteArray> = Option::Some("DATA");
        Metadata::jsonify("", description, HIDDEN, index, group, icon, data);
    }

    #[test]
    #[should_panic(expected: ('Metadata: invalid description',))]
    fn test_metadata_creation_new_invalid_description() {
        let name: ByteArray = "NAME";
        let index: Option<u8> = Option::Some(0);
        let group: Option<ByteArray> = Option::Some("GROUP");
        let icon: Option<ByteArray> = Option::Some("ICON");
        let data: Option<ByteArray> = Option::Some("DATA");
        Metadata::jsonify(name, "", HIDDEN, index, group, icon, data);
    }
}

