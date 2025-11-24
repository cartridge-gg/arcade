// Internal imports

use crate::helpers::json::{JsonifiableString, JsonifiableTrait};

// Constants

const COLOR_LENGTH: usize = 7;

#[derive(Clone, Drop)]
pub struct Config {
    pub project: ByteArray,
    pub rpc: ByteArray,
    pub policies: ByteArray,
}

// Implementations

#[generate_trait]
pub impl ConfigImpl of ConfigTrait {
    fn new(project: ByteArray, rpc: ByteArray, policies: ByteArray) -> Config {
        Config { project: project, rpc: rpc, policies: policies }
    }
}

pub impl ConfigJsonifiable of JsonifiableTrait<Config> {
    fn jsonify(self: Config) -> ByteArray {
        let mut string = "{";
        string += JsonifiableString::jsonify("project", format!("{}", self.project));
        string += "," + JsonifiableString::jsonify("rpc", format!("{}", self.rpc));
        string += "," + JsonifiableString::jsonify("policies", format!("{}", self.policies));
        string + "}"
    }
}

pub impl ConfigDefault of core::traits::Default<Config> {
    fn default() -> Config {
        ConfigTrait::new("", "", "")
    }
}

pub impl ConfigPartialEq of core::traits::PartialEq<Config> {
    fn eq(lhs: @Config, rhs: @Config) -> bool {
        lhs.project == rhs.project && lhs.rpc == rhs.rpc && lhs.policies == rhs.policies
    }

    fn ne(lhs: @Config, rhs: @Config) -> bool {
        lhs.project != rhs.project || lhs.rpc != rhs.rpc || lhs.policies != rhs.policies
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{Config, JsonifiableTrait};

    #[test]
    fn test_config_jsonify() {
        let config = Config { project: "project", rpc: "rpc", policies: "policies" };
        let json = config.jsonify();
        assert_eq!(json, "{\"project\":\"project\",\"rpc\":\"rpc\",\"policies\":\"policies\"}");
    }
}
