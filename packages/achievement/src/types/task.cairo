// Types

#[derive(Clone, Drop, Serde, Introspect, DojoStore)]
pub struct Task {
    pub id: felt252,
    pub total: u128,
    pub description: ByteArray,
}

// Errors

pub mod errors {
    pub const TASK_INVALID_ID: felt252 = 'Task: invalid id';
    pub const TASK_INVALID_DESCRIPTION: felt252 = 'Task: invalid description';
    pub const TASK_INVALID_TOTAL: felt252 = 'Task: invalid total';
}

// Implementations

#[generate_trait]
pub impl TaskImpl of TaskTrait {
    #[inline]
    fn new(id: felt252, total: u128, description: ByteArray) -> Task {
        // [Check] Inputs
        TaskAssert::assert_valid_id(id);
        TaskAssert::assert_valid_total(total);
        TaskAssert::assert_valid_description(@description);
        // [Return] Task
        Task { id, total, description }
    }
}

#[generate_trait]
pub impl TaskAssert of AssertTrait {
    #[inline]
    fn assert_valid_id(id: felt252) {
        assert(id != 0, errors::TASK_INVALID_ID);
    }

    #[inline]
    fn assert_valid_total(total: u128) {
        assert(total > 0, errors::TASK_INVALID_TOTAL);
    }

    #[inline]
    fn assert_valid_description(description: @ByteArray) {
        assert(description.len() > 0, errors::TASK_INVALID_DESCRIPTION);
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::TaskTrait;

    // Constants

    const ID: felt252 = 'TASK';
    const TOTAL: u128 = 100;

    #[test]
    fn test_task_creation_new() {
        let achievement = TaskTrait::new(ID, TOTAL, "DESCRIPTION");
        assert(achievement.id == ID, 'Invalid ID');
        assert(achievement.total == TOTAL, 'Invalid total');
        assert(achievement.description == "DESCRIPTION", 'Invalid description');
    }

    #[test]
    #[should_panic(expected: ('Task: invalid id',))]
    fn test_task_creation_new_invalid_id() {
        TaskTrait::new(0, TOTAL, "DESCRIPTION");
    }


    #[test]
    #[should_panic(expected: ('Task: invalid total',))]
    fn test_task_creation_new_invalid_total() {
        TaskTrait::new(ID, 0, "DESCRIPTION");
    }

    #[test]
    #[should_panic(expected: ('Task: invalid description',))]
    fn test_task_creation_new_invalid_description() {
        TaskTrait::new(ID, TOTAL, "");
    }
}

