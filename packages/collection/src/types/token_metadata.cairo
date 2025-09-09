use collection::types::attribute::{Attribute, AttributeTrait};
use graffiti::json::JsonImpl;

#[derive(Drop, Serde)]
pub struct TokenMetadata {
    // OpenSea standard metadata
    pub image: Option<ByteArray>,
    pub image_data: Option<ByteArray>,
    pub external_url: Option<ByteArray>,
    pub description: Option<ByteArray>,
    pub name: Option<ByteArray>,
    pub attributes: Option<Span<Attribute>>,
    pub background_color: Option<ByteArray>,
    pub animation_url: Option<ByteArray>,
    pub youtube_url: Option<ByteArray>,
    // Arcade extra metadata
    pub properties: Option<Span<Attribute>>,
    pub socials: Option<Span<Attribute>>,
}

#[generate_trait]
pub impl TokenMetadataImpl of TokenMetadataTrait {
    fn jsonify(self: TokenMetadata) -> ByteArray {
        let attributes: Option<Span<ByteArray>> = match self.attributes {
            Option::Some(attributes) => {
                let mut attributes = attributes;
                let mut items: Array<ByteArray> = array![];
                while let Option::Some(item) = attributes.pop_front() {
                    items.append(item.jsonify());
                }
                Option::Some(items.span())
            },
            Option::None => Option::None,
        };
        let properties: Option<Span<ByteArray>> = match self.properties {
            Option::Some(properties) => {
                let mut properties = properties;
                let mut items: Array<ByteArray> = array![];
                while let Option::Some(item) = properties.pop_front() {
                    items.append(item.jsonify());
                }
                Option::Some(items.span())
            },
            Option::None => Option::None,
        };
        let socials: Option<Span<ByteArray>> = match self.socials {
            Option::Some(socials) => {
                let mut socials = socials;
                let mut items: Array<ByteArray> = array![];
                while let Option::Some(item) = socials.pop_front() {
                    items.append(item.jsonify());
                }
                Option::Some(items.span())
            },
            Option::None => Option::None,
        };

        JsonImpl::new()
            .add_if_some("name", self.name)
            .add_if_some("description", self.description)
            .add_if_some("image", self.image)
            .add_if_some("image_data", self.image_data)
            .add_if_some("external_url", self.external_url)
            .add_array_if_some("attributes", attributes)
            .add_if_some("background_color", self.background_color)
            .add_if_some("animation_url", self.animation_url)
            .add_if_some("youtube_url", self.youtube_url)
            .add_array_if_some("properties", properties)
            .add_array_if_some("socials", socials)
            .build()
    }
}

#[cfg(test)]
mod tests {
    use collection::types::attribute::Attribute;
    use super::{TokenMetadata, TokenMetadataTrait};

    #[test]
    fn test_token_metadata_jsonify_full() {
        let metadata = TokenMetadata {
            name: Option::Some("Name"),
            description: Option::Some("Description"),
            image: Option::Some("Image"),
            image_data: Option::Some("Image Data"),
            external_url: Option::Some("External URL"),
            attributes: Option::Some(
                array![Attribute { trait_type: "Trait Type", value: "Value" }].span(),
            ),
            background_color: Option::Some("Background Color"),
            animation_url: Option::Some("Animation URL"),
            youtube_url: Option::Some("Youtube URL"),
            properties: Option::Some(
                array![Attribute { trait_type: "Property", value: "Value" }].span(),
            ),
            socials: Option::Some(
                array![Attribute { trait_type: "Social", value: "Value" }].span(),
            ),
        };
        let json = metadata.jsonify();
        assert_eq!(
            json,
            "{\"name\":\"Name\",\"description\":\"Description\",\"image\":\"Image\",\"image_data\":\"Image Data\",\"external_url\":\"External URL\",\"attributes\":[{\"trait_type\":\"Trait Type\",\"value\":\"Value\"}],\"background_color\":\"Background Color\",\"animation_url\":\"Animation URL\",\"youtube_url\":\"Youtube URL\",\"properties\":[{\"trait_type\":\"Property\",\"value\":\"Value\"}],\"socials\":[{\"trait_type\":\"Social\",\"value\":\"Value\"}]}",
        );
    }

    #[test]
    fn test_token_metadata_jsonify_empty() {
        let metadata = TokenMetadata {
            name: Option::None,
            description: Option::None,
            image: Option::None,
            image_data: Option::None,
            external_url: Option::None,
            attributes: Option::None,
            background_color: Option::None,
            animation_url: Option::None,
            youtube_url: Option::None,
            properties: Option::None,
            socials: Option::None,
        };
        let json = metadata.jsonify();
        assert_eq!(json, "{}");
    }
}
