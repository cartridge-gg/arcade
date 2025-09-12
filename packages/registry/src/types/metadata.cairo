// External imports

use graffiti::json::JsonImpl;

// Internal imports

use registry::helpers::base64::{
    ArrayU8IntoByteArray, Base64Decoder, Base64Encoder, Base64UrlDecoder, Base64UrlEncoder,
    ByteArrayIntoArrayU8,
};

#[generate_trait]
pub impl Metadata of MetadataTrait {
    fn uri(
        external_url: ByteArray,
        description: ByteArray,
        name: ByteArray,
        attributes: ByteArray,
        color: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        image: ByteArray,
    ) -> ByteArray {
        let image = if image != Default::default() {
            Option::Some(image)
        } else {
            Option::None
        };
        let external_url = if external_url != Default::default() {
            Option::Some(external_url)
        } else {
            Option::None
        };
        let description = if description != Default::default() {
            Option::Some(description)
        } else {
            Option::None
        };
        let name = if name != Default::default() {
            Option::Some(name)
        } else {
            Option::None
        };
        let attributes = if attributes != Default::default() {
            Option::Some(attributes)
        } else {
            Option::None
        };
        let color = if color != Default::default() {
            Option::Some(color)
        } else {
            Option::None
        };
        let animation_url = if animation_url != Default::default() {
            Option::Some(animation_url)
        } else {
            Option::None
        };
        let youtube_url = if youtube_url != Default::default() {
            Option::Some(youtube_url)
        } else {
            Option::None
        };
        let json = JsonImpl::new()
            .add_if_some("image", image)
            .add_if_some("external_url", external_url)
            .add_if_some("description", description)
            .add_if_some("name", name)
            .add_if_some("attributes", attributes)
            .add_if_some("animation_url", animation_url)
            .add_if_some("youtube_url", youtube_url)
            .add_if_some("background_color", color)
            .build();
        let json_b64: ByteArray = Base64Encoder::encode(json.into()).into();
        format!("data:application/json;base64,{}", json_b64)
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::MetadataTrait;

    // Constants

    const METADATA_ID: felt252 = 'METADATA';

    #[test]
    fn test_metadata_uri() {
        let uri = MetadataTrait::uri(
            "EXTERNAL_URL",
            "DESCRIPTION",
            "NAME",
            "ATTRIBUTES",
            "COLOR",
            "ANIMATION_URL",
            "YOUTUBE_URL",
            "IMAGE",
        );
        assert_eq!(uri != Default::default(), true);
    }
}
