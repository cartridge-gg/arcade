// Internal imports

use crate::helpers::json::JsonifiableTrait;
pub use crate::models::index::Edition;
use crate::types::config::Config;

// Errors

pub mod errors {
    pub const EDITION_ALREADY_EXISTS: felt252 = 'Edition: already exists';
    pub const EDITION_NOT_EXIST: felt252 = 'Edition: does not exist';
    pub const EDITION_INVALID_WORLD: felt252 = 'Edition: invalid world';
    pub const EDITION_INVALID_NAMESPACE: felt252 = 'Edition: invalid namespace';
    pub const EDITION_INVALID_CONFIG: felt252 = 'Edition: invalid config';
    pub const EDITION_NOT_WHITELISTABLE: felt252 = 'Edition: not whitelistable';
    pub const EDITION_INVALID_NAME: felt252 = 'Edition: invalid name';
    pub const EDITION_INVALID_COLOR: felt252 = 'Edition: invalid color';
    pub const EDITION_INVALID_IMAGE: felt252 = 'Edition: invalid image';
}

#[generate_trait]
pub impl EditionImpl of EditionTrait {
    #[inline]
    fn new(
        id: felt252,
        world_address: felt252,
        namespace: felt252,
        game_id: felt252,
        config: Config,
        color: ByteArray,
        image: ByteArray,
        image_data: ByteArray,
        external_url: ByteArray,
        description: ByteArray,
        name: ByteArray,
        attributes: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        properties: ByteArray,
        socials: ByteArray,
    ) -> Edition {
        // [Check] Inputs
        EditionAssert::assert_valid_config(config.clone());
        EditionAssert::assert_valid_world(world_address);
        EditionAssert::assert_valid_namespace(namespace);

        // [Return] Edition
        Edition {
            id: id,
            world_address: world_address,
            namespace: namespace,
            published: false,
            whitelisted: false,
            priority: 0,
            game_id: game_id,
            config: config.jsonify(),
            color: color,
            image: image,
            image_data: image_data,
            external_url: external_url,
            description: description,
            name: name,
            animation_url: animation_url,
            youtube_url: youtube_url,
            attributes: attributes,
            properties: properties,
            socials: socials,
        }
    }

    #[inline]
    fn set_priority(ref self: Edition, priority: u8) {
        // [Update] Priority
        self.priority = priority;
    }

    #[inline]
    fn update(
        ref self: Edition,
        config: Config,
        color: ByteArray,
        image: ByteArray,
        image_data: ByteArray,
        external_url: ByteArray,
        description: ByteArray,
        name: ByteArray,
        attributes: ByteArray,
        animation_url: ByteArray,
        youtube_url: ByteArray,
        properties: ByteArray,
        socials: ByteArray,
    ) {
        // [Effect] Update Edition
        self.config = config.jsonify();
        self.color = color;
        self.image = image;
        self.image_data = image_data;
        self.external_url = external_url;
        self.description = description;
        self.name = name;
        self.animation_url = animation_url;
        self.youtube_url = youtube_url;
        self.attributes = attributes;
        self.properties = properties;
        self.socials = socials;
        // [Effect] Reset visibility status
        self.published = false;
        self.whitelisted = false;
    }

    #[inline]
    fn publish(ref self: Edition) {
        // [Effect] Set visibility status
        self.published = true;
    }

    #[inline]
    fn hide(ref self: Edition) {
        // [Effect] Reset visibility status
        self.published = false;
    }

    #[inline]
    fn whitelist(ref self: Edition) {
        // [Check] Achievement is whitelistable
        EditionAssert::assert_is_whitelistable(@self);
        // [Effect] Whitelist
        self.whitelisted = true;
    }

    #[inline]
    fn blacklist(ref self: Edition) {
        // [Effect] Reset visibility status
        self.whitelisted = false;
    }

    #[inline]
    fn nullify(ref self: Edition) {
        self.published = false;
        self.whitelisted = false;
        self.world_address = Default::default();
    }
}

#[generate_trait]
pub impl EditionAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Edition) {
        assert(self.world_address == Default::default(), errors::EDITION_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Edition) {
        assert(self.world_address != Default::default(), errors::EDITION_NOT_EXIST);
    }

    #[inline]
    fn assert_valid_config(config: Config) {
        assert(config != Default::default(), errors::EDITION_INVALID_CONFIG);
    }

    #[inline]
    fn assert_valid_world(world: felt252) {
        assert(world != 0, errors::EDITION_INVALID_WORLD);
    }

    #[inline]
    fn assert_valid_namespace(namespace: felt252) {
        assert(namespace != 0, errors::EDITION_INVALID_NAMESPACE);
    }

    #[inline]
    fn assert_is_whitelistable(self: @Edition) {
        assert(*self.published, errors::EDITION_NOT_WHITELISTABLE);
    }

