use graffiti::json::JsonImpl;
use collection::types::attribute::{Attribute, AttributeTrait};

#[derive(Drop, Serde)]
pub struct ContractMetadata {
    // OpenSea standard metadata
    pub name: ByteArray,
    pub symbol: Option<ByteArray>,
    pub description: Option<ByteArray>,
    pub image: Option<ByteArray>,
    pub banner_image: Option<ByteArray>,
    pub featured_image: Option<ByteArray>,
    pub external_link: Option<ByteArray>,
    pub collaborators: Option<Span<ByteArray>>,
    // Arcade extra metadata
    pub properties: Option<Span<Attribute>>,
    pub socials: Option<Span<Attribute>>,
}

#[generate_trait]
pub impl ContractMetadataImpl of ContractMetadataTrait {
    fn jsonify(self: ContractMetadata) -> ByteArray {
        let properties: Option<Span<ByteArray>> = match self.properties {
            Option::Some(properties) => {
                let mut properties = properties;
                let mut items: Array<ByteArray> = array![];
                while let Option::Some(item) = properties.pop_front() {
                    items.append(item.jsonify());
                };
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
                };
                Option::Some(items.span())
            },
            Option::None => Option::None,
        };
        JsonImpl::new()
            .add("name", self.name)
            .add_if_some("symbol", self.symbol)
            .add_if_some("description", self.description)
            .add_if_some("image", self.image)
            .add_if_some("banner_image", self.banner_image)
            .add_if_some("featured_image", self.featured_image)
            .add_if_some("external_link", self.external_link)
            .add_array_if_some("collaborators", self.collaborators)
            .add_array_if_some("properties", properties)
            .add_array_if_some("socials", socials)
            .build()
    }
}

#[cfg(test)]
mod tests {
    use collection::types::attribute::Attribute;
    use super::{ContractMetadata, ContractMetadataTrait};

    #[test]
    fn test_jsonify_full() {
        let metadata = ContractMetadata {
            name: "Name",
            symbol: Option::Some("Symbol"),
            description: Option::Some("Description"),
            image: Option::Some("Image"),
            banner_image: Option::Some("Banner Image"),
            featured_image: Option::Some("Featured Image"),
            external_link: Option::Some("External Link"),
            collaborators: Option::Some(array!["Collaborators"].span()),
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
            "{\"name\":\"Name\",\"symbol\":\"Symbol\",\"description\":\"Description\",\"image\":\"Image\",\"banner_image\":\"Banner Image\",\"featured_image\":\"Featured Image\",\"external_link\":\"External Link\",\"collaborators\":[\"Collaborators\"],\"properties\":[{\"trait_type\":\"Property\",\"value\":\"Value\"}],\"socials\":[{\"trait_type\":\"Social\",\"value\":\"Value\"}]}",
        );
    }

    #[test]
    fn test_jsonify_empty() {
        let metadata = ContractMetadata {
            name: "Name",
            symbol: Option::None,
            description: Option::None,
            image: Option::None,
            banner_image: Option::None,
            featured_image: Option::None,
            external_link: Option::None,
            collaborators: Option::None,
            properties: Option::None,
            socials: Option::None,
        };
        let json = metadata.jsonify();
        assert_eq!(json, "{\"name\":\"Name\"}");
    }
}
