#[derive(Clone, Drop, Serde)]
pub struct Condition {
    pub method: ByteArray,
    pub provider: ByteArray,
    pub account: ByteArray,
    pub id: ByteArray,
}

pub mod Errors {
    pub const CONDITION_INVALID_METHOD: felt252 = 'Condition: invalid method';
    pub const CONDITION_INVALID_PROVIDER: felt252 = 'Condition: invalid provider';
    pub const CONDITION_INVALID_ACCOUNT: felt252 = 'Condition: invalid account';
}

#[generate_trait]
pub impl ConditionImpl of ConditionTrait {
    #[inline]
    fn new(method: ByteArray, provider: ByteArray, account: ByteArray, id: ByteArray) -> Condition {
        ConditionAssert::assert_valid_method(@method);
        ConditionAssert::assert_valid_provider(@provider);
        Condition { method, provider, account, id }
    }

    #[inline]
    fn span(self: Condition) -> Span<ByteArray> {
        if self.method.len() == 0 || self.provider.len() == 0 || self.account.len() == 0 {
            return [].span();
        }
        if self.id.len() == 0 {
            return array![self.method, self.provider, self.account].span();
        }
        array![self.method, self.provider, self.account, self.id].span()
    }
}

#[generate_trait]
pub impl Twitter of TwitterTrait {
    fn new(account: ByteArray, id: ByteArray) -> Condition {
        ConditionTrait::new("social-claim", "TWITTER", account, id)
    }
}

#[generate_trait]
pub impl ConditionAssert of AssertTrait {
    #[inline]
    fn assert_valid_method(method: @ByteArray) {
        assert(method == @"social-claim" || method.len() == 0, Errors::CONDITION_INVALID_METHOD);
    }

    #[inline]
    fn assert_valid_provider(provider: @ByteArray) {
        assert(provider == @"TWITTER" || provider.len() == 0, Errors::CONDITION_INVALID_PROVIDER);
    }
}

pub impl ConditionDefault of Default<Condition> {
    fn default() -> Condition {
        ConditionTrait::new("", "", "", "")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_condition_new() {
        let condition: Condition = ConditionTrait::new(
            "social-claim", "TWITTER", "ACCOUNT", "1234",
        );
        assert_eq!(condition.method, "social-claim");
        assert_eq!(condition.provider, "TWITTER");
        assert_eq!(condition.account, "ACCOUNT");
        assert_eq!(condition.id, "1234");
    }

    #[test]
    fn test_condition_span() {
        let condition: Condition = ConditionTrait::new(
            "social-claim", "TWITTER", "ACCOUNT", "1234",
        );
        let span: Span<ByteArray> = condition.span();
        assert_eq!(span, array!["social-claim", "TWITTER", "ACCOUNT", "1234"].span());
    }

    #[test]
    fn test_condition_default() {
        let condition: Condition = Default::default();
        assert_eq!(condition.method, "");
        assert_eq!(condition.provider, "");
        assert_eq!(condition.account, "");
        assert_eq!(condition.id, "");
        assert_eq!(condition.span(), [].span());
    }

    #[test]
    #[should_panic(expected: ('Condition: invalid method',))]
    fn test_condition_new_invalid_method() {
        ConditionTrait::new("invalid-method", "TWITTER", "ACCOUNT", "1234");
    }

    #[test]
    #[should_panic(expected: ('Condition: invalid provider',))]
    fn test_condition_new_invalid_provider() {
        ConditionTrait::new("social-claim", "invalid-provider", "ACCOUNT", "1234");
    }

    #[test]
    fn test_condition_new_invalid_account() {
        let condition = ConditionTrait::new("social-claim", "TWITTER", "", "1234");
        assert_eq!(condition.span(), [].span());
    }
}