    #[inline]
    fn assert_valid_name(name: ByteArray) {
        // [Check] Name
        assert(name != Default::default(), errors::EDITION_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_color(color: ByteArray) {
        // [Check] Color
        assert(color != Default::default(), errors::EDITION_INVALID_COLOR);
    }

    #[inline]
    fn assert_valid_image(image: ByteArray) {
        // [Check] Image
        assert(image != Default::default(), errors::EDITION_INVALID_IMAGE);
    }
}

#[cfg(test)]
mod tests {
    // Internal imports

    use crate::types::config::{Config, ConfigJsonifiable, ConfigTrait};

    // Local imports

    use super::{Edition, EditionAssert, EditionTrait};

    // Constants

    const WORLD_ADDRESS: felt252 = 'WORLD';
    const NAMESPACE: felt252 = 'NAMESPACE';
    const EDITION_ID: felt252 = 2;
    const GAME_ID: felt252 = 1;

    // Helpers

    #[generate_trait]
    pub impl Helper of HelperTrait {
        fn new_edition() -> Edition {
            let config = Self::config();
            EditionTrait::new(
                EDITION_ID,
                WORLD_ADDRESS,
                NAMESPACE,
                GAME_ID,
                config,
                "COLOR",
                "IMAGE",
                "IMAGE_DATA",
                "EXTERNAL_URL",
                "DESCRIPTION",
                "NAME",
                "ANIMATION_URL",
                "YOUTUBE_URL",
                "ATTRIBUTES",
                "PROPERTIES",
                "SOCIALS",
            )
        }

        fn config() -> Config {
            ConfigTrait::new("PROJECT", "RPC", "POLICIES")
        }
    }

    #[test]
    fn test_edition_new() {
        let edition = Helper::new_edition();
        let config = Helper::config();
        assert_eq!(edition.world_address, WORLD_ADDRESS);
        assert_eq!(edition.namespace, NAMESPACE);
        assert_eq!(edition.game_id, GAME_ID);
        assert_eq!(edition.published, false);
        assert_eq!(edition.whitelisted, false);
        assert_eq!(edition.priority, 0);
        assert_eq!(edition.config, config.jsonify());
    }

    #[test]
    fn test_edition_set_priority() {
        let mut edition = Helper::new_edition();
        edition.set_priority(1);
        assert_eq!(edition.priority, 1);
    }

    #[test]
    fn test_edition_update() {
        let mut edition = Helper::new_edition();
        let project = "TCEJORP";
        let rpc = "CPR";
        let policies = "SEICILOP";
        let config = ConfigTrait::new(project, rpc, policies);
        edition
            .update(
                config.clone(),
                edition.color.clone(),
                edition.image.clone(),
                edition.image_data.clone(),
                edition.external_url.clone(),
                edition.description.clone(),
                edition.name.clone(),
                edition.animation_url.clone(),
                edition.youtube_url.clone(),
                edition.attributes.clone(),
                edition.properties.clone(),
                edition.socials.clone(),
            );
        assert_eq!(edition.config, config.jsonify());
    }

    #[test]
    fn test_edition_publish() {
        let mut edition = Helper::new_edition();
        edition.publish();
        assert_eq!(edition.published, true);
    }

    #[test]
    fn test_edition_hide() {
        let mut edition = Helper::new_edition();
        edition.publish();
        edition.hide();
        assert_eq!(edition.published, false);
    }

    #[test]
    fn test_edition_whitelist() {
        let mut edition = Helper::new_edition();
        edition.publish();
        edition.whitelist();
        assert_eq!(edition.whitelisted, true);
    }

    #[test]
    fn test_edition_blacklist() {
        let mut edition = Helper::new_edition();
        edition.publish();
        edition.whitelist();
        edition.blacklist();
        assert_eq!(edition.whitelisted, false);
    }

    #[test]
    fn test_edition_nullify() {
        let mut edition = Helper::new_edition();
        edition.nullify();
        assert_eq!(edition.world_address, Default::default());
        assert_eq!(edition.whitelisted, false);
        assert_eq!(edition.published, false);
    }

    #[test]
    #[should_panic(expected: 'Edition: already exists')]
    fn test_edition_assert_does_not_exist() {
        let mut edition = Helper::new_edition();
        edition.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Edition: does not exist')]
    fn test_edition_assert_does_exist() {
        let mut edition = Helper::new_edition();
        edition.world_address = Default::default();
        edition.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Edition: invalid world')]
    fn test_edition_assert_valid_world_zero() {
        EditionAssert::assert_valid_world(0);
    }

    #[test]
    #[should_panic(expected: 'Edition: invalid namespace')]
    fn test_edition_assert_valid_namespace_zero() {
        EditionAssert::assert_valid_namespace(0);
    }

    #[test]
    #[should_panic(expected: 'Edition: invalid config')]
    fn test_edition_assert_valid_config_zero() {
        let config = Default::default();
        EditionAssert::assert_valid_config(config);
    }

    #[test]
    #[should_panic(expected: 'Edition: not whitelistable')]
    fn test_edition_assert_is_whitelistable_not_published() {
        let mut edition = Helper::new_edition();
        edition.publish();
        edition.hide();
        edition.whitelist();
    }
}
