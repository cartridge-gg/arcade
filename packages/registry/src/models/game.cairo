// Internal imports

pub use registry::models::index::Game;

// Errors

pub mod errors {
    pub const GAME_ALREADY_EXISTS: felt252 = 'Game: already exists';
    pub const GAME_NOT_EXIST: felt252 = 'Game: does not exist';
    pub const GAME_NOT_WHITELISTABLE: felt252 = 'Game: not whitelistable';
    pub const GAME_INVALID_NAME: felt252 = 'Game: invalid name';
    pub const GAME_INVALID_COLOR: felt252 = 'Game: invalid color';
    pub const GAME_INVALID_IMAGE: felt252 = 'Game: invalid image';
}

#[generate_trait]
pub impl GameImpl of GameTrait {
    #[inline]
    fn new(
        id: felt252,
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
    ) -> Game {
        // [Check] Inputs
        GameAssert::assert_valid_name(name.clone());
        GameAssert::assert_valid_color(color.clone());
        GameAssert::assert_valid_image(image.clone());
        // [Return] Game
        Game {
            id: id,
            published: false,
            whitelisted: false,
            color: color,
            image: image,
            image_data: image_data,
            external_url: external_url,
            description: description,
            name: name,
            attributes: attributes,
            animation_url: animation_url,
            youtube_url: youtube_url,
            properties: properties,
            socials: socials,
        }
    }

    #[inline]
    fn update(
        ref self: Game,
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
        // [Check] Inputs
        GameAssert::assert_valid_name(name.clone());
        GameAssert::assert_valid_color(color.clone());
        GameAssert::assert_valid_image(image.clone());
        // [Effect] Update Metadata
        self.color = color;
        self.image = image;
        self.image_data = image_data;
        self.external_url = external_url;
        self.description = description;
        self.name = name;
        self.attributes = attributes;
        self.animation_url = animation_url;
        self.youtube_url = youtube_url;
        self.properties = properties;
        self.socials = socials;
    }

    #[inline]
    fn publish(ref self: Game) {
        // [Effect] Set visibility status
        self.published = true;
    }

    #[inline]
    fn hide(ref self: Game) {
        // [Effect] Reset visibility status
        self.published = false;
    }

    #[inline]
    fn whitelist(ref self: Game) {
        // [Check] Achievement is whitelistable
        GameAssert::assert_is_whitelistable(@self);
        // [Effect] Whitelist
        self.whitelisted = true;
    }

    #[inline]
    fn blacklist(ref self: Game) {
        // [Effect] Reset visibility status
        self.whitelisted = false;
    }

    #[inline]
    fn nullify(ref self: Game) {
        // [Effect] Reset visibility status
        self.published = false;
        self.whitelisted = false;
        // [Effect] Update Metadata
        self.name = Default::default();
    }
}

#[generate_trait]
pub impl GameAssert of AssertTrait {
    #[inline]
    fn assert_does_not_exist(self: @Game) {
        assert(self.name == Default::default(), errors::GAME_ALREADY_EXISTS);
    }

    #[inline]
    fn assert_does_exist(self: @Game) {
        assert(self.name != Default::default(), errors::GAME_NOT_EXIST);
    }

    #[inline]
    fn assert_is_whitelistable(self: @Game) {
        assert(*self.published, errors::GAME_NOT_WHITELISTABLE);
    }

    #[inline]
    fn assert_valid_name(name: ByteArray) {
        // [Check] Name
        assert(name != Default::default(), errors::GAME_INVALID_NAME);
    }

    #[inline]
    fn assert_valid_color(color: ByteArray) {
        // [Check] Color
        assert(color != Default::default(), errors::GAME_INVALID_COLOR);
    }

    #[inline]
    fn assert_valid_image(image: ByteArray) {
        // [Check] Image
        assert(image != Default::default(), errors::GAME_INVALID_IMAGE);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Game, GameAssert, GameTrait};

    // Constants

    const GAME_ID: felt252 = 1;

    // Helpers

    #[generate_trait]
    pub impl Helper of HelperTrait {
        fn new_game() -> Game {
            GameTrait::new(
                GAME_ID,
                "#DEB06B",
                "https://github.com/cartridge-gg/presets/blob/main/configs/eternum/icon.svg?raw=true",
                "https://github.com/cartridge-gg/presets/blob/main/configs/eternum/icon.svg?raw=true",
                "EXTERNAL_URL",
                "DESCRIPTION",
                "NAME",
                "ATTRIBUTES",
                "ANIMATION_URL",
                "YOUTUBE_URL",
                "PROPERTIES",
                "SOCIALS",
            )
        }
    }

    #[test]
    fn test_game_new() {
        let game = Helper::new_game();
        assert_eq!(game.id, GAME_ID);
        assert_eq!(game.published, false);
        assert_eq!(game.whitelisted, false);
        assert_eq!(game.color, "#DEB06B");
        assert_eq!(
            game.image,
            "https://github.com/cartridge-gg/presets/blob/main/configs/eternum/icon.svg?raw=true",
        );
        assert_eq!(
            game.image_data,
            "https://github.com/cartridge-gg/presets/blob/main/configs/eternum/icon.svg?raw=true",
        );
        assert_eq!(game.external_url, "EXTERNAL_URL");
        assert_eq!(game.description, "DESCRIPTION");
        assert_eq!(game.name, "NAME");
        assert_eq!(game.attributes, "ATTRIBUTES");
        assert_eq!(game.properties, "PROPERTIES");
        assert_eq!(game.socials, "SOCIALS");
    }

    #[test]
    fn test_game_publish() {
        let mut game = Helper::new_game();
        game.publish();
        assert_eq!(game.published, true);
    }

    #[test]
    fn test_game_hide() {
        let mut game = Helper::new_game();
        game.publish();
        game.hide();
        assert_eq!(game.published, false);
    }

    #[test]
    fn test_game_whitelist() {
        let mut game = Helper::new_game();
        game.publish();
        game.whitelist();
        assert_eq!(game.whitelisted, true);
    }

    #[test]
    fn test_game_blacklist() {
        let mut game = Helper::new_game();
        game.publish();
        game.whitelist();
        game.blacklist();
        assert_eq!(game.whitelisted, false);
    }

    #[test]
    fn test_game_nullify() {
        let mut game = Helper::new_game();
        game.publish();
        game.whitelist();
        game.nullify();
        assert_eq!(game.whitelisted, false);
        assert_eq!(game.published, false);
        assert_eq!(game.name, Default::default());
    }

    #[test]
    #[should_panic(expected: 'Game: already exists')]
    fn test_game_assert_does_not_exist() {
        let mut game = Helper::new_game();
        game.assert_does_not_exist();
    }

    #[test]
    #[should_panic(expected: 'Game: does not exist')]
    fn test_game_assert_does_exist() {
        let mut game = Helper::new_game();
        game.nullify();
        game.assert_does_exist();
    }

    #[test]
    #[should_panic(expected: 'Game: not whitelistable')]
    fn test_game_assert_is_whitelistable_not_published() {
        let mut game = Helper::new_game();
        game.publish();
        game.hide();
        game.whitelist();
    }
}
